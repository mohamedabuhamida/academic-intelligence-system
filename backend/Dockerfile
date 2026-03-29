# Use Python 3.10 slim for a smaller image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (needed for some ML libraries)
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Run without --reload in container to avoid worker startup issues
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
