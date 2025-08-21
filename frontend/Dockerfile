# =========================
# Etapa de dependencias (con devDependencies)
# =========================
FROM node:20-alpine AS deps
WORKDIR /app

# Asegura que se instalen devDependencies (vite, plugins, etc.)
ENV NPM_CONFIG_PRODUCTION=false

# Solo lockfiles para cache estable
COPY package*.json ./

# Instala dependencias
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Binario MUSL de Rollup para Alpine (evita "Exec format error")
RUN if [ -f "./node_modules/rollup/package.json" ]; then \
    ROLLUP_VERSION=$(node -p "require('./node_modules/rollup/package.json').version"); \
    npm i -D @rollup/rollup-linux-x64-musl@$ROLLUP_VERSION --no-save; \
  fi

# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Reusa node_modules resueltos en deps
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copia SOLO fuentes y configs necesarias (evita arrastrar node_modules del host)
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src
COPY index.html ./

# Build de producción
RUN npm run build

# =========================
# Etapa de producción (Nginx)
# =========================
FROM nginx:stable-alpine AS production

# Si NO tienes un nginx.conf propio, comenta la línea COPY y usa este default:
# (Descomenta el RUN si no usarás tu propio nginx.conf)
# RUN printf 'server {\n\
#   listen 80;\n\
#   server_name _;\n\
#   root /usr/share/nginx/html;\n\
#   index index.html;\n\
#   location / { try_files $uri $uri/ /index.html; }\n\
# }\n' > /etc/nginx/conf.d/default.conf

# Si SÍ tienes nginx.conf en el repo:
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia artefactos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
