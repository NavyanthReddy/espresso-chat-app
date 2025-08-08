import { DatabaseService } from '../database';
import { User, Message, Room } from '../types';

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    db = new DatabaseService();
    await db.initialize();
  });

  afterEach(async () => {
    await db.close();
  });

  describe('User operations', () => {
    it('should create and retrieve a user', async () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg'
      };

      await db.createUser(user);
      const retrievedUser = await db.getUser('1');

      expect(retrievedUser).toMatchObject({
        ...user,
        socketId: null
      });
      expect(retrievedUser?.createdAt).toBeDefined();
    });

    it('should update user socket ID', async () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };

      await db.createUser(user);
      await db.updateUserSocketId('1', 'socket123');
      
      const updatedUser = await db.getUser('1');
      expect(updatedUser?.socketId).toBe('socket123');
    });
  });

  describe('Room operations', () => {
    it('should create and retrieve a room', async () => {
      const room: Room = {
        id: 'room1',
        name: 'Test Room',
        users: new Map(),
        messages: [],
        createdAt: new Date()
      };

      await db.createRoom(room);
      const retrievedRoom = await db.getRoom('room1');

      expect(retrievedRoom?.id).toBe('room1');
      expect(retrievedRoom?.name).toBe('Test Room');
    });

    it('should get all rooms with user count', async () => {
      const room1: Room = {
        id: 'room1',
        name: 'Room 1',
        users: new Map(),
        messages: [],
        createdAt: new Date()
      };

      const room2: Room = {
        id: 'room2',
        name: 'Room 2',
        users: new Map(),
        messages: [],
        createdAt: new Date()
      };

      await db.createRoom(room1);
      await db.createRoom(room2);

      const rooms = await db.getAllRooms();
      expect(rooms).toHaveLength(2);
      expect(rooms[0].name).toBe('Room 1');
      expect(rooms[1].name).toBe('Room 2');
    });
  });

  describe('Message operations', () => {
    it('should add and retrieve messages', async () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };

      const message: Message = {
        id: 'msg1',
        text: 'Hello world',
        user,
        timestamp: new Date(),
        roomId: 'room1'
      };

      await db.createUser(user);
      await db.createRoom({
        id: 'room1',
        name: 'Test Room',
        users: new Map(),
        messages: [],
        createdAt: new Date()
      });

      await db.addMessage(message);
      const messages = await db.getRoomMessages('room1');

      expect(messages).toHaveLength(1);
      expect(messages[0].text).toBe('Hello world');
      expect(messages[0].user.name).toBe('Test User');
    });
  });
}); 