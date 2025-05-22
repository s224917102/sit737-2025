# Use the official Node.js image from the Docker Hub
FROM node:16
 
# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./
 
# Install the dependencies
RUN npm install
 
# Copy the rest of the application files
COPY . .
 
# Expose the port your app will run on (default for Node.js is 3000)
EXPOSE 3000
 
# Define the command to run your app
CMD ["node", "app.js"]