// User interface
export interface User {
  id: string;
  name: string;
  photoURL: string;
  socketId?: string;
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
  users: User[];
  messages: Message[];
  createdAt: Date;
}

// Room summary for list display
export interface RoomSummary {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
}

// Socket events
export interface SocketEvents {
  // Client to Server
  authenticate: (user: User) => void;
  join_room: (payload: { roomId: string; user: User }) => void;
  leave_room: (roomId: string) => void;
  send_message: (payload: { text: string; roomId: string; user: User }) => void;
  get_rooms: () => void;
  get_my_rooms: () => void;
  create_room: (roomName: string) => void;

  // Server to Client
  room_joined: (data: { room: Room; messages: Message[]; users: User[] }) => void;
  user_joined: (data: { user: User; roomId: string }) => void;
  user_left: (data: { user: User; roomId: string }) => void;
  message_received: (message: Message) => void;
  rooms_list: (rooms: RoomSummary[]) => void;
  my_rooms: (rooms: Room[]) => void;
  room_created: (room: Room) => void;
  room_added: (room: RoomSummary) => void;
  error: (error: { message: string }) => void;
} 