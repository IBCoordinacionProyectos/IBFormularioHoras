# Multi-stage build for production
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Install TypeScript globally
RUN npm install -g typescript

# Copy source code
COPY . .

# Build the app with production settings
ENV VITE_API_BASE_URL=https://horas.yeisonduque.top
ENV VITE_BACKEND_URL=https://backend.yeisonduque.top
ENV VITE_ENV=production
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NODE_OPTIONS=--max_old_space_size=4096
ENV HOST=0.0.0.0

# Install serve to run the production build
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "80"]
