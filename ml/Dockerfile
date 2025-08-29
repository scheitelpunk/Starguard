# STARGUARD ML Service Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML module
COPY detector.py .

# Create models directory
RUN mkdir -p /app/models

# Set permissions
RUN chmod +x detector.py

# Set Python path
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# The container will be managed by the backend service
CMD ["python3", "detector.py"]