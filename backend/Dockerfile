# --- STAGE 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json tsconfig*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and SQL migrations
COPY src/ ./src/
COPY sql/ ./sql/

# Build TypeScript
RUN npm run build

# --- STAGE 2: Production ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy built application and migrations from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/sql ./sql

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
