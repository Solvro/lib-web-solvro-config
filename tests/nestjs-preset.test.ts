import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TestEnvironment } from "./utils/test-environment";

describe("NestJS Preset Tests", () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment("nestjs-preset");
    await env.setup();
  });

  afterAll(() => {
    env?.cleanup();
  });

  describe("NestJS without Swagger", () => {
    it("should use flatNoSwagger config when @nestjs/swagger is not installed", async () => {
      const appPath = await env.createNestjsApp("nestjs-no-swagger");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Run solvro config with NestJS preset
      const output = await env.runSolvroConfig(appPath, [
        "--eslint",
        "--force",
      ]);
      expect(output).toContain("Configuration completed successfully");

      // Verify ESLint runs without Swagger-specific errors
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);

      // Verify the config file was created
      expect(env.fileExists(appPath, "eslint.config.mjs")).toBe(true);

      // Read the generated config to verify it's using the solvro config
      const eslintConfig = env.readFile(appPath, "eslint.config.mjs");
      expect(eslintConfig).toContain("@solvro/config/eslint");
      expect(eslintConfig).toContain("solvro()");

      // Verify @nestjs/core package is installed (which triggers NestJS preset)
      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain("@nestjs/core");
    });

    it("should lint default NestJS template successfully without Swagger", async () => {
      const appPath = await env.createNestjsApp("nestjs-template-no-swagger");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Configure ESLint
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Format code first to ensure consistent formatting
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Run ESLint on the default template
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);

      // Verify no Swagger-specific linting errors
      expect(eslintResult.output).not.toContain(
        "api-property-matches-property-optionality",
      );
      expect(eslintResult.output).not.toContain(
        "controllers-should-supply-api-tags",
      );
      expect(eslintResult.output).not.toContain(
        "api-method-should-specify-api-response",
      );
    });
  });

  describe("NestJS with Swagger", () => {
    it("should use flatRecommended config with Swagger rules when @nestjs/swagger is installed", async () => {
      const appPath = await env.createNestjsApp("nestjs-with-swagger");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Install @nestjs/swagger
      await env.installPackage(appPath, "@nestjs/swagger");

      // Run solvro config with NestJS preset
      const output = await env.runSolvroConfig(appPath, [
        "--eslint",
        "--force",
      ]);
      expect(output).toContain("Configuration completed successfully");

      // Verify the config file was created
      expect(env.fileExists(appPath, "eslint.config.mjs")).toBe(true);

      // Read the generated config to verify it's using the solvro config
      const eslintConfig = env.readFile(appPath, "eslint.config.mjs");
      expect(eslintConfig).toContain("@solvro/config/eslint");
      expect(eslintConfig).toContain("solvro()");

      // Verify @nestjs/core package is installed (which triggers NestJS preset)
      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain("@nestjs/core");
    });

    it("should enforce Swagger-specific rules when @nestjs/swagger is installed", async () => {
      const appPath = await env.createNestjsApp("nestjs-swagger-rules");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Install @nestjs/swagger
      await env.installPackage(appPath, "@nestjs/swagger");

      // Configure ESLint
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Create a sample controller that violates Swagger rules
      const controllerContent = `
import { Controller, Get } from '@nestjs/common';

export class TestDto {
  name?: string;
  age: number;
}

@Controller('test')
export class TestController {
  @Get()
  findAll(): TestDto[] {
    return [];
  }
}
`;

      env.writeFile(appPath, "src/test.controller.ts", controllerContent);

      // Run ESLint - it should detect Swagger violations
      const eslintResult = await env.runESLint(appPath);

      // The default NestJS template should pass, but our test controller should have issues
      // We expect specific Swagger-related warnings/errors
      expect(eslintResult.output).toContain(
        "controllers-should-supply-api-tags",
      );
    });

    it("should fail with default NestJS template when Swagger rules are enforced", async () => {
      const appPath = await env.createNestjsApp("nestjs-template-swagger-fail");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Install @nestjs/swagger to activate Swagger rules
      await env.installPackage(appPath, "@nestjs/swagger");

      // Configure ESLint with NestJS preset
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Format code first
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Run ESLint on the default template - it should fail with Swagger rules
      const eslintResult = await env.runESLint(appPath, [
        "--",
        "--max-warnings",
        "0",
      ]);

      // The default NestJS template doesn't follow Swagger conventions
      // so it should fail when Swagger rules are enabled
      expect(eslintResult.success).toBe(false);

      // Verify we get Swagger-specific linting errors
      const output = eslintResult.output;
      expect(output).toMatch(
        /controllers-should-supply-api-tags|api-method-should-specify-api-response|api-method-should-specify-api-operation/,
      );
    });

    it("should pass ESLint when proper Swagger decorators are used", async () => {
      const appPath = await env.createNestjsApp("nestjs-swagger-correct");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Install @nestjs/swagger
      await env.installPackage(appPath, "@nestjs/swagger");

      // Configure ESLint
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Create a simple service with Swagger decorators
      const swaggerServiceContent = `
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;
}

@Injectable()
export class UserService {
  getUser(): UserDto {
    return { name: 'John', age: 30 };
  }
}
`;

      env.writeFile(appPath, "src/user.service.ts", swaggerServiceContent);

      // Update AppController to have proper Swagger decorators
      const appControllerContent = `
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ description: 'Get hello message' })
  @ApiOkResponse({ description: 'Returns hello message', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
`;

      env.writeFile(appPath, "src/app.controller.ts", appControllerContent);

      // Update AppModule to include UserService and ensure AppController is registered
      const appModuleContent = `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
`;

      env.writeFile(appPath, "src/app.module.ts", appModuleContent);

      // Format the code
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Run ESLint - should pass with proper Swagger decorators
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success, eslintResult.output).toBe(true);
    });
  });

  describe("NestJS-specific ESLint rules", () => {
    it("should allow empty classes in *.module.ts files", async () => {
      const appPath = await env.createNestjsApp("nestjs-module-rules");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Configure ESLint
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Create a module with empty class (should be allowed)
      const moduleContent = `
import { Module } from '@nestjs/common';

@Module({})
export class EmptyModule {}
`;

      env.writeFile(appPath, "src/empty.module.ts", moduleContent);

      // Format the code
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Run ESLint - should pass (empty classes allowed in modules)
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);
    });

    it("should disable no-floating-promises rule in main.ts", async () => {
      const appPath = await env.createNestjsApp("nestjs-main-rules");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Configure ESLint
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Modify main.ts to have floating promises (should be allowed in main.ts)
      const mainContent = `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // This floating promise should be allowed in main.ts
  app.listen(3000);
}
bootstrap();
`;

      env.writeFile(appPath, "src/main.ts", mainContent);

      // Format the code
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Run ESLint - should pass (floating promises allowed in main.ts)
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);
    });

    it("should allow unary plus operator for type coercion", async () => {
      const appPath = await env.createNestjsApp("nestjs-coercion-rules");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Configure ESLint
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Create a service that uses unary plus for type coercion
      const serviceContent = `
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoercionService {
  convertToNumber(value: string): number {
    // This should be allowed
    return +value;
  }
}
`;

      env.writeFile(appPath, "src/coercion.service.ts", serviceContent);

      // Format the code
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Run ESLint - should pass (unary plus allowed)
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);
    });

    it("should disable top-level await rule", async () => {
      const appPath = await env.createNestjsApp("nestjs-await-rules");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Configure ESLint
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      // Create a file that doesn't use top-level await (should not be enforced)
      const configContent = `
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  getConfig(): string {
    return 'config';
  }
}

function getConfig(): ConfigService {
  return new ConfigService();
}

export const config = getConfig();
`;

      env.writeFile(appPath, "src/config.ts", configContent);

      // Format the code
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Run ESLint - should pass (top-level await not enforced)
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);
    });
  });
});
