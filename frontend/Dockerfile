# =========================
# Etapa de dependencias
# =========================
FROM node:20-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production

# Archivos mínimos para resolver dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vite.config.ts ./

# Instalación robusta (incluye optionalDependencies)
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm install --legacy-peer-deps

# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

# Copiamos node_modules ya resueltos para Alpine (musl)
COPY --from=deps /app/node_modules ./node_modules

# Copiamos el resto del código
COPY . .

# 🔧 FIX: forzar binario nativo de Rollup para Alpine (musl) con la versión exacta instalada
RUN ROLLUP_VERSION=$(node -p "require('./node_modules/rollup/package.json').version") && \
    npm i -D @rollup/rollup-linux-x64-musl@${ROLLUP_VERSION} --no-save

# Permisos para binarios (vite, etc.) y build
RUN chmod +x node_modules/.bin/* && \
    npm run build

# =========================
# Etapa de producción
# =========================
FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html

# Limpiar contenido por defecto
RUN rm -rf ./*

# Copiar artefactos compilados
COPY --from=build /app/dist ./

# Nginx SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
