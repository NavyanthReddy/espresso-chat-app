# Real-Time Chat Application

A full-stack real-time chat application built with React + TypeScript frontend and Node.js + Express + Socket.IO backend.

## 🚀 Features

- **Real-time messaging** between users in chat rooms
- **Google authentication** using Firebase Auth
- **Room management** - create and join chat rooms
- **Online users** display in each room
- **Isolated message history** per room
- **Responsive UI** with Tailwind CSS

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **React Router** for navigation
- **Socket.IO Client** for real-time communication
- **Firebase Auth** for Google authentication
- **Tailwind CSS** for styling
- **TypeScript** for type safety

### Backend (Node.js + Express + Socket.IO)
- **Express server** with CORS enabled
- **Socket.IO server** for real-time bidirectional communication
- **In-memory storage** for rooms, users, and messages
- **Event-driven architecture** for room management

## 📁 Project Structure

```
EsspressoAssignment/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   ├── services/        # API and socket services
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── server.ts        # Express server setup
│   │   ├── socket.ts        # Socket.IO event handlers
│   │   └── types.ts         # TypeScript type definitions
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3001`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and get your config:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Google Authentication
   - Get your Firebase config from Project Settings

4. Create `.env` file in the frontend directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## 🎯 How to Use

1. **Authentication**: Click "Sign in with Google" to authenticate
2. **Room Management**: 
   - View existing rooms on the home page
   - Create a new room by entering a room name
3. **Chatting**: 
   - Join a room to start chatting
   - Send messages in real-time
   - See online users in the room
4. **Navigation**: Use the navigation bar to switch between rooms or sign out

## 🔧 Socket.IO Events

### Client to Server
- `join_room`: Join a specific chat room
- `send_message`: Send a message to the current room
- `disconnect`: User disconnects (handled automatically)

### Server to Client
- `user_joined`: New user joined the room
- `user_left`: User left the room
- `message_received`: New message in the room
- `room_users`: List of users in the room

## 🚀 Improvements for Production

### Backend Improvements
- **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
- **Authentication**: Implement JWT tokens and server-side auth validation
- **Message Persistence**: Store messages in database with pagination
- **User Management**: User profiles, friend lists, private messages
- **File Upload**: Support for image/file sharing
- **Rate Limiting**: Prevent spam and abuse
- **Error Handling**: Comprehensive error handling and logging
- **Testing**: Unit and integration tests

### Frontend Improvements
- **State Management**: Redux/Zustand for better state management
- **Message Features**: Message editing, deletion, reactions
- **UI/UX**: Better responsive design, dark mode, emoji picker
- **Notifications**: Push notifications for new messages
- **Offline Support**: Service workers for offline functionality
- **Performance**: Virtual scrolling for large message lists
- **Accessibility**: ARIA labels and keyboard navigation

### Infrastructure
- **Deployment**: Docker containers, CI/CD pipeline
- **Scaling**: Load balancing, horizontal scaling
- **Monitoring**: Application performance monitoring
- **Security**: HTTPS, input validation, XSS protection

## 🐛 Known Issues

- In-memory storage means data is lost on server restart
- No message persistence between sessions
- Basic error handling
- No input validation on backend

## 📝 License

MIT License 