import { io, Socket } from 'socket.io-client';
import { User, Message, Room, RoomSummary, SocketEvents } from '../types';

class SocketService {
  private socket: Socket<SocketEvents> | null = null;
  private isConnected = false;

  // Connect to the server
  connect(user: User): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Authenticate user
      this.socket?.emit('authenticate', user);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a room
  joinRoom(roomId: string, user: User): void {
    this.socket?.emit('join_room', { roomId, user });
  }

  // Leave a room
  leaveRoom(roomId: string): void {
    this.socket?.emit('leave_room', roomId);
  }

  // Get user's joined rooms
  getMyRooms(): void {
    this.socket?.emit('get_my_rooms');
  }

  // Send a message
  sendMessage(text: string, roomId: string, user: User): void {
    this.socket?.emit('send_message', { text, roomId, user });
  }

  // Get rooms list
  getRooms(): void {
    this.socket?.emit('get_rooms');
  }

  // Create a new room
  createRoom(roomName: string): void {
    this.socket?.emit('create_room', roomName);
  }

  // Event listeners
  onRoomJoined(callback: (data: { room: Room; messages: Message[]; users: User[] }) => void): void {
    this.socket?.on('room_joined', callback);
  }

  onUserJoined(callback: (data: { user: User; roomId: string }) => void): void {
    this.socket?.on('user_joined', callback);
  }

  onUserLeft(callback: (data: { user: User; roomId: string }) => void): void {
    this.socket?.on('user_left', callback);
  }

  onMessageReceived(callback: (message: Message) => void): void {
    this.socket?.on('message_received', callback);
  }

  onRoomsList(callback: (rooms: RoomSummary[]) => void): void {
    this.socket?.on('rooms_list', callback);
  }

  onRoomCreated(callback: (room: Room) => void): void {
    this.socket?.on('room_created', callback);
  }

  onRoomAdded(callback: (room: RoomSummary) => void): void {
    this.socket?.on('room_added', callback);
  }

  onMyRooms(callback: (rooms: Room[]) => void): void {
    this.socket?.on('my_rooms', callback);
  }

  onError(callback: (error: { message: string }) => void): void {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  offRoomJoined(): void {
    this.socket?.off('room_joined');
  }

  offUserJoined(): void {
    this.socket?.off('user_joined');
  }

  offUserLeft(): void {
    this.socket?.off('user_left');
  }

  offMessageReceived(): void {
    this.socket?.off('message_received');
  }

  offRoomsList(): void {
    this.socket?.off('rooms_list');
  }

  offRoomCreated(): void {
    this.socket?.off('room_created');
  }

  offRoomAdded(): void {
    this.socket?.off('room_added');
  }

  offMyRooms(): void {
    this.socket?.off('my_rooms');
  }

  offError(): void {
    this.socket?.off('error');
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get socket instance
  getSocket(): Socket<SocketEvents> | null {
    return this.socket;
  }
}

export const socketService = new SocketService(); 