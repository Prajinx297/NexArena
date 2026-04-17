FROM python:3.10-slim

WORKDIR /app

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Command to run FastAPI via main.py to dynamically parse $PORT
CMD ["python", "main.py"]
