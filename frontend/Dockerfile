# Dockerfile para el Frontend React 
# Se conecta al backend en 185.92.182.173:8000

# Stage 1: Construcción de la aplicación
FROM node:18-alpine AS build
WORKDIR /app

# Instalación de dependencias
COPY package*.json ./
RUN npm ci --legacy-peer-deps && \
    # Asegurar permisos de ejecutables (react-scripts)
    chmod +x ./node_modules/.bin/react-scripts

# Copia el resto del código y define la URL del backend
COPY . .
ARG REACT_APP_API_URL=http://185.92.182.173:8000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Compila para producción
RUN npm run build


# Stage 2: Servir con Nginx
FROM nginx:stable-alpine
# Limpia la carpeta por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*
# Copia el build generado
COPY --from=build /app/build /usr/share/nginx/html

# Expone el puerto 80 para HTTP
EXPOSE 80

# Inicia Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
