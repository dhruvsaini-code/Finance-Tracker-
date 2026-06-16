# Production Dockerfile for Backend Service
FROM node:20-alpine

# Set node environment
ENV NODE_ENV=production

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "app.js"]
