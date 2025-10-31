import { PartialType } from "@nestjs/swagger";

import { CreateTagAutomationRuleDto } from "./create-tag-automation-rule.dto";

export class UpdateTagAutomationRuleDto extends PartialType(CreateTagAutomationRuleDto) {}
