import { Socket } from 'socket.io';

// User interface
export interface User {
  id: string;
  name: string;
  photoURL: string;
  socketId: string;
}

// Message interface
export interface Message {
  id: string;
  text: string;
  user: User;
  timestamp: Date;
  roomId: string;
}

// Room interface
export interface Room {
  id: string;
  name: string;
  users: Map<string, User>;
  messages: Message[];
  createdAt: Date;
}

// Socket with user data
export interface AuthenticatedSocket extends Socket {
  user?: User;
  currentRoom?: string;
}

// Event payloads
export interface JoinRoomPayload {
  roomId: string;
  user: User;
}

export interface SendMessagePayload {
  text: string;
  roomId: string;
  user: User;
}

// Server state
export interface ServerState {
  rooms: Map<string, Room>;
  users: Map<string, User>;
} 