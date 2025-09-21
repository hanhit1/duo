# Stage 1: Build
FROM node:22.16.0-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build selected app
ARG APP_NAME
RUN npm run build ${APP_NAME}

# Stage 2: Runtime
FROM node:22.16.0-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ARG APP_NAME
ENV NODE_ENV=production
ENV APP_NAME=${APP_NAME}

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]
