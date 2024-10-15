# Technical Report: Dockerized Microservices for Student Grade Collection and Analysis

## Introduction
This project is a containerized microservices-based system for collecting and analyzing student grades. The system consists of four key services: Data Collection, Authentication, Analytics, and Show Results, each containerized using Docker. The system leverages RESTful APIs for communication between services, while Docker Compose is used to orchestrate the entire setup.

## Project Architecture
The system follows a microservices architecture with clear separation of concerns between services:
1. **Data Collection Service**: Collects student grade data and stores it in a MySQL database.
2. **Authentication Service**: Validates user credentials before allowing access to the system.
3. **Analytics Service**: Calculates statistics (max, min, average) from grades and stores the results in MongoDB.
4. **Show Results Service**: Displays analytics to authenticated users by reading from MongoDB.

All services are containerized using Docker, and Docker Compose is used to manage the network and dependencies between services.

---

## Docker Components

### 1. **Docker Overview**
Docker is used to package each service into a lightweight container, ensuring that each microservice runs in its own isolated environment. This ensures consistent development and deployment environments, making it easier to scale and manage services independently.

### 2. **Dockerfile for Each Service**
Each service has its own Dockerfile to define the environment and dependencies needed to run the service. Here's a brief explanation of the key Dockerfiles:

#### **a. Data Collection Service (Node.js)**
The Dockerfile for the Data Collection service installs Node.js, copies the source code into the container, installs dependencies, and runs the application.

```dockerfile
# Dockerfile for Enter Data Service
FROM node:lts

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Expose the port
EXPOSE 3000

# Run the application
CMD [ "node", "app.js" ]

```

`FROM node:lts`: This specifies the base image, which includes the latest long-term support (LTS) version of Node.js. This ensures compatibility with the latest stable Node.js features.

`WORKDIR /usr/src/app`: Sets the working directory inside the container to /usr/src/app. Any subsequent commands (like copying files or running commands) are executed in this directory.

`*COPY package.json ./**`: Copies the package.json and package-lock.json (if available) into the container. These files list the project's dependencies.
RUN npm install: Installs the necessary Node.js dependencies inside the container.

`COPY . .`: Copies all the application code from the local directory into the container’s working directory.

`EXPOSE 3000`: Informs Docker that the service listens on port 3000. This allows other services and the host machine to access it when running.

`CMD [ "node", "app.js" ]`: Specifies the default command to run when the container starts. It launches the Node.js application by running app.js.


#### **b. Authentication Service (Python)**
The Authentication service Dockerfile uses Python to install Flask and any required libraries for the authentication logic.

```dockerfile
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
```

`FROM python:3.9-slim`: Specifies the base image, a lightweight version of Python 3.9, reducing unnecessary files for a smaller container.

`WORKDIR /usr/src/app`: Sets the working directory for the service inside the container.

`COPY requirements.txt ./`: Copies the requirements.txt file, which lists all required Python libraries.

`RUN pip install --no-cache-dir -r requirements.txt`: Installs all the necessary Python dependencies, with --no-cache-dir ensuring no installation files are cached, keeping the image small.

`COPY . .`: Copies the source code of the authentication service from the local directory into the container.

`EXPOSE 5000`: Exposes port 5000 to make the service accessible to other containers and the host machine.

`CMD [ "python", "app.py" ]`: Runs the Python application by executing app.py, which launches the authentication service.

#### **c. Analytics Service (Python)**
The Analytics service Dockerfile is similar to the Authentication service. It installs Python, Flask, and the necessary database connectors for MySQL and MongoDB.

```dockerfile
# Dockerfile for Analytics Service
FROM python:3.9-slim

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose the port
EXPOSE 6000

# Run the app
CMD [ "python", "-u", "app.py" ]
```
`FROM python:3.9-slim`: Specifies the Python 3.9 slim image to minimize the container size while including the necessary Python tools.

`WORKDIR /usr/src/app`: Defines the working directory where all files and commands are executed inside the container.

`COPY requirements.txt ./`: Copies the requirements.txt file, which lists all the necessary libraries for the analytics service.

`RUN pip install --no-cache-dir -r requirements.txt`: Installs the Python dependencies listed in requirements.txt without caching, reducing the final image size.

`COPY . .`: Copies the analytics service code from the local directory into the container.

`EXPOSE 6000`: Exposes port 6000 for external access, enabling communication with other services or clients.

`CMD [ "python", "-u", "app.py" ]`: Runs the analytics service by executing app.py. The -u flag ensures unbuffered output, meaning log data is immediately available for real-time monitoring.

#### **d. Show Results Service (Node.js)**
This Dockerfile is very similar to the Data Collection service, as it’s also built with Node.js and serves a web interface.

```dockerfile
# Dockerfile for Show Results Service
FROM node:lts

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Expose the port
EXPOSE 4000

# Run the application
CMD [ "node", "app.js" ]
```

