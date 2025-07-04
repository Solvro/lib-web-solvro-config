import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { CreatePwrBuildingDto } from "./dto/create-pwr-building.dto";
import { UpdatePwrBuildingDto } from "./dto/update-pwr-building.dto";
import { PwrBuildingsService } from "./pwr-buildings.service";

@Controller("pwr-buildings")
export class PwrBuildingsController {
  constructor(private readonly pwrBuildingsService: PwrBuildingsService) {}

  @Post()
  create(@Body() createPwrBuildingDto: CreatePwrBuildingDto) {
    return this.pwrBuildingsService.create(createPwrBuildingDto);
  }

  @Get()
  findAll() {
    return this.pwrBuildingsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.pwrBuildingsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updatePwrBuildingDto: UpdatePwrBuildingDto,
  ) {
    return this.pwrBuildingsService.update(+id, updatePwrBuildingDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pwrBuildingsService.remove(+id);
  }
}
