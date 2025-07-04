import { Injectable } from "@nestjs/common";

import { CreatePwrBuildingDto } from "./dto/create-pwr-building.dto";
import { UpdatePwrBuildingDto } from "./dto/update-pwr-building.dto";

@Injectable()
export class PwrBuildingsService {
  create(_createPwrBuildingDto: CreatePwrBuildingDto) {
    return "This action adds a new pwrBuilding";
  }

  findAll() {
    return `This action returns all pwrBuildings`;
  }

  findOne(id: number) {
    return `This action returns a #${id.toString()} pwrBuilding`;
  }

  update(id: number, _updatePwrBuildingDto: UpdatePwrBuildingDto) {
    return `This action updates a #${id.toString()} pwrBuilding`;
  }

  remove(id: number) {
    return `This action removes a #${id.toString()} pwrBuilding`;
  }
}
