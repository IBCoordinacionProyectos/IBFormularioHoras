# =========================
# Etapa de construcción
# =========================
FROM node:18-slim AS build

# Directorio de trabajo
WORKDIR /app

# Variables de entorno para build
ENV NODE_ENV=production

# Copiar solo archivos necesarios para instalar dependencias
COPY package*.json ./
COPY tsconfig.json ./ 
COPY tailwind.config.js ./ 
COPY postcss.config.js ./ 
COPY vite.config.ts ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación (salida: dist/)
RUN npm run build

# =========================
# Etapa de producción
# =========================
FROM nginx:stable-alpine AS production

# Limpiar contenido por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar la aplicación compilada desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
# Asegúrate que este archivo incluya la regla SPA con try_files
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
