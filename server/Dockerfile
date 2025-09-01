# Development stage
FROM node:24-alpine AS development

RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (dev and production)
RUN npm install

RUN npx prisma generate --schema=./prisma/schema.prisma

# Expose port
EXPOSE 3001