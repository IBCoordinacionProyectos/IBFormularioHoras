# syntax=docker/dockerfile:1

# Etapa de construcción
FROM node:22.12.0-slim AS build
WORKDIR /app

ENV CI=true \
    GENERATE_SOURCEMAP=false

# Solo los manifests primero
COPY package*.json ./

# Instalar deps (como root) – Vite 7 compatible con Node 22.12+
RUN npm ci --legacy-peer-deps

# Copiar el resto del código (sin node_modules gracias a .dockerignore)
COPY . .

# Compilar (como root para evitar permisos)
RUN npm run build

# Etapa de producción
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
