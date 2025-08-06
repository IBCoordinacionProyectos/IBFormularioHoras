# Usa una imagen base de Python
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de requisitos e instala las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto de la aplicación
COPY . .

# Comando para ejecutar la aplicación con Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
