import { Module } from "@nestjs/common";

import { PwrBuildingsController } from "./pwr-buildings.controller";
import { PwrBuildingsService } from "./pwr-buildings.service";

@Module({
  controllers: [PwrBuildingsController],
  providers: [PwrBuildingsService],
})
export class PwrBuildingsModule {}
