import { Socket } from 'socket.io';

// User interface
export interface User {
  id: string;
  name: string;
  email?: string;
  photoURL: string;
  socketId?: string;
  createdAt?: Date;
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

export interface RoomSummary {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
}

// Socket with user data
export interface AuthenticatedSocket {
  id: string;
  user?: User;
  currentRoom?: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  to: (room: string) => {
    emit: (event: string, data: any) => void;
  };
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string) => void;
  disconnect: () => void;
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

// Socket.IO event types
export interface SocketEvents {
  authenticate: (user: User) => void;
  join_room: (payload: JoinRoomPayload) => void;
  send_message: (payload: SendMessagePayload) => void;
  get_rooms: () => void;
  create_room: (roomName: string) => void;
  room_joined: (data: { room: Room; messages: Message[]; users: User[] }) => void;
  user_joined: (data: { user: User; roomId: string }) => void;
  user_left: (data: { user: User; roomId: string }) => void;
  message_received: (message: Message) => void;
  rooms_list: (rooms: RoomSummary[]) => void;
  room_created: (room: Room) => void;
  room_added: (room: RoomSummary) => void;
  error: (error: { message: string }) => void;
} 