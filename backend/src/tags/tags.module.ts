import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { TagAutomationController } from "./tag-automation.controller";
import { TagAutomationExecutionService } from "./tag-automation-execution.service";
import { TagAutomationService } from "./tag-automation.service";
import { TagCategoriesController } from "./tag-categories.controller";
import { TagCategoriesService } from "./tag-categories.service";
import { TagGroupsController } from "./tag-groups.controller";
import { TagGroupsService } from "./tag-groups.service";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [PrismaModule],
  controllers: [
    TagsController,
    TagCategoriesController,
    TagGroupsController,
    TagAutomationController,
  ],
  providers: [
    TagsService,
    TagCategoriesService,
    TagGroupsService,
    TagAutomationService,
    TagAutomationExecutionService,
  ],
  exports: [
    TagsService,
    TagCategoriesService,
    TagGroupsService,
    TagAutomationService,
    TagAutomationExecutionService,
  ],
})
export class TagsModule {}
