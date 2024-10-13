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
