import { PartialType } from "@nestjs/mapped-types";

import { CreatePwrBuildingDto } from "./create-pwr-building.dto";

export class UpdatePwrBuildingDto extends PartialType(CreatePwrBuildingDto) {}
