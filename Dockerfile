# Use a base image with ffmpeg pre-installed
FROM jrottenberg/ffmpeg:4.3-ubuntu

# Set the DEBIAN_FRONTEND to noninteractive to avoid timezone prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Set up the work directory for your application
WORKDIR /ffmpeg-server

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Expose the server port
EXPOSE 8080

# Start the application using pm2
CMD ["npx", "pm2-runtime", "src/app.js"]
