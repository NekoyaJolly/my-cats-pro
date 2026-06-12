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
  CatFamilyResponse,
  ParentInfo,
  AncestorInfo,
  SiblingInfo,
  OffspringInfo,
  CatStatisticsResponse,
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
      fatherName,
      motherName,
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
          // 親はリレーション優先。ID 未指定かつ名前のみの場合はテキストとして記録（システム未登録の親）
          ...(fatherId
            ? { father: { connect: { id: fatherId } } }
            : fatherName
              ? { fatherName }
              : {}),
          ...(motherId
            ? { mother: { connect: { id: motherId } } }
            : motherName
              ? { motherName }
              : {}),
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

        // PAGE_ACTION（kittens.register）ルール向けイベント
        this.emitPageActionEvent("kittens", "register", cat.id);
      }

      if (cat) {
        // PAGE_ACTION（cats-new.create / create_success）ルール向けイベント
        this.emitPageActionEvent("cats-new", "create", cat.id);
        this.emitPageActionEvent("cats-new", "create_success", cat.id);
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new BadRequestException("指定された親猫が見つかりません");
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
      fatherName,
      motherName,
      tagIds,
    } = updateCatDto;

    // 自分自身を親に設定することはできない
    if (fatherId === id || motherId === id) {
      throw new BadRequestException("自分自身を親に設定することはできません");
    }

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

      const updatedCat = await this.prisma.cat.update({
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
          // 親情報: ID 指定で接続（名前はクリア）、null で解除、ID 未変更時は名前のみ更新可
          ...(fatherId
            ? { father: { connect: { id: fatherId } }, fatherName: null }
            : fatherId === null
              ? { father: { disconnect: true }, fatherName: fatherName ?? null }
              : fatherName !== undefined
                ? { fatherName }
                : {}),
          ...(motherId
            ? { mother: { connect: { id: motherId } }, motherName: null }
            : motherId === null
              ? { mother: { disconnect: true }, motherName: motherName ?? null }
              : motherName !== undefined
                ? { motherName }
                : {}),
        },
        include: catWithRelationsInclude,
      });

      // PAGE_ACTION（cats-detail.update）ルール向けイベント
      this.emitPageActionEvent("cats-detail", "update", updatedCat.id);

      return updatedCat;
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new BadRequestException("指定された親猫が見つかりません");
      }
      throw error;
    }
  }

  /**
   * PAGE_ACTION タイプのタグ自動化ルール向けイベントを発火する
   */
  private emitPageActionEvent(page: string, action: string, catId: string): void {
    this.eventEmitter.emit(TAG_AUTOMATION_EVENTS.PAGE_ACTION, {
      eventType: "PAGE_ACTION" as const,
      timestamp: new Date(),
      page,
      action,
      targetId: catId,
      targetType: "cat",
    });
  }

  /**
   * 猫の削除
   *
   * 削除ポリシー:
   * - 猫個体に属する記録（ケア履歴・体重・タグ・ギャラリー・単独スケジュール）は削除
   * - 医療記録・繁殖履歴（交配記録/配種スケジュール/妊娠確認/出産予定/子猫処遇）は
   *   レコードを残し、リンクを切断して名前をテキスト（スナップショット）で保持
   * - 子猫の母/父参照も名前スナップショットに置き換える
   */
  async remove(id: string) {
    const existingCat = await this.prisma.cat.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existingCat) {
      throw new NotFoundException(`猫が見つかりません（ID: ${id}）`);
    }

    const catName = existingCat.name;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) 猫個体に属する記録を削除
        //    （体重・タグ・タグ履歴・スケジュール紐付け・卒業記録はスキーマの Cascade で削除される）
        await tx.careRecord.deleteMany({ where: { catId: id } });
        await tx.galleryEntry.deleteMany({ where: { catId: id } });
        // この猫だけを対象とするケアスケジュールは削除（複数猫スケジュールは残す）
        await tx.schedule.deleteMany({
          where: {
            catId: id,
            scheduleCats: { none: { catId: { not: id } } },
          },
        });

        // 2) 医療記録: 後から参照できるようリンクを切断して名前を保持
        await tx.medicalRecord.updateMany({
          where: { catId: id },
          data: { catId: null, catName },
        });

        // 3) 繁殖履歴: リンクを切断して名前を保持
        await tx.breedingRecord.updateMany({
          where: { maleId: id },
          data: { maleId: null, maleName: catName },
        });
        await tx.breedingRecord.updateMany({
          where: { femaleId: id },
          data: { femaleId: null, femaleName: catName },
        });
        await tx.breedingSchedule.updateMany({
          where: { maleId: id },
          data: { maleId: null, maleName: catName },
        });
        await tx.breedingSchedule.updateMany({
          where: { femaleId: id },
          data: { femaleId: null, femaleName: catName },
        });
        await tx.pregnancyCheck.updateMany({
          where: { motherId: id },
          data: { motherId: null, motherName: catName },
        });
        await tx.pregnancyCheck.updateMany({
          where: { fatherId: id },
          data: { fatherId: null, fatherName: catName },
        });
        await tx.birthPlan.updateMany({
          where: { motherId: id },
          data: { motherId: null, motherName: catName },
        });
        await tx.birthPlan.updateMany({
          where: { fatherId: id },
          data: { fatherId: null, fatherName: catName },
        });
        // 子猫処遇は KittenDisposition.name に名前を保持済みのためリンク切断のみ
        await tx.kittenDisposition.updateMany({
          where: { kittenId: id },
          data: { kittenId: null },
        });

        // 4) 子猫の母/父参照を名前スナップショットに置き換え
        await tx.cat.updateMany({
          where: { motherId: id },
          data: { motherId: null, motherName: catName },
        });
        await tx.cat.updateMany({
          where: { fatherId: id },
          data: { fatherId: null, fatherName: catName },
        });

        // 5) 本体を削除
        return tx.cat.delete({
          where: { id },
          include: catWithRelationsInclude,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        // 想定外の参照が残っている場合のフォールバック（500 にしない）
        throw new ConflictException(
          "関連データが残っているため削除できません。画面を更新して再度お試しください",
        );
      }
      throw error;
    }
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

  async getStatistics(): Promise<CatStatisticsResponse> {
    // 生後6ヶ月の基準日を計算（成猫判定用）
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 生後3ヶ月の基準日を計算（子猫判定用）
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // 基本統計とタブ別カウントを並列取得
    const [
      totalCats,
      genderGroups,
      breedStats,
      // タブ別カウント用クエリ
      inHouseCats,
      raisingTagCats,
      gradTagCats,
    ] = await Promise.all([
      // 全猫数
      this.prisma.cat.count(),
      // 性別分布
      this.prisma.cat.groupBy({
        by: ["gender"],
        _count: true,
      }),
      // 品種分布（上位10件）
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
      // 在舎猫の基本情報（タブカウント計算用）
      this.prisma.cat.findMany({
        where: { isInHouse: true },
        select: {
          id: true,
          gender: true,
          birthDate: true,
          motherId: true,
        },
      }),
      // 養成中タグが付いた猫数
      this.prisma.catTag.count({
        where: {
          cat: { isInHouse: true },
          tag: { name: "養成中" },
        },
      }),
      // 卒業予定タグが付いた猫数
      this.prisma.catTag.count({
        where: {
          cat: { isInHouse: true },
          tag: { name: "卒業予定" },
        },
      }),
    ]);

    // 性別分布を構築
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

    // 品種情報を取得
    const breedIds = breedStats.map((stat) => stat.breedId).filter((id): id is string => id !== null);
    const breeds = await this.prisma.breed.findMany({
      where: { id: { in: breedIds } },
    });

    const breedStatsWithNames = breedStats.map((stat) => ({
      breed: breeds.find((breed) => breed.id === stat.breedId) ?? null,
      count: stat._count,
    }));

    // タブ別カウントを計算
    // 成猫: 生後6ヶ月以上の在舎猫
    const adultCats = inHouseCats.filter(
      (cat) => new Date(cat.birthDate) < sixMonthsAgo
    );

    // 子猫: 生後3ヶ月以内 + 母猫あり
    const kittenCount = inHouseCats.filter((cat) => {
      if (!cat.motherId) return false;
      return new Date(cat.birthDate) >= threeMonthsAgo;
    }).length;

    // オス成猫数
    const maleCount = adultCats.filter((cat) => cat.gender === "MALE").length;

    // メス成猫数
    const femaleCount = adultCats.filter((cat) => cat.gender === "FEMALE").length;

    return {
      total: totalCats,
      genderDistribution: {
        MALE: genderDistribution.MALE,
        FEMALE: genderDistribution.FEMALE,
        NEUTER: genderDistribution.NEUTER,
        SPAY: genderDistribution.SPAY,
      },
      breedDistribution: breedStatsWithNames,
      tabCounts: {
        total: adultCats.length,
        male: maleCount,
        female: femaleCount,
        kitten: kittenCount,
        raising: raisingTagCats,
        grad: gradTagCats,
      },
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

  /**
   * 猫の家族情報を取得（血統タブ用）
   * - 父母情報（Pedigreeがある場合は祖父母・曾祖父母も含む）
   * - 兄弟姉妹（両親が一致する猫のみ）
   * - 子猫一覧
   */
  async getCatFamily(id: string): Promise<CatFamilyResponse> {
    // 猫の詳細情報を取得
    const cat = await this.prisma.cat.findUnique({
      where: { id },
      include: {
        breed: { select: { id: true, name: true } },
        coatColor: { select: { id: true, name: true } },
        father: {
          include: {
            breed: { select: { id: true, name: true } },
            coatColor: { select: { id: true, name: true } },
            pedigree: true,
          },
        },
        mother: {
          include: {
            breed: { select: { id: true, name: true } },
            coatColor: { select: { id: true, name: true } },
            pedigree: true,
          },
        },
        pedigree: true,
      },
    });

    if (!cat) {
      throw new NotFoundException(`猫が見つかりません（ID: ${id}）`);
    }

    // 父親情報の構築
    const father = this.buildParentInfo(cat.father, "father");

    // 母親情報の構築
    const mother = this.buildParentInfo(cat.mother, "mother");

    // 兄弟姉妹を取得（両親が一致する猫のみ）
    let siblings: SiblingInfo[] = [];
    if (cat.fatherId && cat.motherId) {
      const siblingCats = await this.prisma.cat.findMany({
        where: {
          fatherId: cat.fatherId,
          motherId: cat.motherId,
          id: { not: cat.id }, // 自分自身を除外
        },
        include: {
          breed: { select: { id: true, name: true } },
          coatColor: { select: { id: true, name: true } },
          pedigree: { select: { pedigreeId: true } },
        },
        orderBy: { birthDate: "asc" },
      });

      siblings = siblingCats.map((sibling) => ({
        id: sibling.id,
        name: sibling.name,
        gender: sibling.gender,
        birthDate: sibling.birthDate.toISOString(),
        breed: sibling.breed,
        coatColor: sibling.coatColor,
        pedigreeId: sibling.pedigree?.pedigreeId ?? null,
      }));
    }

    // 子猫を取得（この猫が親の場合）
    const offspringCats = await this.prisma.cat.findMany({
      where: {
        OR: [
          { fatherId: cat.id },
          { motherId: cat.id },
        ],
      },
      include: {
        breed: { select: { id: true, name: true } },
        coatColor: { select: { id: true, name: true } },
        pedigree: { select: { pedigreeId: true } },
        father: {
          select: {
            id: true,
            name: true,
            gender: true,
            pedigree: { select: { pedigreeId: true } },
          },
        },
        mother: {
          select: {
            id: true,
            name: true,
            gender: true,
            pedigree: { select: { pedigreeId: true } },
          },
        },
      },
      orderBy: { birthDate: "desc" },
    });

    const offspring: OffspringInfo[] = offspringCats.map((child) => {
      // この猫がオスなら母親を、メスなら父親を相手の親として返す
      const isFather = child.fatherId === cat.id;
      const otherParentData = isFather ? child.mother : child.father;

      return {
        id: child.id,
        name: child.name,
        gender: child.gender,
        birthDate: child.birthDate.toISOString(),
        breed: child.breed,
        coatColor: child.coatColor,
        pedigreeId: child.pedigree?.pedigreeId ?? null,
        otherParent: otherParentData
          ? {
              id: otherParentData.id,
              name: otherParentData.name,
              gender: otherParentData.gender,
              pedigreeId: otherParentData.pedigree?.pedigreeId ?? null,
            }
          : null,
      };
    });

    return {
      cat: {
        id: cat.id,
        name: cat.name,
        gender: cat.gender,
        birthDate: cat.birthDate.toISOString(),
        pedigreeId: cat.pedigree?.pedigreeId ?? null,
        breed: cat.breed,
        coatColor: cat.coatColor,
      },
      father,
      mother,
      siblings,
      offspring,
    };
  }

  /**
   * 親情報を構築（Pedigreeから祖父母・曾祖父母情報を含む）
   */
  private buildParentInfo(
    parent: {
      id: string;
      name: string;
      gender: string;
      birthDate: Date;
      breed: { id: string; name: string } | null;
      coatColor: { id: string; name: string } | null;
      pedigree: {
        pedigreeId: string;
        // 父方の祖父母
        ffTitle: string | null;
        ffCatName: string | null;
        ffCatColor: string | null;
        ffjcu: string | null;
        fmTitle: string | null;
        fmCatName: string | null;
        fmCatColor: string | null;
        fmjcu: string | null;
        // 母方の祖父母
        mfTitle: string | null;
        mfCatName: string | null;
        mfCatColor: string | null;
        mfjcu: string | null;
        mmTitle: string | null;
        mmCatName: string | null;
        mmCatColor: string | null;
        mmjcu: string | null;
        // 父方の曾祖父母
        fffTitle: string | null;
        fffCatName: string | null;
        fffCatColor: string | null;
        fffjcu: string | null;
        ffmTitle: string | null;
        ffmCatName: string | null;
        ffmCatColor: string | null;
        ffmjcu: string | null;
        fmfTitle: string | null;
        fmfCatName: string | null;
        fmfCatColor: string | null;
        fmfjcu: string | null;
        fmmTitle: string | null;
        fmmCatName: string | null;
        fmmCatColor: string | null;
        fmmjcu: string | null;
        // 母方の曾祖父母
        mffTitle: string | null;
        mffCatName: string | null;
        mffCatColor: string | null;
        mffjcu: string | null;
        mfmTitle: string | null;
        mfmCatName: string | null;
        mfmCatColor: string | null;
        mfmjcu: string | null;
        mmfTitle: string | null;
        mmfCatName: string | null;
        mmfCatColor: string | null;
        mmfjcu: string | null;
        mmmTitle: string | null;
        mmmCatName: string | null;
        mmmCatColor: string | null;
        mmmjcu: string | null;
        // 親の親情報
        fatherJCU: string | null;
        fatherCatName: string | null;
        fatherCoatColor: string | null;
        fatherTitle: string | null;
        motherJCU: string | null;
        motherCatName: string | null;
        motherCoatColor: string | null;
        motherTitle: string | null;
      } | null;
    } | null,
    _position: "father" | "mother",
  ): ParentInfo | null {
    if (!parent) {
      return null;
    }

    const pedigree = parent.pedigree;

    // 父方の祖父母情報を構築
    const fatherAncestor: AncestorInfo | null = pedigree
      ? {
          pedigreeId: pedigree.fatherJCU,
          catName: pedigree.fatherCatName,
          coatColor: pedigree.fatherCoatColor,
          title: pedigree.fatherTitle,
          jcu: pedigree.fatherJCU,
        }
      : null;

    // 母方の祖父母情報を構築
    const motherAncestor: AncestorInfo | null = pedigree
      ? {
          pedigreeId: pedigree.motherJCU,
          catName: pedigree.motherCatName,
          coatColor: pedigree.motherCoatColor,
          title: pedigree.motherTitle,
          jcu: pedigree.motherJCU,
        }
      : null;

    return {
      id: parent.id,
      pedigreeId: pedigree?.pedigreeId ?? null,
      name: parent.name,
      gender: parent.gender,
      birthDate: parent.birthDate.toISOString(),
      breed: parent.breed,
      coatColor: parent.coatColor,
      father: fatherAncestor,
      mother: motherAncestor,
    };
  }
}
