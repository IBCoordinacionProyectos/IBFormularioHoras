# syntax=docker/dockerfile:1.7

# Etapa de build
FROM node:22.19.0-slim AS build
WORKDIR /app
ENV CI=true \
    GENERATE_SOURCEMAP=false \
    NODE_ENV=production

# Manifiestos primero para cache de deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --legacy-peer-deps

# Código (solo el de este contexto ./frontend gracias al context en Dokploy)
COPY . .
RUN npm run build

# Etapa de runtime: solo archivos estáticos
FROM nginx:alpine
# Config SPA + caché (la definimos abajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia SOLO artefactos compilados
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]