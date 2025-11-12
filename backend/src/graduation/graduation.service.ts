import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { TransferCatDto } from './dto';

@Injectable()
export class GraduationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 猫を譲渡（卒業）する
   * 1. 猫データのスナップショットを作成
   * 2. Graduationレコード作成
   * 3. Catのフラグ更新（isGraduated=true, isInHouse=false）
   */
  async transferCat(catId: string, dto: TransferCatDto, userId?: string) {
    // 猫が存在するか確認
    const cat = await this.prisma.cat.findUnique({
      where: { id: catId },
      include: {
        breed: true,
        coatColor: true,
        father: true,
        mother: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${catId} not found`);
    }

    // すでに卒業済みかチェック
    if (cat.isGraduated) {
      throw new BadRequestException('This cat has already been graduated');
    }

    // トランザクションで処理
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Graduationレコード作成
      const graduation = await tx.graduation.create({
        data: {
          catId: cat.id,
          transferDate: new Date(dto.transferDate),
          destination: dto.destination,
          notes: dto.notes,
          transferredBy: userId,
          catSnapshot: cat, // 猫の全データをスナップショット
        },
      });

      // 2. Catのフラグ更新
      await tx.cat.update({
        where: { id: catId },
        data: {
          isGraduated: true,
          isInHouse: false,
        },
      });

      return graduation;
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 卒業猫一覧取得
   */
  async findAllGraduations(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [graduations, total] = await Promise.all([
      this.prisma.graduation.findMany({
        skip,
        take: limit,
        orderBy: {
          transferDate: 'desc',
        },
        include: {
          cat: {
            select: {
              id: true,
              name: true,
              gender: true,
              birthDate: true,
            },
          },
        },
      }),
      this.prisma.graduation.count(),
    ]);

    return {
      success: true,
      data: graduations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 卒業猫詳細取得
   */
  async findOneGraduation(id: string) {
    const graduation = await this.prisma.graduation.findUnique({
      where: { id },
      include: {
        cat: true,
      },
    });

    if (!graduation) {
      throw new NotFoundException(`Graduation with ID ${id} not found`);
    }

    return {
      success: true,
      data: graduation,
    };
  }

  /**
   * 卒業取り消し（緊急時用）
   */
  async cancelGraduation(id: string) {
    const graduation = await this.prisma.graduation.findUnique({
      where: { id },
    });

    if (!graduation) {
      throw new NotFoundException(`Graduation with ID ${id} not found`);
    }

    // トランザクションで削除とフラグ復元
    await this.prisma.$transaction(async (tx) => {
      // Graduationレコード削除
      await tx.graduation.delete({
        where: { id },
      });

      // Catのフラグ復元
      await tx.cat.update({
        where: { id: graduation.catId },
        data: {
          isGraduated: false,
          isInHouse: true,
        },
      });
    });

    return {
      success: true,
      message: 'Graduation cancelled successfully',
    };
  }
}