`FROM node:lts`: Specifies the latest long-term support (LTS) version of Node.js, ensuring stable and up-to-date features.

`WORKDIR /usr/src/app`: Sets the working directory inside the container to /usr/src/app.

`COPY package*.json ./`: Copies the package.json and package-lock.json (if available) into the container. These files are used to install project dependencies.

`RUN npm install`: Installs all Node.js dependencies needed to run the service.

`COPY . .`: Copies all the application code from the local directory into the container’s working directory.

`EXPOSE 4000`: Exposes port 4000 for external access, allowing the service to display results.

`CMD [ "node", "app.js" ]`: Starts the Node.js service by running app.js, which serves the analytics results

### 3. Docker Compose for Service Orchestration
Docker Compose is used to define and run the entire multi-container system. Each service is defined in the docker-compose.yml file, and they are connected via networks to allow communication between services. Compose also ensures that each service starts in the correct order and that they share necessary environment variables, such as database credentials.

Here’s an overview of the key components in the docker-compose.yml file:

#### a. MySQL Service
The MySQL service stores the student grade data. The MySQL Docker image is used, with environment variables defined to set the root password and initialize the analytics database.

```yaml
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: analytics
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql # Load init.sql
    networks:
      - backend
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "--silent", "-h", "localhost", "-u", "root", "-pexample"]
      interval: 5s
      timeout: 10s
      retries: 5
```
#### b. MongoDB Service
MongoDB stores the analytics results. The MongoDB container is initialized without any special configurations, but it is exposed to the backend network for communication with other services.

```yaml
  mongodb:
    image: mongo
    container_name: mongodb
    volumes:
      - mongo_data:/data/db
    networks:
      - backend
    ports:
      - "27017:27017"
```
#### c. Data Collection, Authentication, and Show Results Services
These services are linked to both MySQL and MongoDB as needed. Each service has its own container defined in the docker-compose.yml, and the services are networked together via Docker Compose's backend network.

```yaml
  authentication:
    build: ./authentication
    networks:
      - backend
    ports:
      - "5000:5000"

  collection:
    build: ./collection
    depends_on:
      - mysql
      - authentication
    networks:
      - backend
    ports:
      - "3000:3000"
  
  results:
    build: ./results
    depends_on:
      - mongodb
      - authentication
    networks:
      - backend
    ports:
      - "4000:4000"

  analysis:
    build: ./analysis
    depends_on:
      mysql:
        condition: service_healthy
      mongodb:
        condition: service_started
    networks:
      - backend
    ports:
      - "6000:6000"
```
### 4. Volume and Network Setup
Docker Compose defines volumes and networks for service persistence and communication.

Volumes are used for data persistence in the MySQL service, ensuring that database data is not lost when the containers are shut down or restarted.

```yaml
volumes:
  mysql_data:
  mongo_data:

```

The services are connected via a shared network (backend) to allow communication between services.

```yaml
networks:
  backend:
    driver: bridge
```

## Application Logic (Brief Overview)

The application handles basic user interactions and data flows:

1. Data Collection Service: Users input student names and grades, which are submitted to the MySQL database.
2. Authentication Service: Users are required to authenticate before submitting grades or viewing results. This service handles the user login via a simple Flask API.
3. Analytics Service: The Analytics service retrieves grades from MySQL, calculates simple statistics (max, min, average), and stores the results in MongoDB.
4. Show Results Service: Authenticated users can view the calculated analytics, which are retrieved from MongoDB and displayed in the web interface.

## REST API Communication Between Services

Each microservice communicates with others via RESTful APIs:

- Authentication: The Data Collection and Show Results services make HTTP POST requests to the Authentication service to validate user credentials before allowing access.
- Analytics: After new grades are submitted, the Data Collection service sends a request to the Analytics service to trigger recalculating statistics.
- MongoDB & MySQL: The Analytics service reads grades from MySQL and writes the calculated analytics (e.g., max, min, avg) to MongoDB.
- 
## Testing the System

Manual Testing with curl
To manually test each service, you can use curl to simulate API calls:

1. Post to mysql service.
```bash
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{"student_name": "JohnDoe", "grade": 85}'
```

2. Login to nodejs service.
```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'
```

3. Authentication with python service.
```bash
# correct credentials
curl -X POST http://localhost:5000/auth \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'

# incorrect credentials
curl -X POST http://localhost:5000/auth \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password"}'
```

4. Testing mongodb service.
```bash
curl http://localhost:6000/calculate
```

5. Show results from mongodb service.
```bash
curl http://localhost:4000/show_results \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'
```

## Conclusion

This project demonstrates how to design and deploy a containerized microservices system using Docker and Docker Compose. Each service is isolated, modular, and communicates with others through REST APIs, allowing for easy scaling, independent updates, and a robust architecture for handling grade collection and analytics. Docker's role in packaging and managing these services simplifies deployment and ensures consistency across environments.