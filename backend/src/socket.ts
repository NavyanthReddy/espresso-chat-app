import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { User, Message, Room, JoinRoomPayload, SendMessagePayload } from './types';
import { databaseService } from './database';
import { v4 as uuidv4 } from 'uuid';

// Helper functions
const generateId = (): string => {
  return uuidv4();
};

const createRoom = async (name: string): Promise<Room> => {
  const room: Room = {
    id: generateId(),
    name,
    users: new Map<string, User>(),
    messages: [],
    createdAt: new Date()
  };
  await databaseService.createRoom(room);
  return room;
};

export const setupSocketIO = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Track user's joined rooms
    (socket as any).joinedRooms = new Set<string>();

    // Handle user authentication
    socket.on('authenticate', async (user: User) => {
      try {
        const authenticatedUser = {
          ...user,
          socketId: socket.id
        };
        
        await databaseService.createUser(authenticatedUser);
        (socket as any).user = authenticatedUser;
        console.log(`User authenticated: ${user.name}`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Handle joining a room
    socket.on('join_room', async (payload: JoinRoomPayload) => {
      try {
        const { roomId, user } = payload;
        const socketUser = (socket as any).user;
        
        if (!socketUser) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        let room = await databaseService.getRoom(roomId);

        // Create room if it doesn't exist
        if (!room) {
          room = await createRoom(roomId);
        }

        // Check if user is already in this room
        if ((socket as any).joinedRooms.has(roomId)) {
          socket.emit('error', { message: 'User already in this room' });
          return;
        }

        // Join the room
        socket.join(roomId);
        (socket as any).joinedRooms.add(roomId);
        
        // Add user to room in database
        await databaseService.addUserToRoom(roomId, socketUser.id);

        // Get updated room data
        const updatedRoom = await databaseService.getRoom(roomId);
        if (updatedRoom) {
          const users = await databaseService.getRoomUsers(roomId);
          const messages = await databaseService.getRoomMessages(roomId);

          // Send room info to the user
          socket.emit('room_joined', {
            room: updatedRoom,
            messages,
            users
          });

          // Notify other users in the room
          socket.to(roomId).emit('user_joined', {
            user: socketUser,
            roomId
          });
        }

        console.log(`User ${socketUser.name} joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave_room', async (roomId: string) => {
      try {
        const socketUser = (socket as any).user;
        
        if (!socketUser) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!(socket as any).joinedRooms.has(roomId)) {
          socket.emit('error', { message: 'User not in this room' });
          return;
        }

        // Leave the room
        socket.leave(roomId);
        (socket as any).joinedRooms.delete(roomId);
        
        // Remove user from room in database
        await databaseService.removeUserFromRoom(roomId, socketUser.id);

        // Notify other users in the room
        socket.to(roomId).emit('user_left', {
          user: socketUser,
          roomId
        });

        console.log(`User ${socketUser.name} left room: ${roomId}`);
      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (payload: SendMessagePayload) => {
      try {
        const { text, roomId } = payload;
        const socketUser = (socket as any).user;
        
        if (!socketUser) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!(socket as any).joinedRooms.has(roomId)) {
          socket.emit('error', { message: 'User not in this room' });
          return;
        }

        const room = await databaseService.getRoom(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const message: Message = {
          id: generateId(),
          text,
          user: socketUser,
          timestamp: new Date(),
          roomId
        };

        // Add message to database
        await databaseService.addMessage(message);

        // Broadcast message to all users in the room
        io.to(roomId).emit('message_received', message);

        console.log(`Message sent in room ${roomId}: ${text}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle getting room list
    socket.on('get_rooms', async () => {
      try {
        const rooms = await databaseService.getAllRooms();
        socket.emit('rooms_list', rooms);
      } catch (error) {
        console.error('Get rooms error:', error);
        socket.emit('error', { message: 'Failed to get rooms' });
      }
    });

    // Handle getting user's joined rooms
    socket.on('get_my_rooms', async () => {
      try {
        const socketUser = (socket as any).user;
        
        if (!socketUser) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const joinedRooms = Array.from((socket as any).joinedRooms) as string[];
        const roomDetails = await Promise.all(
          joinedRooms.map(async (roomId: string) => {
            const room = await databaseService.getRoom(roomId);
            if (room) {
              const users = await databaseService.getRoomUsers(roomId);
              return {
                ...room,
                users: Array.from(users)
              };
            }
            return null;
          })
        );

        socket.emit('my_rooms', roomDetails.filter(room => room !== null));
      } catch (error) {
        console.error('Get my rooms error:', error);
        socket.emit('error', { message: 'Failed to get user rooms' });
      }
    });

    // Handle creating a new room
    socket.on('create_room', async (roomName: string) => {
      try {
        const room = await createRoom(roomName);
        socket.emit('room_created', room);
        io.emit('room_added', {
          id: room.id,
          name: room.name,
          userCount: 0,
          createdAt: room.createdAt
        });
      } catch (error) {
        console.error('Create room error:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const socketUser = (socket as any).user;
        if (socketUser) {
          // Remove user from all joined rooms
          const joinedRooms = Array.from((socket as any).joinedRooms) as string[];
          for (const roomId of joinedRooms) {
            await databaseService.removeUserFromRoom(roomId, socketUser.id);
            socket.to(roomId).emit('user_left', {
              user: socketUser,
              roomId
            });
          }

          // Remove user from database
          await databaseService.deleteUser(socketUser.id);
          console.log(`User disconnected: ${socketUser.name}`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return io;
}; 