#!/bin/bash
# Development Environment Startup Script
# Starts all services needed for ARCHON + SPARC workflow

echo "🚀 Starting ARCHON + SPARC Development Environment..."

# Start Archon services
echo "📦 Starting Archon Docker services..."
cd archon && docker-compose up -d
cd ..

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 15

# Check service health
echo "🔍 Checking service health..."
echo "- Archon UI (3737): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3737)"
echo "- Archon Server (8181): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8181/health)"
echo "- Archon MCP (8051): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8051)"
echo "- Archon Agents (8052): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8052/health)"

# Start game development server
echo "🎮 Starting game development server..."
npm run dev &

echo "✅ Development environment ready!"
echo ""
echo "📊 Available endpoints:"
echo "- Game: http://localhost:3000"
echo "- Archon UI: http://localhost:3737"
echo "- Archon API: http://localhost:8181/docs"
echo "- Archon MCP: http://localhost:8051"
echo ""
echo "🛠️ SPARC modes available via: npx claude-flow sparc modes"
echo "📋 Project ID: 196233ba-fbac-4ada-b0f9-37658c0e73ea"