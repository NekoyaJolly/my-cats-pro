import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreatePedigreeDto, UpdatePedigreeDto, PedigreeQueryDto } from "./dto";
import {
  PedigreeWhereInput,
  PedigreeCreateResponse,
  PedigreeListResponse,
  PedigreeSuccessResponse,
  PedigreeTreeNode,
  pedigreeWithRelationsInclude,
} from "./types/pedigree.types";

@Injectable()
export class PedigreeService {
  constructor(private prisma: PrismaService) {}

  async create(createPedigreeDto: CreatePedigreeDto): Promise<PedigreeCreateResponse> {
    // Access設計準拠: 全79項目をそのまま保存
    const createData: Prisma.PedigreeCreateInput = {
      // 基本情報（17項目）
      pedigreeId: createPedigreeDto.pedigreeId,
      ...(createPedigreeDto.title && { title: createPedigreeDto.title }),
      ...(createPedigreeDto.catName && { catName: createPedigreeDto.catName }),
      ...(createPedigreeDto.catName2 && { catName2: createPedigreeDto.catName2 }),
      ...(createPedigreeDto.breedCode !== undefined && { breedCode: createPedigreeDto.breedCode }),
      ...(createPedigreeDto.genderCode !== undefined && { genderCode: createPedigreeDto.genderCode }),
      ...(createPedigreeDto.eyeColor && { eyeColor: createPedigreeDto.eyeColor }),
      ...(createPedigreeDto.coatColorCode !== undefined && { coatColorCode: createPedigreeDto.coatColorCode }),
      ...(createPedigreeDto.birthDate && { birthDate: createPedigreeDto.birthDate }),
      ...(createPedigreeDto.breederName && { breederName: createPedigreeDto.breederName }),
      ...(createPedigreeDto.ownerName && { ownerName: createPedigreeDto.ownerName }),
      ...(createPedigreeDto.registrationDate && { registrationDate: createPedigreeDto.registrationDate }),
      ...(createPedigreeDto.brotherCount !== undefined && { brotherCount: createPedigreeDto.brotherCount }),
      ...(createPedigreeDto.sisterCount !== undefined && { sisterCount: createPedigreeDto.sisterCount }),
      ...(createPedigreeDto.notes && { notes: createPedigreeDto.notes }),
      ...(createPedigreeDto.notes2 && { notes2: createPedigreeDto.notes2 }),
      ...(createPedigreeDto.otherNo && { otherNo: createPedigreeDto.otherNo }),
      
      // 血統情報（62項目）
      // 第1世代: 父親（7項目）
      ...(createPedigreeDto.fatherTitle && { fatherTitle: createPedigreeDto.fatherTitle }),
      ...(createPedigreeDto.fatherCatName && { fatherCatName: createPedigreeDto.fatherCatName }),
      ...(createPedigreeDto.fatherCatName2 && { fatherCatName2: createPedigreeDto.fatherCatName2 }),
      ...(createPedigreeDto.fatherCoatColor && { fatherCoatColor: createPedigreeDto.fatherCoatColor }),
      ...(createPedigreeDto.fatherEyeColor && { fatherEyeColor: createPedigreeDto.fatherEyeColor }),
      ...(createPedigreeDto.fatherJCU && { fatherJCU: createPedigreeDto.fatherJCU }),
      ...(createPedigreeDto.fatherOtherCode && { fatherOtherCode: createPedigreeDto.fatherOtherCode }),

      // 第1世代: 母親（7項目）
      ...(createPedigreeDto.motherTitle && { motherTitle: createPedigreeDto.motherTitle }),
      ...(createPedigreeDto.motherCatName && { motherCatName: createPedigreeDto.motherCatName }),
      ...(createPedigreeDto.motherCatName2 && { motherCatName2: createPedigreeDto.motherCatName2 }),
      ...(createPedigreeDto.motherCoatColor && { motherCoatColor: createPedigreeDto.motherCoatColor }),
      ...(createPedigreeDto.motherEyeColor && { motherEyeColor: createPedigreeDto.motherEyeColor }),
      ...(createPedigreeDto.motherJCU && { motherJCU: createPedigreeDto.motherJCU }),
      ...(createPedigreeDto.motherOtherCode && { motherOtherCode: createPedigreeDto.motherOtherCode }),

      // 第2世代: 祖父母（16項目）
      ...(createPedigreeDto.ffTitle && { ffTitle: createPedigreeDto.ffTitle }),
      ...(createPedigreeDto.ffCatName && { ffCatName: createPedigreeDto.ffCatName }),
      ...(createPedigreeDto.ffCatColor && { ffCatColor: createPedigreeDto.ffCatColor }),
      ...(createPedigreeDto.ffjcu && { ffjcu: createPedigreeDto.ffjcu }),

      ...(createPedigreeDto.fmTitle && { fmTitle: createPedigreeDto.fmTitle }),
      ...(createPedigreeDto.fmCatName && { fmCatName: createPedigreeDto.fmCatName }),
      ...(createPedigreeDto.fmCatColor && { fmCatColor: createPedigreeDto.fmCatColor }),
      ...(createPedigreeDto.fmjcu && { fmjcu: createPedigreeDto.fmjcu }),

      ...(createPedigreeDto.mfTitle && { mfTitle: createPedigreeDto.mfTitle }),
      ...(createPedigreeDto.mfCatName && { mfCatName: createPedigreeDto.mfCatName }),
      ...(createPedigreeDto.mfCatColor && { mfCatColor: createPedigreeDto.mfCatColor }),
      ...(createPedigreeDto.mfjcu && { mfjcu: createPedigreeDto.mfjcu }),

      ...(createPedigreeDto.mmTitle && { mmTitle: createPedigreeDto.mmTitle }),
      ...(createPedigreeDto.mmCatName && { mmCatName: createPedigreeDto.mmCatName }),
      ...(createPedigreeDto.mmCatColor && { mmCatColor: createPedigreeDto.mmCatColor }),
      ...(createPedigreeDto.mmjcu && { mmjcu: createPedigreeDto.mmjcu }),

      // 第3世代: 曾祖父母（32項目）
      ...(createPedigreeDto.fffTitle && { fffTitle: createPedigreeDto.fffTitle }),
      ...(createPedigreeDto.fffCatName && { fffCatName: createPedigreeDto.fffCatName }),
      ...(createPedigreeDto.fffCatColor && { fffCatColor: createPedigreeDto.fffCatColor }),
      ...(createPedigreeDto.fffjcu && { fffjcu: createPedigreeDto.fffjcu }),

      ...(createPedigreeDto.ffmTitle && { ffmTitle: createPedigreeDto.ffmTitle }),
      ...(createPedigreeDto.ffmCatName && { ffmCatName: createPedigreeDto.ffmCatName }),
      ...(createPedigreeDto.ffmCatColor && { ffmCatColor: createPedigreeDto.ffmCatColor }),
      ...(createPedigreeDto.ffmjcu && { ffmjcu: createPedigreeDto.ffmjcu }),

      ...(createPedigreeDto.fmfTitle && { fmfTitle: createPedigreeDto.fmfTitle }),
      ...(createPedigreeDto.fmfCatName && { fmfCatName: createPedigreeDto.fmfCatName }),
      ...(createPedigreeDto.fmfCatColor && { fmfCatColor: createPedigreeDto.fmfCatColor }),
      ...(createPedigreeDto.fmfjcu && { fmfjcu: createPedigreeDto.fmfjcu }),

      ...(createPedigreeDto.fmmTitle && { fmmTitle: createPedigreeDto.fmmTitle }),
      ...(createPedigreeDto.fmmCatName && { fmmCatName: createPedigreeDto.fmmCatName }),
      ...(createPedigreeDto.fmmCatColor && { fmmCatColor: createPedigreeDto.fmmCatColor }),
      ...(createPedigreeDto.fmmjcu && { fmmjcu: createPedigreeDto.fmmjcu }),

      ...(createPedigreeDto.mffTitle && { mffTitle: createPedigreeDto.mffTitle }),
      ...(createPedigreeDto.mffCatName && { mffCatName: createPedigreeDto.mffCatName }),
      ...(createPedigreeDto.mffCatColor && { mffCatColor: createPedigreeDto.mffCatColor }),
      ...(createPedigreeDto.mffjcu && { mffjcu: createPedigreeDto.mffjcu }),

      ...(createPedigreeDto.mfmTitle && { mfmTitle: createPedigreeDto.mfmTitle }),
      ...(createPedigreeDto.mfmCatName && { mfmCatName: createPedigreeDto.mfmCatName }),
      ...(createPedigreeDto.mfmCatColor && { mfmCatColor: createPedigreeDto.mfmCatColor }),
      ...(createPedigreeDto.mfmjcu && { mfmjcu: createPedigreeDto.mfmjcu }),

      ...(createPedigreeDto.mmfTitle && { mmfTitle: createPedigreeDto.mmfTitle }),
      ...(createPedigreeDto.mmfCatName && { mmfCatName: createPedigreeDto.mmfCatName }),
      ...(createPedigreeDto.mmfCatColor && { mmfCatColor: createPedigreeDto.mmfCatColor }),
      ...(createPedigreeDto.mmfjcu && { mmfjcu: createPedigreeDto.mmfjcu }),

      ...(createPedigreeDto.mmmTitle && { mmmTitle: createPedigreeDto.mmmTitle }),
      ...(createPedigreeDto.mmmCatName && { mmmCatName: createPedigreeDto.mmmCatName }),
      ...(createPedigreeDto.mmmCatColor && { mmmCatColor: createPedigreeDto.mmmCatColor }),
      ...(createPedigreeDto.mmmjcu && { mmmjcu: createPedigreeDto.mmmjcu }),

      ...(createPedigreeDto.oldCode && { oldCode: createPedigreeDto.oldCode }),
    };

    const result = await this.prisma.pedigree.create({
      data: createData,
      include: pedigreeWithRelationsInclude,
    });

    return { success: true, data: result };
  }

