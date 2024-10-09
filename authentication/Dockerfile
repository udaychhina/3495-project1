# Dockerfile for Authentication Service
FROM python:3.9-slim

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose the port
EXPOSE 5000

# Run the app
CMD [ "python", "app.py" ]
