# Stage 1: Build the Vite production assets
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve compiled static files with Nginx
FROM nginx:alpine

# Copy built site contents to default serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Replace standard default configurations with custom router mappings
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
