# =========================
# Etapa de construcción
# =========================
FROM node:20-slim AS deps

WORKDIR /app
ENV NODE_ENV=production

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vite.config.ts ./

# Limpiar caché y forzar reinstalación de dependencias
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm install --include=optional --legacy-peer-deps

# =========================
# Etapa de construcción real
# =========================
FROM node:20-slim AS build

WORKDIR /app
ENV NODE_ENV=production

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# =========================
# Etapa de producción
# =========================
FROM nginx:stable-alpine AS production

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar artefactos (incluye .gz y .br generados por Vite)
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración de Nginx optimizada para SPA y precomprimidos
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
