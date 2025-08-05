# Dockerfile para el Frontend React 
# Se conecta al backend en 185.92.182.173:8000

# Stage 1: Construcción de la aplicación
FROM node:18-buster AS build
WORKDIR /app

# Instalar dependencias globales necesarias
RUN npm install -g npm@latest

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Definir la URL del backend para la aplicación React
ARG REACT_APP_API_URL=http://185.92.182.173:8000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Compilar la aplicación para producción utilizando npx (evita problemas de permisos)
RUN npx react-scripts build

# Stage 2: Servir con Nginx
FROM nginx:stable-alpine

# Limpiar contenido por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build desde el stage de construcción
COPY --from=build /app/build /usr/share/nginx/html

# Exponer puerto HTTP
EXPOSE 80

# Comando por defecto: iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
