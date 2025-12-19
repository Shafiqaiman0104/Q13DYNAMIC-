# Dockerfile
FROM nginx:alpine

# Copy your website files
COPY . /usr/share/nginx/html/

# Create a script to replace environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "Replacing environment variables..."' >> /docker-entrypoint.sh && \
    echo 'sed -i "s|%%PRODUCT_DATABASE_URL%%|$PRODUCT_DATABASE_URL|g" /usr/share/nginx/html/config.js' >> /docker-entrypoint.sh && \
    echo 'sed -i "s|%%ORDER_DATABASE_URL%%|$ORDER_DATABASE_URL|g" /usr/share/nginx/html/config.js' >> /docker-entrypoint.sh && \
    echo 'sed -i "s|%%AGENT_DATABASE_URL%%|$AGENT_DATABASE_URL|g" /usr/share/nginx/html/config.js' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
