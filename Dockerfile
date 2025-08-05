# ---------- 1. Base Python (incluye pip) ----------
FROM python:3.11-slim

# ---------- 2. Variables de entorno ----------
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

# ---------- 3. Instala Node.js (v18 LTS) y herramientas de compilación ----------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl gnupg2 build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# ---------- 4. Directorio de trabajo ----------
WORKDIR /app

# ---------- 5. Dependencias Python ----------
COPY backend/requirements.txt ./backend/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# ---------- 6. Frontend: copiar y compilar ----------
COPY . .
WORKDIR /app/frontend
RUN npm ci --legacy-peer-deps && \
    npm run build

# ---------- 7. Volver al root de la app ----------
WORKDIR /app

# ---------- 8. Crear usuario no-root (opcional) ----------
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

# ---------- 9. Exponer puerto y healthcheck ----------
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# ---------- 10. Comando de arranque con DEBUG ----------
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
