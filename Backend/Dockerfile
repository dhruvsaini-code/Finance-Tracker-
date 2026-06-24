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

# Health check probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:' + (process.env.PORT || 5000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Start server
CMD ["node", "app.js"]
