import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { TAG_AUTOMATION_EVENTS } from "../tags/events/tag-automation.events";

import {
  CreateCatDto,
  UpdateCatDto,
  CatQueryDto,
  KittenQueryDto,
  CreateWeightRecordDto,
  UpdateWeightRecordDto,
  WeightRecordQueryDto,
  WeightRecordResponse,
  WeightRecordsListResponse,
  CreateBulkWeightRecordsDto,
  BulkWeightRecordsResponse,
} from "./dto";
import { catWithRelationsInclude, CatWithRelations } from "./types/cat.types";

@Injectable()
export class CatsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createCatDto: CreateCatDto) {
    const {
      name,
      gender,
      birthDate,
      breedId,
      coatColorId,
      microchipNumber,
      registrationNumber,
      description,
      isInHouse,
      fatherId,
      motherId,
      tagIds,
    } = createCatDto;

    // Validate breed if provided
    let breedIdToConnect: string | undefined;
    if (breedId) {
      // Try to find by ID first
      let breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      
      // If not found by ID, try to find by name
      if (!breed) {
        breed = await this.prisma.breed.findFirst({
          where: { name: breedId },
        });
      }
      
      if (!breed) {
        throw new BadRequestException("Invalid breed ID or name");
      }
      
      breedIdToConnect = breed.id;
    }

    // Validate coatColor if provided
    let coatColorIdToConnect: string | undefined;
    if (coatColorId) {
      // Try to find by ID first
      let color = await this.prisma.coatColor.findUnique({
        where: { id: coatColorId },
      });
      
      // If not found by ID, try to find by name
      if (!color) {
        color = await this.prisma.coatColor.findFirst({
          where: { name: coatColorId },
        });
      }
      
      if (!color) {
        throw new BadRequestException("Invalid coat color ID or name");
      }
      
      coatColorIdToConnect = color.id;
    }

    const birth = new Date(birthDate);

