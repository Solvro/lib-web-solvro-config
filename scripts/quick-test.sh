#!/bin/bash
# Quick test runner for specific scenarios

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

print_help() {
  echo "Usage: $0 [OPTION]"
  echo ""
  echo "Quick test runner for @solvro/config"
  echo ""
  echo "Options:"
  echo "  full       Run full integration test (default)"
  echo "  eslint     Test only ESLint configuration"
  echo "  prettier   Test only Prettier configuration"
  echo "  all        Test --all flag"
  echo "  help       Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0              # Run full integration test"
  echo "  $0 eslint       # Test only ESLint"
  echo "  $0 prettier     # Test only Prettier"
}

run_quick_test() {
  local tool="$1"
  local test_dir="/tmp/solvro-quick-test-$(date +%s)"

  echo "🚀 Running quick test for: $tool"
  echo "Test directory: $test_dir"

  # Build and pack
  cd "$PROJECT_ROOT"
  npm run build >/dev/null 2>&1
  npm pack >/dev/null 2>&1

  # Create test app
  mkdir -p "$test_dir"
  cd "$test_dir"

  echo "Creating Next.js app..."
  npx create-next-app@latest test-app \
    --typescript \
    --eslint \
    --app \
    --import-alias "@/*" \
    --no-git >/dev/null 2>&1

  cd test-app

  # Install package
  cp "$PROJECT_ROOT"/solvro-config-*.tgz .
  npm install ./solvro-config-*.tgz >/dev/null 2>&1

  # Initialize git
  git init >/dev/null 2>&1
  git add . >/dev/null 2>&1
  git commit -m "Initial commit" >/dev/null 2>&1

  # Run specific test
  case "$tool" in
  "eslint")
    echo "Testing ESLint configuration..."
    npx @solvro/config --eslint --force
    test -f eslint.config.js && echo "✅ ESLint config created"
    npx eslint . --max-warnings 0 && echo "✅ ESLint passed"
    ;;
  "prettier")
    echo "Testing Prettier configuration..."
    npx @solvro/config --prettier --force
    grep -q '"prettier"' package.json && echo "✅ Prettier config added"
    npx prettier --check . && echo "✅ Prettier check passed"
    ;;
  "all")
    echo "Testing all tools..."
    npx @solvro/config --all --force
    test -f eslint.config.js && echo "✅ ESLint config created"
    grep -q '"prettier"' package.json && echo "✅ Prettier config added"
    npx prettier --write . >/dev/null 2>&1
    npx eslint . --max-warnings 0 && echo "✅ All tools working"
    ;;
  "full")
    echo "Running full test..."
    "$SCRIPT_DIR/test-integration.sh"
    return
    ;;
  *)
    echo "Unknown test: $tool"
    print_help
    exit 1
    ;;
  esac

  echo "✅ Quick test completed successfully!"

  # Cleanup
  rm -rf "$test_dir"
}

# Main script
case "${1:-full}" in
"help" | "-h" | "--help")
  print_help
  exit 0
  ;;
*)
  run_quick_test "${1:-full}"
  ;;
esac
