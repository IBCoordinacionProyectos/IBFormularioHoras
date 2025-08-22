# Simplificando el Dockerfile para usar el servidor de desarrollo de Vite
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NODE_OPTIONS=--max_old_space_size=4096

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port (puedes cambiarlo al puerto que prefieras)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the app
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
