import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { PwrBuildingsService } from "./pwr-buildings.service";

describe("PwrBuildingsService", () => {
  let service: PwrBuildingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PwrBuildingsService],
    }).compile();

    service = module.get<PwrBuildingsService>(PwrBuildingsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
