# Use a base image with ffmpeg pre-installed
FROM jrottenberg/ffmpeg:4.3-ubuntu

# Set the DEBIAN_FRONTEND to noninteractive to avoid timezone prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, npm, and set the timezone
RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

# Set up the work directory for your application
WORKDIR /ffmpeg-server

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Set permissions for app.js
RUN chmod +x src/app.js

# Expose the server port
EXPOSE 8080

# Start the application using pm2
CMD ["npx", "pm2-runtime", "src/app.js"]
