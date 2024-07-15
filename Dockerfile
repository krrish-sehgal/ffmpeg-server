# # Fetching the minified node image on apline linux
# FROM node:slim

# # Declaring env
# ENV NODE_ENV production

# # Setting up the work directory
# WORKDIR /ffmpeg-server

# # Copying all the files in our project
# COPY . .

# # Installing dependencies
# RUN npm install

# # Installing pm2 globally
# RUN npm install pm2 -g

# # Starting our application
# CMD pm2 start process.yml && tail -f /dev/null

# # Exposing server port
# EXPOSE 5000

# Use a base image with ffmpeg pre-installed
FROM jrottenberg/ffmpeg:4.3-ubuntu

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Set up the work directory for your application
WORKDIR /ffmpeg-server

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Expose the server port
EXPOSE 80

# Start the application
CMD ["node", "src/app.js"]
