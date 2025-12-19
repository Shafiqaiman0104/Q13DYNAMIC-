#!/bin/bash
echo "=== Q13 Dynamic Deployment ==="

# Debug: Show Node.js and npm version
echo "Node version: $(node --version 2>/dev/null || echo 'Not installed')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'Not installed')"

# Try to install serve if not present
if ! command -v serve &> /dev/null; then
    echo "serve command not found, installing..."
    npm install -g serve 2>/dev/null || echo "Failed to install serve"
fi

# Debug: Show current directory
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "ERROR: index.html not found in $(pwd)!"
    find / -name "index.html" 2>/dev/null | head -5
    exit 1
fi

echo ""
echo "=== Environment Variables ==="
echo "PRODUCT_DATABASE_URL: ${PRODUCT_DATABASE_URL:0:50}..."  # Show first 50 chars
echo "ORDER_DATABASE_URL: ${ORDER_DATABASE_URL:0:50}..."
echo "AGENT_DATABASE_URL: ${AGENT_DATABASE_URL:0:50}..."

echo ""
echo "=== Replacing placeholders ==="

# Create backup
cp index.html index.html.backup

# Replace placeholders
if [ -n "$PRODUCT_DATABASE_URL" ]; then
    echo "Replacing PRODUCT_DATABASE_URL..."
    sed -i "s|%%PRODUCT_DATABASE_URL%%|$PRODUCT_DATABASE_URL|g" index.html
else
    echo "WARNING: PRODUCT_DATABASE_URL not set!"
fi

if [ -n "$ORDER_DATABASE_URL" ]; then
    echo "Replacing ORDER_DATABASE_URL..."
    sed -i "s|%%ORDER_DATABASE_URL%%|$ORDER_DATABASE_URL|g" index.html
else
    echo "WARNING: ORDER_DATABASE_URL not set!"
fi

if [ -n "$AGENT_DATABASE_URL" ]; then
    echo "Replacing AGENT_DATABASE_URL..."
    sed -i "s|%%AGENT_DATABASE_URL%%|$AGENT_DATABASE_URL|g" index.html
else
    echo "WARNING: AGENT_DATABASE_URL not set!"
fi

echo ""
echo "=== Verification ==="
echo "Checking replacement (first match):"
grep -o "PRODUCT_DATABASE_URL = '[^']*'" index.html | head -1

echo ""
echo "✅ Deployment complete!"
