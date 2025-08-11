# =========================
# Etapa de construcción
# =========================
FROM node:20-slim AS build

WORKDIR /app
ENV NODE_ENV=production

# Copiar archivos base para resolver dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vite.config.ts ./

# Instalación robusta (incluye optionalDependencies como los binarios de Rollup)
RUN npm install --include=optional --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Compilar (aseguramos permisos del binario de Vite en imágenes slim)
RUN chmod +x node_modules/.bin/vite && npm run build

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