    try {
      // Create the cat
      let cat = await this.prisma.cat.create({
        data: {
          name,
          gender,
          birthDate: birth,
          ...(registrationNumber ? { registrationNumber } : {}),
          ...(microchipNumber ? { microchipNumber } : {}),
          ...(description ? { description } : {}),
          isInHouse: isInHouse ?? true,
          ...(breedIdToConnect ? { breed: { connect: { id: breedIdToConnect } } } : {}),
          ...(coatColorIdToConnect ? { coatColor: { connect: { id: coatColorIdToConnect } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: catWithRelationsInclude,
      });

      // Handle tag assignments if provided
      if (tagIds && tagIds.length > 0) {
        await this.prisma.catTag.createMany({
          data: tagIds.map((tagId) => ({
            catId: cat.id,
            tagId,
          })),
          skipDuplicates: true,
        });

        // Fetch the cat again with tags
        const updatedCat = await this.prisma.cat.findUnique({
          where: { id: cat.id },
          include: catWithRelationsInclude,
        });
        if (updatedCat) {
          cat = updatedCat;
        }
      }

      // 子猫登録イベントを発火（母猫または父猫が設定されている場合）
      if (cat && (motherId || fatherId)) {
        this.eventEmitter.emit(TAG_AUTOMATION_EVENTS.KITTEN_REGISTERED, {
          eventType: "KITTEN_REGISTERED" as const,
          kittenId: cat.id,
          motherId: motherId || undefined,
          fatherId: fatherId || undefined,
        });
      }

      return cat;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("microchipNumber") || target?.includes("microchip_number")) {
          throw new ConflictException("Cat with the same microchip number already exists");
        }
        throw new ConflictException("Cat with the same registration number already exists");
      }
      throw error;
    }
  }

  async findAll(query: CatQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      breedId,
      coatColorId,
      gender,
      isInHouse,
      ageMin,
      ageMax,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.CatWhereInput = {};

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { microchipNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (breedId) where.breedId = breedId;
    if (coatColorId) where.coatColorId = coatColorId;
    if (gender) {
      where.gender = gender;
    }
    if (isInHouse !== undefined) {
      where.isInHouse = isInHouse;
    }

    // Age filters
    if (ageMin || ageMax) {
      const now = new Date();
      const birthFilter: Prisma.DateTimeFilter = {};
      if (ageMax) {
        const minBirthDate = new Date(
          now.getFullYear() - ageMax,
          now.getMonth(),
          now.getDate(),
        );
        birthFilter.gte = minBirthDate;
      }
      if (ageMin) {
        const maxBirthDate = new Date(
          now.getFullYear() - ageMin,
          now.getMonth(),
          now.getDate(),
        );
        birthFilter.lte = maxBirthDate;
      }
      if (birthFilter.gte || birthFilter.lte) {
        where.birthDate = birthFilter;
      }
    }

    type Sortable = "createdAt" | "updatedAt" | "name" | "birthDate";
    const orderBy: Prisma.CatOrderByWithRelationInput = {
      [sortBy as Sortable]: sortOrder,
    } as Prisma.CatOrderByWithRelationInput;

    const [cats, total] = (await Promise.all([
      this.prisma.cat.findMany({
        where,
        skip,
        take: limit,
        include: catWithRelationsInclude,
        orderBy,
      }),
      this.prisma.cat.count({ where }),
    ])) as [CatWithRelations[], number];

    return {
      data: cats,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cat = await this.prisma.cat.findUnique({
      where: { id },
      include: catWithRelationsInclude,
    });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    return cat;
  }

  async update(id: string, updateCatDto: UpdateCatDto) {
    const existingCat = await this.prisma.cat.findUnique({
      where: { id },
    });

    if (!existingCat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    const {
      name,
      gender,
      birthDate,
      breedId,
      coatColorId,
      microchipNumber,
      registrationNumber,
      description,
      isInHouse,
      fatherId,
      motherId,
      tagIds,
    } = updateCatDto;

    // Validate breed if provided
    let breedIdToConnect: string | undefined;
    if (breedId) {
      // Try to find by ID first
      let breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      
      // If not found by ID, try to find by name
      if (!breed) {
        breed = await this.prisma.breed.findFirst({
          where: { name: breedId },
        });
      }
      
      if (!breed) {
        throw new BadRequestException("Invalid breed ID or name");
      }
      
      breedIdToConnect = breed.id;
    }

    // Validate color if provided
    let coatColorIdToConnect: string | undefined;
    if (coatColorId) {
      // Try to find by ID first
      let color = await this.prisma.coatColor.findUnique({
        where: { id: coatColorId },
      });
      
      // If not found by ID, try to find by name
      if (!color) {
        color = await this.prisma.coatColor.findFirst({
          where: { name: coatColorId },
        });
      }
      
      if (!color) {
        throw new BadRequestException("Invalid coat color ID or name");
      }
      
      coatColorIdToConnect = color.id;
    }

    const birth = birthDate ? new Date(birthDate) : undefined;

    try {
      // タグの更新処理（tagIdsが指定されている場合）
      if (tagIds !== undefined) {
        // 既存のタグを全て削除
        await this.prisma.catTag.deleteMany({
          where: { catId: id },
        });

        // 新しいタグを追加
        if (tagIds.length > 0) {
          await this.prisma.catTag.createMany({
            data: tagIds.map((tagId) => ({
              catId: id,
              tagId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return await this.prisma.cat.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(gender ? { gender } : {}),
          ...(birth ? { birthDate: birth } : {}),
          ...(registrationNumber !== undefined ? { registrationNumber } : {}),
          ...(microchipNumber !== undefined ? { microchipNumber } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(isInHouse !== undefined ? { isInHouse } : {}),
          ...(breedIdToConnect ? { breed: { connect: { id: breedIdToConnect } } } : {}),
          ...(coatColorIdToConnect ? { coatColor: { connect: { id: coatColorIdToConnect } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: catWithRelationsInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("microchipNumber") || target?.includes("microchip_number")) {
          throw new ConflictException("Cat with the same microchip number already exists");
        }
        throw new ConflictException("Cat with the same registration number already exists");
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existingCat = await this.prisma.cat.findUnique({
      where: { id },
    });

    if (!existingCat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    await this.prisma.kittenDisposition.deleteMany({
      where: { kittenId: id },
    });

    return this.prisma.cat.delete({
      where: { id },
      include: catWithRelationsInclude,
    });
  }

  async getBreedingHistory(id: string) {
    const cat = await this.findOne(id);

    const breedingRecords = await this.prisma.breedingRecord.findMany({
      where: {
        OR: [{ maleId: id }, { femaleId: id }],
      },
      include: {
        male: {
          include: {
            breed: true,
            coatColor: true,
          },
        },
        female: {
          include: {
            breed: true,
            coatColor: true,
          },
        },
        recorder: true,
      },
      orderBy: {
        breedingDate: "desc",
      },
    });

    return {
      cat,
      breedingRecords,
    };
  }

  async getCareHistory(id: string) {
    const cat = await this.findOne(id);

    const careRecords = await this.prisma.careRecord.findMany({
      where: { catId: id },
      include: {
        recorder: true,
      },
      orderBy: {
        careDate: "desc",
      },
    });

    return {
      cat,
      careRecords,
    };
  }

  async getStatistics() {
    const [totalCats, genderGroups, breedStats] = await Promise.all([
      this.prisma.cat.count(),
      this.prisma.cat.groupBy({
        by: ["gender"],
        _count: true,
      }),
      this.prisma.cat.groupBy({
        by: ["breedId"],
        _count: true,
        orderBy: {
          _count: {
            breedId: "desc",
          },
        },
        take: 10,
      }),
    ]);

    const genderDistribution: Record<string, number> = {
      MALE: 0,
      FEMALE: 0,
      NEUTER: 0,
      SPAY: 0,
    };

    for (const group of genderGroups) {
      if (group.gender === "MALE" || group.gender === "FEMALE" || group.gender === "NEUTER" || group.gender === "SPAY") {
        genderDistribution[group.gender] = group._count;
      }
    }

    const breedIds = breedStats.map((stat) => stat.breedId).filter((id): id is string => id !== null);
    const breeds = await this.prisma.breed.findMany({
      where: { id: { in: breedIds } },
    });

    const breedStatsWithNames = breedStats.map((stat) => ({
      breed: breeds.find((breed) => breed.id === stat.breedId),
      count: stat._count,
    }));

    return {
      total: totalCats,
      genderDistribution,
      breedDistribution: breedStatsWithNames,
    };
  }

  /**
   * 子猫一覧を取得（生後6ヶ月未満、母猫ごとにグループ化）
   */
  async findKittens(query: KittenQueryDto) {
    const {
      motherId,
      page = 1,
      limit = 50,
      search,
      sortBy = "birthDate",
      sortOrder = "desc",
    } = query;

    // 生後6ヶ月の基準日を計算
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const skip = (page - 1) * limit;
    const where: Prisma.CatWhereInput = {
      // 生後6ヶ月未満
      birthDate: { gte: sixMonthsAgo },
      // 母猫が設定されている（子猫として登録されている）
      motherId: motherId ? motherId : { not: null },
    };

    // 検索キーワード
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    type Sortable = "birthDate" | "name" | "createdAt";
    const orderBy: Prisma.CatOrderByWithRelationInput = {
      [sortBy as Sortable]: sortOrder,
    } as Prisma.CatOrderByWithRelationInput;

    // 子猫一覧を取得
    const [kittens, total] = await Promise.all([
      this.prisma.cat.findMany({
        where,
        skip,
        take: limit,
        include: {
          ...catWithRelationsInclude,
          mother: {
            select: {
              id: true,
              name: true,
              gender: true,
              birthDate: true,
              breed: {
                select: { id: true, name: true },
              },
              coatColor: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy,
      }),
      this.prisma.cat.count({ where }),
    ]);

    // 母猫ごとにグループ化
    const motherGroups = new Map<string, {
      mother: {
        id: string;
        name: string;
        gender: string;
        birthDate: Date;
        breed: { id: string; name: string } | null;
        coatColor: { id: string; name: string } | null;
      };
      kittens: typeof kittens;
      fatherId: string | null;
    }>();

    for (const kitten of kittens) {
      if (!kitten.mother) continue;

      const motherId = kitten.mother.id;
      if (!motherGroups.has(motherId)) {
        motherGroups.set(motherId, {
          mother: kitten.mother,
          kittens: [],
          fatherId: kitten.fatherId,
        });
      }
      const group = motherGroups.get(motherId);
      if (group) {
        group.kittens.push(kitten);
      }
    }

    // 父猫情報を取得
    const fatherIds = Array.from(motherGroups.values())
      .map((g) => g.fatherId)
      .filter((id): id is string => id !== null);
    
    const fathers = fatherIds.length > 0
      ? await this.prisma.cat.findMany({
          where: { id: { in: fatherIds } },
          select: {
            id: true,
            name: true,
            gender: true,
            breed: { select: { id: true, name: true } },
            coatColor: { select: { id: true, name: true } },
          },
        })
      : [];

    const fatherMap = new Map(fathers.map((f) => [f.id, f]));

    // レスポンス形式に変換
    const groupedData = Array.from(motherGroups.entries()).map(([, group]) => ({
      mother: group.mother,
      father: group.fatherId ? fatherMap.get(group.fatherId) ?? null : null,
      kittens: group.kittens,
      kittenCount: group.kittens.length,
      deliveryDate: group.kittens[0]?.birthDate ?? null,
    }));

    // 出産日で降順ソート（最新の出産が先頭）
    groupedData.sort((a, b) => {
      const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0;
      const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0;
      return dateB - dateA;
    });

    return {
      data: groupedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalGroups: motherGroups.size,
      },
    };
  }

  // ==========================================
  // 体重記録 CRUD メソッド
  // ==========================================

  /**
   * 猫の体重記録一覧を取得
   */
  async getWeightRecords(
    catId: string,
    query: WeightRecordQueryDto,
    _userId: string,
  ): Promise<WeightRecordsListResponse> {
    // 猫の存在確認
    await this.findOne(catId);

    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.WeightRecordWhereInput = { catId };

    // 日付フィルタ
    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) {
        where.recordedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordedAt.lte = new Date(endDate);
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.weightRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: sortOrder },
        include: {
          recorder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.weightRecord.count({ where }),
    ]);

    // サマリー情報を計算
    const latestRecords = await this.prisma.weightRecord.findMany({
      where: { catId },
      orderBy: { recordedAt: "desc" },
      take: 2,
      select: { weight: true, recordedAt: true },
    });

    const latestWeight = latestRecords[0]?.weight ?? null;
    const previousWeight = latestRecords[1]?.weight ?? null;
    const weightChange =
      latestWeight !== null && previousWeight !== null
        ? latestWeight - previousWeight
        : null;
    const latestRecordedAt = latestRecords[0]?.recordedAt?.toISOString() ?? null;

    const data: WeightRecordResponse[] = records.map((record) => ({
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        latestWeight,
        previousWeight,
        weightChange,
        latestRecordedAt,
        recordCount: total,
      },
    };
  }

  /**
   * 体重記録を作成
   */
  async createWeightRecord(
    catId: string,
    dto: CreateWeightRecordDto,
    userId: string,
  ): Promise<WeightRecordResponse> {
    // 猫の存在確認
    await this.findOne(catId);

    const record = await this.prisma.weightRecord.create({
      data: {
        catId,
        weight: dto.weight,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
        notes: dto.notes,
        recordedBy: userId,
      },
      include: {
        recorder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    };
  }

  /**
   * 体重記録を更新
   */
  async updateWeightRecord(
    recordId: string,
    dto: UpdateWeightRecordDto,
    _userId: string,
  ): Promise<WeightRecordResponse> {
    const existingRecord = await this.prisma.weightRecord.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      throw new NotFoundException(`体重記録が見つかりません（ID: ${recordId}）`);
    }

    const record = await this.prisma.weightRecord.update({
      where: { id: recordId },
      data: {
        ...(dto.weight !== undefined ? { weight: dto.weight } : {}),
        ...(dto.recordedAt ? { recordedAt: new Date(dto.recordedAt) } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: {
        recorder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    };
  }

  /**
   * 体重記録を削除
   */
  async deleteWeightRecord(recordId: string, _userId: string): Promise<void> {
    const existingRecord = await this.prisma.weightRecord.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      throw new NotFoundException(`体重記録が見つかりません（ID: ${recordId}）`);
    }

    await this.prisma.weightRecord.delete({
      where: { id: recordId },
    });
  }

  /**
   * 単一の体重記録を取得
   */
  async getWeightRecord(recordId: string): Promise<WeightRecordResponse> {
    const record = await this.prisma.weightRecord.findUnique({
      where: { id: recordId },
      include: {
        recorder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`体重記録が見つかりません（ID: ${recordId}）`);
    }

    return {
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    };
  }

  /**
   * 複数の猫の体重を一括登録
   */
  async createBulkWeightRecords(
    dto: CreateBulkWeightRecordsDto,
    userId: string,
  ): Promise<BulkWeightRecordsResponse> {
    const { recordedAt, records } = dto;
    const recordedAtDate = new Date(recordedAt);

    // 全ての猫IDの存在確認
    const catIds = records.map((r) => r.catId);
    const existingCats = await this.prisma.cat.findMany({
      where: { id: { in: catIds } },
      select: { id: true },
    });

    const existingCatIds = new Set(existingCats.map((c) => c.id));
    const missingCatIds = catIds.filter((id) => !existingCatIds.has(id));

    if (missingCatIds.length > 0) {
      throw new BadRequestException(
        `以下の猫IDが見つかりません: ${missingCatIds.join(", ")}`,
      );
    }

    // トランザクションで一括登録
    const createdRecords = await this.prisma.$transaction(
      records.map((record) =>
        this.prisma.weightRecord.create({
          data: {
            catId: record.catId,
            weight: record.weight,
            recordedAt: recordedAtDate,
            notes: record.notes,
            recordedBy: userId,
          },
          include: {
            recorder: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ),
    );

    const responseRecords: WeightRecordResponse[] = createdRecords.map((r) => ({
      id: r.id,
      catId: r.catId,
      weight: r.weight,
      recordedAt: r.recordedAt.toISOString(),
      notes: r.notes,
      recordedBy: r.recordedBy,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      recorder: r.recorder,
    }));

    return {
      success: true,
      created: createdRecords.length,
      records: responseRecords,
    };
  }

  /**
   * 複数の猫の体重記録履歴を一括取得（テーブル表示用）
   */
  async getWeightRecordsForKittens(
    catIds: string[],
    limit: number = 8,
  ): Promise<
    Map<
      string,
      Array<{
        id: string;
        weight: number;
        recordedAt: string;
        notes: string | null;
      }>
    >
  > {
    // 各猫の最新N件の体重記録を取得
    const records = await this.prisma.weightRecord.findMany({
      where: { catId: { in: catIds } },
      orderBy: { recordedAt: "desc" },
      select: {
        id: true,
        catId: true,
        weight: true,
        recordedAt: true,
        notes: true,
      },
    });

    // 猫ごとにグループ化し、最新N件に制限
    const result = new Map<
      string,
      Array<{
        id: string;
        weight: number;
        recordedAt: string;
        notes: string | null;
      }>
    >();

    for (const catId of catIds) {
      const catRecords = records
        .filter((r) => r.catId === catId)
        .slice(0, limit)
        .map((r) => ({
          id: r.id,
          weight: r.weight,
          recordedAt: r.recordedAt.toISOString(),
          notes: r.notes,
        }));
      result.set(catId, catRecords);
    }

    return result;
  }
}
