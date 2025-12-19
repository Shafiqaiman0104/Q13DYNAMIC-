#!/bin/bash
echo "=== Building Q13 Dynamic ==="

# Replace placeholders
sed -i "s|%%PRODUCT_DATABASE_URL%%|$PRODUCT_DATABASE_URL|g" index.html
sed -i "s|%%ORDER_DATABASE_URL%%|$ORDER_DATABASE_URL|g" index.html
sed -i "s|%%AGENT_DATABASE_URL%%|$AGENT_DATABASE_URL|g" index.html

echo "✅ Build complete! Placeholders replaced."
echo "Verification:"
grep -o "PRODUCT_DATABASE_URL = '[^']*'" index.html | head -1
