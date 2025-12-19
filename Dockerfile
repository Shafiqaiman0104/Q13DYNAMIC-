# Dockerfile
FROM nginx:alpine

# Install sed (should already be there, but just in case)
RUN apk add --no-cache sed

# Copy website files
COPY . /usr/share/nginx/html/

# Debug: List files
RUN echo "Files in /usr/share/nginx/html/:" && ls -la /usr/share/nginx/html/

# Create entrypoint script that actually works
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "=== Environment Variables ==="' >> /docker-entrypoint.sh && \
    echo 'echo "PRODUCT_DATABASE_URL: $PRODUCT_DATABASE_URL"' >> /docker-entrypoint.sh && \
    echo 'echo "ORDER_DATABASE_URL: $ORDER_DATABASE_URL"' >> /docker-entrypoint.sh && \
    echo 'echo "AGENT_DATABASE_URL: $AGENT_DATABASE_URL"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo 'echo "=== Replacing placeholders ==="' >> /docker-entrypoint.sh && \
    echo 'cd /usr/share/nginx/html/' >> /docker-entrypoint.sh && \
    echo 'if [ -f "config.js" ]; then' >> /docker-entrypoint.sh && \
    echo '  echo "Found config.js, replacing..."' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|%%PRODUCT_DATABASE_URL%%|$PRODUCT_DATABASE_URL|g" config.js' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|%%ORDER_DATABASE_URL%%|$ORDER_DATABASE_URL|g" config.js' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|%%AGENT_DATABASE_URL%%|$AGENT_DATABASE_URL|g" config.js' >> /docker-entrypoint.sh && \
    echo '  echo "Config.js after replacement:"' >> /docker-entrypoint.sh && \
    echo '  cat config.js' >> /docker-entrypoint.sh && \
    echo 'else' >> /docker-entrypoint.sh && \
    echo '  echo "ERROR: config.js not found!"' >> /docker-entrypoint.sh && \
    echo '  ls -la' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo 'echo "=== Starting nginx ==="' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
