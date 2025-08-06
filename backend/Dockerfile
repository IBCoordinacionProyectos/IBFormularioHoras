# 1. Base ligera de Python con pip incluido
FROM python:3.11-slim AS base  
WORKDIR /app

# 2. Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

# 3. Instala dependencias del backend
COPY requirements.txt ./  
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. Copia el código del backend
COPY . ./

# 5. (Opcional) Crear usuario no-root
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

# 6. Exponer puerto y configurar healthcheck
EXPOSE ${PORT}  
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# 7. Comando de arranque
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