  async findAll(query: PedigreeQueryDto): Promise<PedigreeListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      breedId,
      coatColorId,
      gender,
      catName2: _catName2,
      eyeColor,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: PedigreeWhereInput = {};

    // Search functionality
    if (search) {
      where.OR = [
        { catName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { breederName: { contains: search, mode: "insensitive" } },
        { ownerName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (breedId) where.breedCode = parseInt(breedId, 10);
    if (coatColorId) where.coatColorCode = parseInt(coatColorId, 10);
    if (gender) where.genderCode = parseInt(gender, 10);
    if (eyeColor) where.eyeColor = eyeColor;
    if (_catName2) {
      where.catName2 = {
        contains: _catName2,
        mode: "insensitive",
      };
    }

    const [pedigrees, total] = await Promise.all([
      this.prisma.pedigree.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: pedigreeWithRelationsInclude,
      }),
      this.prisma.pedigree.count({ where }),
    ]);

    return {
      success: true,
      data: pedigrees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { id },
      include: pedigreeWithRelationsInclude,
    });

    if (!pedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    return pedigree;
  }

  async findByPedigreeId(pedigreeId: string) {
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { pedigreeId },
      include: pedigreeWithRelationsInclude,
    });

    if (!pedigree) {
      throw new NotFoundException(
        `Pedigree with pedigree ID ${pedigreeId} not found`,
      );
    }

