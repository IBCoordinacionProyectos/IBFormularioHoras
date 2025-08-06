# Etapa de construcción
FROM node:18-slim AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Variables de entorno para optimizar el build
ENV CI=true \
    GENERATE_SOURCEMAP=false

# Copiar package.json e instalar dependencias
COPY package*.json ./

# Instalar dependencias y react-scripts globalmente
RUN npm install -g react-scripts && \
    npm ci --legacy-peer-deps --unsafe-perm && \
    chown -R node:node /app

# Cambiar al usuario node para evitar problemas de permisos
USER node

# Copiar el resto del código fuente
COPY --chown=node:node . .

# Compilar la aplicación para producción
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine

# Limpiar contenido por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar la aplicación construida
COPY --from=build /app/build/ /usr/share/nginx/html/

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
