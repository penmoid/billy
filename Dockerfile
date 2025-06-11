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
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and backend
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/build ./frontend/build

EXPOSE 5000
CMD ["node", "backend/index.js"]
