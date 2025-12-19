#!/bin/bash
echo "Deploying Q13 Dynamic..."
echo "Replacing placeholders..."

# Create backup
cp index.html index.html.backup

# Replace placeholders
sed -i "s|%%PRODUCT_DATABASE_URL%%|$PRODUCT_DATABASE_URL|g" index.html
sed -i "s|%%ORDER_DATABASE_URL%%|$ORDER_DATABASE_URL|g" index.html
sed -i "s|%%AGENT_DATABASE_URL%%|$AGENT_DATABASE_URL|g" index.html

echo "Deployment complete!"
