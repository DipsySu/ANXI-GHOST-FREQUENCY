# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/ui
COPY the-anxi-archives/package*.json ./
RUN npm install
COPY the-anxi-archives/ ./
RUN npm run build

# Stage 2: Build Runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt fastapi uvicorn

# Copy Backend Code
COPY core/ ./core/
COPY *.py .

# Copy Frontend Build from Stage 1
COPY --from=frontend-builder /app/ui/dist ./the-anxi-archives/dist

# Create downloads dir
RUN mkdir -p downloads

# Expose Port
EXPOSE 8000

# Run
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
