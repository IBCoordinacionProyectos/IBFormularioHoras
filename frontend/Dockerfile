# =======================================
# Build stage
# =======================================
FROM node:20-alpine AS builder

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
# Ensure devDependencies are installed
ENV NPM_CONFIG_PRODUCTION=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NODE_OPTIONS=--max_old_space_size=4096

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    # Add build dependencies for node-gyp and native modules
    libc6-compat \
    # Add build tools for node-sass
    gcc

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Configure npm
RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 120000

# Install all dependencies including devDependencies
RUN npm ci --no-audit --progress=false

# Verify Vite is installed
RUN node -p "require.resolve('vite/package.json')"

# Copy source code (excluding files in .dockerignore)
COPY . .

# Build the application
RUN npm run build

# =======================================
# Production stage
# =======================================
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx /var/tmp/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx.pid /var/log/nginx /var/tmp/nginx /etc/nginx/conf.d /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run/nginx.pid /var/log/nginx /var/tmp/nginx /etc/nginx/conf.d /usr/share/nginx/html

# Set working directory
WORKDIR /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
