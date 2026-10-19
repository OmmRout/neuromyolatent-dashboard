# Multi-stage lightweight production Docker container
FROM node:22-alpine AS base

# Install security patches & curl/wget for healthchecks
RUN apk --no-cache add curl wget

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy application source code
COPY . .

# Ensure secure file permissions and non-root user
RUN chown -R node:node /app
USER node

# Expose default HTTP port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "server.js"]
