#!/bin/bash

echo "🚀 Setting up Real-Time Chat Application..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a Firebase project at https://console.firebase.google.com/"
echo "2. Enable Google Authentication"
echo "3. Copy your Firebase config to frontend/.env"
echo "4. Run 'npm run dev' to start both servers"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend will be available at: http://localhost:3001" 