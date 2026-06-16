# Multi-Stage Build Dockerfile for Frontend Service
# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:1.25-alpine

# Copy built assets to Nginx server path
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optional nginx configuration if needed, or default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
