# =========================
# Etapa de dependencias
# =========================
FROM node:20-alpine AS deps

WORKDIR /app
ENV NODE_ENV=production

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vite.config.ts ./

# Limpiar caché y reinstalar dependencias
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install -g npm@latest

# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS build

WORKDIR /app
ENV NODE_ENV=production

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar el resto del código fuente
COPY . .

# 🔹 FIX de permisos para que vite pueda ejecutarse
# Asegurarse de que los binarios son ejecutables
RUN chmod +x node_modules/.bin/*

# Compilar la aplicación con más memoria disponible
RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build

# =========================
# Etapa de producción
# =========================
FROM nginx:stable-alpine AS production

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar artefactos compilados (incluye .gz y .br generados por Vite)
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración optimizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
