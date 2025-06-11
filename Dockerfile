# Build stage
FROM node:18 AS builder
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# Copy backend source
COPY backend ./backend

# Final stage
FROM node:18-slim

# Runtime user will be created based on UID/GID environment variables
# provided when the container starts.
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7864
ENV TZ=UTC
RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata gosu && \
    rm -rf /var/lib/apt/lists/*

# Copy built artifacts and backend
COPY --from=builder /app/backend ./backend

COPY --from=builder /app/frontend/build ./frontend/build

ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 7864
CMD ["node", "backend/index.js"]
