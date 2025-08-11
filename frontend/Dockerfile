# =========================
# Etapa de construcción
# =========================
FROM node:20-slim AS build

WORKDIR /app
ENV NODE_ENV=production

# Copiar archivos base para dependencias
COPY package*.json ./
COPY tsconfig.json ./ 
COPY tailwind.config.js ./ 
COPY postcss.config.js ./ 
COPY vite.config.ts ./

# Instalar dependencias (incluyendo devDependencies)
RUN npm ci --legacy-peer-deps

# Copiar resto del código
COPY . .

# Dar permisos y compilar
RUN chmod +x node_modules/.bin/vite && npm run build

# =========================
# Etapa de producción
# =========================
FROM nginx:stable-alpine AS production

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar app compilada con archivos .br y .gz
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración Nginx optimizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
