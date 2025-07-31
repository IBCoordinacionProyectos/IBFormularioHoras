# backend/Dockerfile

# 1. Base image
FROM python:3.11-slim

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copiar únicamente el requirements para aprovechar cache de Docker
COPY backend/requirements.txt ./requirements.txt

# 4. Instalar dependencias
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# 5. Copiar el resto del backend
COPY backend/ /app

# 6. Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]