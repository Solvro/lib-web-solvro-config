#!/bin/bash
# Example usage of @solvro/config CLI with flags

echo "🚀 @solvro/config CLI Examples"
echo "================================="
echo ""

echo "1. Interactive mode (default):"
echo "   npx @solvro/config"
echo ""

echo "2. Install all tools non-interactively:"
echo "   npx @solvro/config --all --force"
echo ""

echo "3. Install specific tools:"
echo "   npx @solvro/config --eslint --prettier --force"
echo ""

echo "4. For CI/CD environments:"
echo "   npx @solvro/config --eslint --prettier --commitlint --force"
echo ""

echo "5. Show help:"
echo "   npx @solvro/config --help"
echo ""

echo "Available flags:"
echo "  --all, -a              Install all tools"
echo "  --eslint              Install ESLint configuration"
echo "  --prettier            Install Prettier configuration"
echo "  --gh-action           Install GitHub Actions"
echo "  --commitlint          Install Commitlint configuration"
echo "  --force, -f           Skip git clean check"
echo "  --help, -h            Display help"
