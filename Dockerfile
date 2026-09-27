# syntax=docker/dockerfile:1.8
# check=error=true

FROM node:26.10.0-alpine AS production-dependencies
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev --ignore-scripts; \
    else \
      npm install --omit=dev --ignore-scripts --no-package-lock; \
    fi && npm cache clean --force

FROM node:26.10.0-alpine AS runtime
ARG APP_VERSION=1.0.0
ARG VCS_REF=local

LABEL org.opencontainers.image.title="AdoptMe API" \
      org.opencontainers.image.description="API REST de adopciones con tests funcionales, Swagger y Docker" \
      org.opencontainers.image.version="$APP_VERSION" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.source="https://github.com/TU_USUARIO_GITHUB/adoptme-final-backend" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
