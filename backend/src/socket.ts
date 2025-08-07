import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { User, Message, Room, AuthenticatedSocket, JoinRoomPayload, SendMessagePayload, ServerState } from './types';

// In-memory storage
const serverState: ServerState = {
  rooms: new Map<string, Room>(),
  users: new Map<string, User>()
};

// Helper functions
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const createRoom = (name: string): Room => {
  const room: Room = {
    id: generateId(),
    name,
    users: new Map<string, User>(),
    messages: [],
    createdAt: new Date()
  };
  serverState.rooms.set(room.id, room);
  return room;
};

const getUserRooms = (userId: string): Room[] => {
  return Array.from(serverState.rooms.values()).filter(room => 
    room.users.has(userId)
  );
};

export const setupSocketIO = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (user: User) => {
      socket.user = {
        ...user,
        socketId: socket.id
      };
      serverState.users.set(user.id, socket.user);
      console.log(`User authenticated: ${user.name}`);
    });

    // Handle joining a room
    socket.on('join_room', (payload: JoinRoomPayload) => {
      if (!socket.user) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const { roomId, user } = payload;
      let room = serverState.rooms.get(roomId);

      // Create room if it doesn't exist
      if (!room) {
        room = createRoom(roomId);
      }

      // Leave current room if any
      if (socket.currentRoom) {
        socket.leave(socket.currentRoom);
        const currentRoom = serverState.rooms.get(socket.currentRoom);
        if (currentRoom) {
          currentRoom.users.delete(socket.user.id);
          socket.to(socket.currentRoom).emit('user_left', {
            user: socket.user,
            roomId: socket.currentRoom
          });
        }
      }

      // Join new room
      socket.join(roomId);
      socket.currentRoom = roomId;
      
      // Only add user if not already in the room
      if (!room.users.has(socket.user.id)) {
        room.users.set(socket.user.id, socket.user);
      }

      // Send room info to the user
      socket.emit('room_joined', {
        room,
        messages: room.messages,
        users: Array.from(room.users.values())
      });

      // Notify other users in the room
      socket.to(roomId).emit('user_joined', {
        user: socket.user,
        roomId
      });

      console.log(`User ${socket.user.name} joined room: ${roomId}`);
    });

    // Handle sending messages
    socket.on('send_message', (payload: SendMessagePayload) => {
      if (!socket.user || !socket.currentRoom) {
        socket.emit('error', { message: 'User not in a room' });
        return;
      }

      const { text, roomId } = payload;
      const room = serverState.rooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const message: Message = {
        id: generateId(),
        text,
        user: socket.user,
        timestamp: new Date(),
        roomId
      };

      // Add message to room history
      room.messages.push(message);

      // Broadcast message to all users in the room
      io.to(roomId).emit('message_received', message);

      console.log(`Message sent in room ${roomId}: ${text}`);
    });

    // Handle getting room list
    socket.on('get_rooms', () => {
      const rooms = Array.from(serverState.rooms.values()).map(room => ({
        id: room.id,
        name: room.name,
        userCount: room.users.size,
        createdAt: room.createdAt
      }));
      socket.emit('rooms_list', rooms);
    });

    // Handle creating a new room
    socket.on('create_room', (roomName: string) => {
      const room = createRoom(roomName);
      socket.emit('room_created', room);
      io.emit('room_added', {
        id: room.id,
        name: room.name,
        userCount: 0,
        createdAt: room.createdAt
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.user) {
        // Remove user from current room
        if (socket.currentRoom) {
          const room = serverState.rooms.get(socket.currentRoom);
          if (room) {
            room.users.delete(socket.user.id);
            socket.to(socket.currentRoom).emit('user_left', {
              user: socket.user,
              roomId: socket.currentRoom
            });
          }
        }

        // Remove user from global users list
        serverState.users.delete(socket.user.id);
        console.log(`User disconnected: ${socket.user.name}`);
      }
    });
  });

  return io;
}; 