# Etapa de construcción
FROM node:20-slim AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Variables de entorno para optimizar el build
ENV CI=true \
    GENERATE_SOURCEMAP=false

# Copiar package.json e instalar dependencias
COPY package*.json ./

# Instalar dependencias con Vite
RUN npm ci --legacy-peer-deps --unsafe-perm && chown -R node:node /app

# Cambiar al usuario node para evitar problemas de permisos
USER node

# Asegurar permisos de ejecución para binarios de node_modules
RUN chmod +x node_modules/.bin/vite

# Copiar el resto del código fuente
COPY --chown=node:node . .

# Compilar la aplicación para producción con Vite
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine

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
