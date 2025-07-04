import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PwrBuildingsModule } from "./pwr-buildings/pwr-buildings.module";

@Module({
  imports: [PwrBuildingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
