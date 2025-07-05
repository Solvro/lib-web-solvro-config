#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
  if [ -d "$TEST_DIR" ]; then
    print_status "Cleaning up test directory: $TEST_DIR"
    rm -rf "$TEST_DIR"
  fi
}

# Set up trap for cleanup
trap cleanup EXIT

# Configuration
TEST_DIR="/tmp/solvro-config-integration-test-$(date +%s)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI_PATH="$PROJECT_ROOT/dist/cli/index.js"

# Helper function to run solvro config CLI
run_solvro_cli() {
  node "$CLI_PATH" "$@"
}

print_status "Starting @solvro/config integration test"
print_status "Test directory: $TEST_DIR"

# Build the package
print_status "Building @solvro/config package"
cd "$PROJECT_ROOT"
npm run build
npm pack

# Get the package file name
PACKAGE_FILE=$(ls solvro-config-*.tgz | head -1)
print_success "Package built: $PACKAGE_FILE"

# Create test directory
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Create Next.js app
print_status "Creating Next.js application"
npx create-next-app@latest test-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

cd test-app

# Copy and install the package
print_status "Installing @solvro/config from local package"
cp "$PROJECT_ROOT/$PACKAGE_FILE" .
npm install "./$PACKAGE_FILE"

# Initialize git repository
print_status "Initializing git repository"
git init
git add .
git commit -m "Initial commit"

# Test CLI help
print_status "Testing CLI help command"
npx @solvro/config --help

# Test version command
print_status "Testing CLI version command"
VERSION=$(npx @solvro/config --version)
print_success "CLI version: $VERSION"

# Test individual tool installation
print_status "Testing individual tool installations"

# Test ESLint only
print_status "Installing ESLint configuration"
npx @solvro/config --eslint --force

if [ -f "eslint.config.js" ]; then
  print_success "ESLint configuration file created"
else
  print_error "ESLint configuration file not found"
  exit 1
fi

# Test Prettier only
print_status "Installing Prettier configuration"
npx @solvro/config --prettier --force

if grep -q '"prettier"' package.json; then
  print_success "Prettier configuration added to package.json"
else
  print_error "Prettier configuration not found in package.json"
  exit 1
fi

# Test all tools installation
print_status "Installing all tools"
npx @solvro/config --all --force

# Verify all configurations
print_status "Verifying all configurations"

# Check ESLint
if [ -f "eslint.config.js" ]; then
  print_success "✓ ESLint config exists"
else
  print_error "✗ ESLint config missing"
  exit 1
fi

# Check Prettier
if grep -q '"prettier"' package.json; then
  print_success "✓ Prettier config found in package.json"
else
  print_error "✗ Prettier config missing"
  exit 1
fi

# Check GitHub Actions
if [ -d ".github/workflows" ]; then
  print_success "✓ GitHub Actions workflows created"
  ls -la .github/workflows/
else
  print_warning "ℹ GitHub Actions not found (may be expected)"
fi

# Test ESLint execution
print_status "Testing ESLint execution"
if npx eslint . --max-warnings 0; then
  print_success "ESLint passed without warnings"
else
  print_warning "ESLint found issues, will format and retry"
fi

# Test Prettier formatting
print_status "Testing Prettier formatting"
npx prettier --write .
print_success "Code formatted with Prettier"

# Test ESLint again after formatting
print_status "Testing ESLint after formatting"
if npx eslint . --max-warnings 0; then
  print_success "ESLint passed after formatting"
else
  print_error "ESLint still has issues after formatting"
  exit 1
fi

# Verify Prettier check
print_status "Verifying Prettier formatting"
if npx prettier --check .; then
  print_success "All files are properly formatted"
else
  print_error "Some files are not properly formatted"
  exit 1
fi

# Test Next.js build
print_status "Testing Next.js build"
if npm run build; then
  print_success "Next.js build successful"
else
  print_error "Next.js build failed"
  exit 1
fi

# Test error conditions
print_status "Testing error conditions"

# Create a new app without git to test error handling
cd "$TEST_DIR"
mkdir error-test
cd error-test

npx create-next-app@latest error-app \
  --typescript \
  --eslint \
  --app \
  --import-alias "@/*" \
  --no-git

cd error-app
cp "$PROJECT_ROOT/$PACKAGE_FILE" .
npm install "./$PACKAGE_FILE"

# Test without git repository (should fail without --force)
print_status "Testing without git repository (should fail)"
if npx @solvro/config --eslint 2>&1 | grep -q "uncommitted changes"; then
  print_success "Correctly detected missing git repository"
else
  print_error "Should have failed without git repository"
  exit 1
fi

# Test with no tools specified (should fail)
print_status "Testing with no tools specified (should fail)"
git init
git add .
git commit -m "Initial commit"

if npx @solvro/config --force 2>&1 | grep -q "No tools specified"; then
  print_success "Correctly failed when no tools specified"
else
  print_error "Should have failed with no tools specified"
  exit 1
fi

print_success "🎉 All integration tests passed!"
print_status "Test completed successfully"
