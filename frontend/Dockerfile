# =========================
# Etapa de dependencias (instala TAMBIÉN devDependencies)
# =========================
FROM node:20-alpine AS deps
WORKDIR /app

# Asegura que npm instale devDependencies (vite, plugin-react, etc.)
ENV NPM_CONFIG_PRODUCTION=false

# Archivos mínimos para resolver deps (mejora cache)
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vite.config.ts ./

# Instala dependencias
# (usa ci si tienes package-lock.json confiable; si no, cae a install)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# 🔧 Rollup en Alpine necesita el binario MUSL; lo forzamos a la MISMA versión
RUN ROLLUP_VERSION=$(node -p "require('./node_modules/rollup/package.json').version") \
 && npm i -D @rollup/rollup-linux-x64-musl@${ROLLUP_VERSION} --no-save

# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos node_modules ya resueltos (con devDeps + rollup musl)
COPY --from=deps /app/node_modules ./node_modules

# Copiamos el resto del código
COPY . .

# Permisos a binarios locales y verificación de vite
RUN chmod +x node_modules/.bin/* \
 && npx vite --version \
 && npm run build

# =========================
# Etapa de producción (Nginx)
# =========================
FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html

# Limpiar contenido por defecto
RUN rm -rf ./*

# Copiar artefactos compilados
COPY --from=build /app/dist ./

# Configuración SPA (usa la tuya)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
