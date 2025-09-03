# Etapa de construcción
FROM node:22.11.0-slim AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Variables de entorno para optimizar el build
ENV CI=true \
    GENERATE_SOURCEMAP=false

# Copiar package.json e instalar dependencias
COPY package*.json ./

# Instalar dependencias con Vite
RUN npm ci --legacy-peer-deps --unsafe-perm

# Copiar el resto del código fuente
COPY . .

# Cambiar al usuario node para evitar problemas de permisos
USER node

# Compilar la aplicación para producción con Vite
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Limpiar contenido por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar la aplicación construida desde el directorio dist de Vite
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
