#!/bin/bash
set -e

# Test runner script for atoms-ts tests
# This script ensures npm dependencies are installed and runs mocha tests

cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install || npm install
fi

# Run tests with mocha, using ts-node to handle TypeScript
echo "Running atoms-ts tests..."
npx mocha \
    --require ts-node/register \
    --extensions ts \
    --timeout 20000 \
    --reporter spec \
    --ui bdd \
    'src/**/*.test.ts'

exit $?
