#!/bin/bash

# NiunMango Docker Startup Script

echo "🚀 Starting NiunMango with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Set environment variables
export $(cat docker.env | xargs)

echo "📋 Environment variables loaded:"
echo "   NODE_ENV: $NODE_ENV"
echo "   POSTGRES_DB: $POSTGRES_DB"
echo "   CLIENT_URL: $CLIENT_URL"
echo "   NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ NiunMango is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo "🔴 Redis:    localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop:      docker-compose down"
echo "   Restart:   docker-compose restart"
echo "   Rebuild:   docker-compose up --build -d"
echo ""
echo "📁 Project structure:"
echo "   Frontend: ./client/"
echo "   Backend:  ./server/"
echo "   Docker:   ./docker-compose.yml"
