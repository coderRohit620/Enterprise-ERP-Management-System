FROM node:18-alpine

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

RUN npm install --production

# Copy remaining source code
COPY . .

# Expose backend service port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Boot server
CMD ["node", "server.js"]
