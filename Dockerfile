# ---------- 1. Base Python con pip garantizado ----------
FROM python:3.11-slim

# ---------- 2. Instala Node.js (v18 LTS aquí) ----------
RUN apt-get update && \
    apt-get install -y curl gnupg2 build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# ---------- 3. Prepara directorio de trabajo ----------
WORKDIR /app

# ---------- 4. Copia y instala dependencias Python ----------
COPY backend/requirements.txt ./backend/
RUN pip install --upgrade pip && \
    pip install -r backend/requirements.txt

# ---------- 5. Copia todo el código y construye el frontend ----------
COPY . .
WORKDIR /app/frontend
RUN npm ci --legacy-peer-deps && npm run build

# ---------- 6. Expone el puerto y arranca Uvicorn ----------
WORKDIR /app
EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