    return pedigree;
  }

  async update(id: string, updatePedigreeDto: UpdatePedigreeDto): Promise<PedigreeCreateResponse> {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    // Prisma の型に適合するようにデータを準備 (Access schema 79 fields)
    const updateData: Prisma.PedigreeUpdateInput = {
      // Basic information (17 fields)
      ...(updatePedigreeDto.pedigreeId && { pedigreeId: updatePedigreeDto.pedigreeId }),
      ...(updatePedigreeDto.title && { title: updatePedigreeDto.title }),
      ...(updatePedigreeDto.catName && { catName: updatePedigreeDto.catName }),
      ...(updatePedigreeDto.catName2 && { catName2: updatePedigreeDto.catName2 }),
      ...(updatePedigreeDto.breedCode !== undefined && { breedCode: updatePedigreeDto.breedCode }),
      ...(updatePedigreeDto.genderCode !== undefined && { genderCode: updatePedigreeDto.genderCode }),
      ...(updatePedigreeDto.eyeColor && { eyeColor: updatePedigreeDto.eyeColor }),
      ...(updatePedigreeDto.coatColorCode !== undefined && { coatColorCode: updatePedigreeDto.coatColorCode }),
      ...(updatePedigreeDto.birthDate && { birthDate: updatePedigreeDto.birthDate }),
      ...(updatePedigreeDto.breederName && { breederName: updatePedigreeDto.breederName }),
      ...(updatePedigreeDto.ownerName && { ownerName: updatePedigreeDto.ownerName }),
      ...(updatePedigreeDto.registrationDate && { registrationDate: updatePedigreeDto.registrationDate }),
      ...(updatePedigreeDto.brotherCount !== undefined && { brotherCount: updatePedigreeDto.brotherCount }),
      ...(updatePedigreeDto.sisterCount !== undefined && { sisterCount: updatePedigreeDto.sisterCount }),
      ...(updatePedigreeDto.notes && { notes: updatePedigreeDto.notes }),
      ...(updatePedigreeDto.notes2 && { notes2: updatePedigreeDto.notes2 }),
      ...(updatePedigreeDto.otherNo && { otherNo: updatePedigreeDto.otherNo }),

      // Generation 1 - Father (7 fields)
      ...(updatePedigreeDto.fatherTitle && { fatherTitle: updatePedigreeDto.fatherTitle }),
      ...(updatePedigreeDto.fatherCatName && { fatherCatName: updatePedigreeDto.fatherCatName }),
      ...(updatePedigreeDto.fatherCatName2 && { fatherCatName2: updatePedigreeDto.fatherCatName2 }),
      ...(updatePedigreeDto.fatherCoatColor && { fatherCoatColor: updatePedigreeDto.fatherCoatColor }),
      ...(updatePedigreeDto.fatherEyeColor && { fatherEyeColor: updatePedigreeDto.fatherEyeColor }),
      ...(updatePedigreeDto.fatherJCU && { fatherJCU: updatePedigreeDto.fatherJCU }),
      ...(updatePedigreeDto.fatherOtherCode && { fatherOtherCode: updatePedigreeDto.fatherOtherCode }),

      // Generation 1 - Mother (7 fields)
      ...(updatePedigreeDto.motherTitle && { motherTitle: updatePedigreeDto.motherTitle }),
      ...(updatePedigreeDto.motherCatName && { motherCatName: updatePedigreeDto.motherCatName }),
      ...(updatePedigreeDto.motherCatName2 && { motherCatName2: updatePedigreeDto.motherCatName2 }),
      ...(updatePedigreeDto.motherCoatColor && { motherCoatColor: updatePedigreeDto.motherCoatColor }),
      ...(updatePedigreeDto.motherEyeColor && { motherEyeColor: updatePedigreeDto.motherEyeColor }),
      ...(updatePedigreeDto.motherJCU && { motherJCU: updatePedigreeDto.motherJCU }),
      ...(updatePedigreeDto.motherOtherCode && { motherOtherCode: updatePedigreeDto.motherOtherCode }),

      // Generation 2 - Paternal Grandfather (FF) (4 fields)
      ...(updatePedigreeDto.ffTitle && { ffTitle: updatePedigreeDto.ffTitle }),
      ...(updatePedigreeDto.ffCatName && { ffCatName: updatePedigreeDto.ffCatName }),
      ...(updatePedigreeDto.ffCatColor && { ffCatColor: updatePedigreeDto.ffCatColor }),
      ...(updatePedigreeDto.ffjcu && { ffjcu: updatePedigreeDto.ffjcu }),

      // Generation 2 - Paternal Grandmother (FM) (4 fields)
      ...(updatePedigreeDto.fmTitle && { fmTitle: updatePedigreeDto.fmTitle }),
      ...(updatePedigreeDto.fmCatName && { fmCatName: updatePedigreeDto.fmCatName }),
      ...(updatePedigreeDto.fmCatColor && { fmCatColor: updatePedigreeDto.fmCatColor }),
      ...(updatePedigreeDto.fmjcu && { fmjcu: updatePedigreeDto.fmjcu }),

      // Generation 2 - Maternal Grandfather (MF) (4 fields)
      ...(updatePedigreeDto.mfTitle && { mfTitle: updatePedigreeDto.mfTitle }),
      ...(updatePedigreeDto.mfCatName && { mfCatName: updatePedigreeDto.mfCatName }),
      ...(updatePedigreeDto.mfCatColor && { mfCatColor: updatePedigreeDto.mfCatColor }),
      ...(updatePedigreeDto.mfjcu && { mfjcu: updatePedigreeDto.mfjcu }),

      // Generation 2 - Maternal Grandmother (MM) (4 fields)
      ...(updatePedigreeDto.mmTitle && { mmTitle: updatePedigreeDto.mmTitle }),
      ...(updatePedigreeDto.mmCatName && { mmCatName: updatePedigreeDto.mmCatName }),
      ...(updatePedigreeDto.mmCatColor && { mmCatColor: updatePedigreeDto.mmCatColor }),
      ...(updatePedigreeDto.mmjcu && { mmjcu: updatePedigreeDto.mmjcu }),

      // Generation 3 - Great-Grandfathers and Great-Grandmothers (32 fields)
      // FFF (Father's Father's Father)
      ...(updatePedigreeDto.fffTitle && { fffTitle: updatePedigreeDto.fffTitle }),
      ...(updatePedigreeDto.fffCatName && { fffCatName: updatePedigreeDto.fffCatName }),
      ...(updatePedigreeDto.fffCatColor && { fffCatColor: updatePedigreeDto.fffCatColor }),
      ...(updatePedigreeDto.fffjcu && { fffjcu: updatePedigreeDto.fffjcu }),

      // FFM (Father's Father's Mother)
      ...(updatePedigreeDto.ffmTitle && { ffmTitle: updatePedigreeDto.ffmTitle }),
      ...(updatePedigreeDto.ffmCatName && { ffmCatName: updatePedigreeDto.ffmCatName }),
      ...(updatePedigreeDto.ffmCatColor && { ffmCatColor: updatePedigreeDto.ffmCatColor }),
      ...(updatePedigreeDto.ffmjcu && { ffmjcu: updatePedigreeDto.ffmjcu }),

      // FMF (Father's Mother's Father)
      ...(updatePedigreeDto.fmfTitle && { fmfTitle: updatePedigreeDto.fmfTitle }),
      ...(updatePedigreeDto.fmfCatName && { fmfCatName: updatePedigreeDto.fmfCatName }),
      ...(updatePedigreeDto.fmfCatColor && { fmfCatColor: updatePedigreeDto.fmfCatColor }),
      ...(updatePedigreeDto.fmfjcu && { fmfjcu: updatePedigreeDto.fmfjcu }),

      // FMM (Father's Mother's Mother)
      ...(updatePedigreeDto.fmmTitle && { fmmTitle: updatePedigreeDto.fmmTitle }),
      ...(updatePedigreeDto.fmmCatName && { fmmCatName: updatePedigreeDto.fmmCatName }),
      ...(updatePedigreeDto.fmmCatColor && { fmmCatColor: updatePedigreeDto.fmmCatColor }),
      ...(updatePedigreeDto.fmmjcu && { fmmjcu: updatePedigreeDto.fmmjcu }),

      // MFF (Mother's Father's Father)
      ...(updatePedigreeDto.mffTitle && { mffTitle: updatePedigreeDto.mffTitle }),
      ...(updatePedigreeDto.mffCatName && { mffCatName: updatePedigreeDto.mffCatName }),
      ...(updatePedigreeDto.mffCatColor && { mffCatColor: updatePedigreeDto.mffCatColor }),
      ...(updatePedigreeDto.mffjcu && { mffjcu: updatePedigreeDto.mffjcu }),

      // MFM (Mother's Father's Mother)
      ...(updatePedigreeDto.mfmTitle && { mfmTitle: updatePedigreeDto.mfmTitle }),
      ...(updatePedigreeDto.mfmCatName && { mfmCatName: updatePedigreeDto.mfmCatName }),
      ...(updatePedigreeDto.mfmCatColor && { mfmCatColor: updatePedigreeDto.mfmCatColor }),
      ...(updatePedigreeDto.mfmjcu && { mfmjcu: updatePedigreeDto.mfmjcu }),

      // MMF (Mother's Mother's Father)
      ...(updatePedigreeDto.mmfTitle && { mmfTitle: updatePedigreeDto.mmfTitle }),
      ...(updatePedigreeDto.mmfCatName && { mmfCatName: updatePedigreeDto.mmfCatName }),
      ...(updatePedigreeDto.mmfCatColor && { mmfCatColor: updatePedigreeDto.mmfCatColor }),
      ...(updatePedigreeDto.mmfjcu && { mmfjcu: updatePedigreeDto.mmfjcu }),

      // MMM (Mother's Mother's Mother)
      ...(updatePedigreeDto.mmmTitle && { mmmTitle: updatePedigreeDto.mmmTitle }),
      ...(updatePedigreeDto.mmmCatName && { mmmCatName: updatePedigreeDto.mmmCatName }),
      ...(updatePedigreeDto.mmmCatColor && { mmmCatColor: updatePedigreeDto.mmmCatColor }),
      ...(updatePedigreeDto.mmmjcu && { mmmjcu: updatePedigreeDto.mmmjcu }),

      // Old Code (1 field)
      ...(updatePedigreeDto.oldCode && { oldCode: updatePedigreeDto.oldCode }),
    };

    const result = await this.prisma.pedigree.update({
      where: { id },
      data: updateData,
      include: pedigreeWithRelationsInclude,
    });

    return { success: true, data: result };
  }

  async remove(id: string): Promise<PedigreeSuccessResponse> {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    await this.prisma.pedigree.delete({
      where: { id },
    });

    return { success: true };
  }

  async getFamily(id: string, _generations: number = 3): Promise<PedigreeTreeNode> {
    // Pedigreeモデルは血統情報を文字列フィールドとして保持しているため、
    // リレーションではなく直接データを取得
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { id },
      include: pedigreeWithRelationsInclude,
    });

    if (!pedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    // 血統情報は既にフィールドに含まれているため、そのまま返す
    return pedigree;
  }

  async getFamilyTree(id: string, generations: number = 3): Promise<PedigreeTreeNode> {
    return this.getFamily(id, generations);
  }

  async getDescendants(id: string) {
    const pedigree = await this.findOne(id);

    const nameConditions: Prisma.PedigreeWhereInput[] = [];

    if (pedigree.catName) {
      nameConditions.push({ fatherCatName: { equals: pedigree.catName } });
      nameConditions.push({ motherCatName: { equals: pedigree.catName } });
    }

    const descendants = nameConditions.length
      ? await this.prisma.pedigree.findMany({
          where: {
            OR: nameConditions,
          },
          include: pedigreeWithRelationsInclude,
        })
      : [];

    return {
      pedigree,
      children: descendants,
    };
  }
}
