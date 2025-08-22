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

# Stage 2: Nginx server
FROM nginx:stable-alpine

# Create necessary directories and set permissions
RUN mkdir -p /var/run/nginx && \
    mkdir -p /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx /var/cache/nginx /var/log/nginx /var/run/nginx.pid && \
    chmod -R 755 /var/run/nginx /var/cache/nginx /var/log/nginx /var/run/nginx.pid

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Set permissions for web content
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
