# Testing Guide

## Available Tests

### Integration Tests

```bash
# Full integration test
npm run test:integration
```

Tests complete workflow: Next.js app creation, package installation, configuration, linting, formatting, and building.

### Quick Tests

```bash
# Test specific tools
npm run test:quick eslint
npm run test:quick prettier
npm run test:quick all
```

### CI/CD Tests

- Standard CI: Basic integration test
- Integration Tests: Matrix testing across Node.js and Next.js versions

## Test Coverage

- ✅ Fresh Next.js app creation and setup
- ✅ CLI flag testing (--eslint, --prettier, --all, --force)
- ✅ ESLint execution and code quality checks
- ✅ Prettier formatting and validation
- ✅ Next.js build verification
- ✅ Error condition handling
- ✅ Multi-version compatibility testing
