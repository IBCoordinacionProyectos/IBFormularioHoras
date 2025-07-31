# Stage 1: Build React app
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --silent

# Copy the rest of the application source code
COPY . .

# Build the production version of the app
RUN npm run build

# Stage 2: Serve app with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's public folder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 to the host
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
