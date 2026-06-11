import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateTagDto, UpdateTagDto } from "./dto";
import {
  TAG_AUTOMATION_EVENTS,
  type TagAssignedEvent,
} from "./events/tag-automation.events";
import { TagCategoriesService } from "./tag-categories.service";

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagCategoriesService: TagCategoriesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(options: { scopes?: string[]; includeInactive?: boolean } = {}) {
    const categories = await this.tagCategoriesService.findMany({
      scopes: options.scopes,
      includeGroups: true,
      includeInactive: options.includeInactive,
    });

    return {
      success: true,
      data: categories.map((category) => ({
        id: category.id,
        key: category.key,
        name: category.name,
        description: category.description ?? undefined,
        color: category.color ?? undefined,
        textColor: category.textColor ?? undefined,
        displayOrder: category.displayOrder,
        scopes: category.scopes,
        isActive: category.isActive,
        groups: (category.groups ?? []).map((group) => ({
          id: group.id,
          categoryId: group.categoryId,
          name: group.name,
          description: group.description ?? undefined,
          color: group.color ?? undefined,
          textColor: group.textColor ?? undefined,
          displayOrder: group.displayOrder,
          isActive: group.isActive,
          tags: (group.tags ?? []).map((tag) => ({
            id: tag.id,
            groupId: tag.groupId,
            name: tag.name,
            color: tag.color,
            textColor: tag.textColor,
            description: tag.description ?? undefined,
            displayOrder: tag.displayOrder,
            allowsManual: tag.allowsManual,
            allowsAutomation: tag.allowsAutomation,
            metadata: tag.metadata ?? undefined,
            isActive: tag.isActive,
            usageCount: tag.cats.length,
          })),
        })),
      })),
    };
  }

  async create(dto: CreateTagDto) {
    const displayOrder = dto.displayOrder ?? (await this.getNextDisplayOrder(dto.groupId));
    const data = await this.prisma.tag.create({
      data: {
        group: { connect: { id: dto.groupId } },
        name: dto.name,
        color: dto.color ?? undefined,
        textColor: dto.textColor ?? undefined,
        description: dto.description ?? undefined,
        displayOrder,
        ...(dto.allowsManual !== undefined ? { allowsManual: dto.allowsManual } : {}),
        ...(dto.allowsAutomation !== undefined
          ? { allowsAutomation: dto.allowsAutomation }
          : {}),
        metadata: this.toJson(dto.metadata),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: this.defaultTagInclude(),
    });

    return { success: true, data };
  }

  async update(id: string, dto: UpdateTagDto) {
    const updateData: Prisma.TagUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.color !== undefined ? { color: dto.color } : {}),
  ...(dto.textColor !== undefined ? { textColor: dto.textColor } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
      ...(dto.metadata !== undefined
        ? { metadata: this.toJson(dto.metadata) ?? Prisma.JsonNull }
        : {}),
      ...(dto.groupId ? { group: { connect: { id: dto.groupId } } } : {}),
      ...(dto.allowsManual !== undefined ? { allowsManual: dto.allowsManual } : {}),
      ...(dto.allowsAutomation !== undefined
        ? { allowsAutomation: dto.allowsAutomation }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };

    const data = await this.prisma.tag.update({
      where: { id },
      data: updateData,
      include: this.defaultTagInclude(),
    });

    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }

  async reorder(items: Array<{ id: string; displayOrder: number; groupId?: string }>) {
    if (!items.length) {
      return { success: true };
    }

    await this.prisma.$transaction(
      items.map(({ id, displayOrder, groupId }) =>
        this.prisma.tag.update({
          where: { id },
          data: {
            displayOrder,
            ...(groupId ? { group: { connect: { id: groupId } } } : {}),
          },
        }),
      ),
    );

    return { success: true };
  }

  async assignToCat(catId: string, tagId: string) {
    let created = false;
    try {
      await this.prisma.catTag.create({ data: { catId, tagId } });
      created = true;
    } catch {
      // Unique constraint (already assigned) -> return success idempotently
    }

    // 手動付与時のみ TAG_ASSIGNED イベントを発火する
    // （自動化による付与は execution サービス側で発火しないため無限ループしない）
    if (created) {
      this.emitTagAssignedEvent(catId, tagId, "ASSIGNED");
    }

    return { success: true };
  }

  async unassignFromCat(catId: string, tagId: string) {
    await this.prisma.catTag.delete({
      where: { catId_tagId: { catId, tagId } },
    });

    this.emitTagAssignedEvent(catId, tagId, "UNASSIGNED");

    return { success: true };
  }

  private emitTagAssignedEvent(
    catId: string,
    tagId: string,
    action: TagAssignedEvent["action"],
  ): void {
    const event: TagAssignedEvent = {
      eventType: "TAG_ASSIGNED",
      timestamp: new Date(),
      catId,
      tagId,
      action,
    };
    this.eventEmitter.emit(TAG_AUTOMATION_EVENTS.TAG_ASSIGNED, event);
  }

  private defaultTagInclude(): Prisma.TagInclude {
    return {
      cats: {
        select: { catId: true },
      },
    };
  }

  private toJson(value?: Record<string, unknown> | null): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }

  private async getNextDisplayOrder(groupId: string): Promise<number> {
    const result = await this.prisma.tag.aggregate({
      _max: { displayOrder: true },
      where: { groupId },
    });
    return (result._max.displayOrder ?? -1) + 1;
  }
}
