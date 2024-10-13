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
