# =============== deps =================
FROM node:20-alpine AS deps
WORKDIR /app

# Configuración de npm para mejor rendimiento y confiabilidad
ENV NPM_CONFIG_PRODUCTION=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_PREFER_OFFLINE=true \
    npm_config_fetch_timeout=300000 \
    npm_config_fetch_retries=5 \
    npm_config_cache=/tmp/npm-cache

# Usa mirror de npm para mejor velocidad en Latinoamérica
RUN npm config set registry https://registry.npmmirror.com

# Copia solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instalación limpia de dependencias
RUN npm ci --no-audit --no-fund

# =============== build =================
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src
COPY index.html ./

# Build de producción (usa Vite local de devDependencies)
RUN npm run build

# =============== runtime =================
FROM nginx:stable-alpine AS production

# Configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone el puerto 80 para HTTP
EXPOSE 80

# Health check para orquestadores de contenedores
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
