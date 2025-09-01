# Development stage
FROM node:24-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000
