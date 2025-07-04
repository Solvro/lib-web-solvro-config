import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { PwrBuildingsController } from "./pwr-buildings.controller";
import { PwrBuildingsService } from "./pwr-buildings.service";

describe("PwrBuildingsController", () => {
  let controller: PwrBuildingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PwrBuildingsController],
      providers: [PwrBuildingsService],
    }).compile();

    controller = module.get<PwrBuildingsController>(PwrBuildingsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
