import { DatabaseService } from '../database';
import { User, Room } from '../types';

describe('Multiple Room Joining', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    db = new DatabaseService();
    await db.initialize();
  });

  afterEach(async () => {
    await db.close();
  });

  it('should allow user to join multiple rooms', async () => {
    const user: User = {
      id: '1',
      name: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    };

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

    // Create user and rooms
    await db.createUser(user);
    await db.createRoom(room1);
    await db.createRoom(room2);

    // Join first room
    await db.addUserToRoom('room1', '1');
    let room1Users = await db.getRoomUsers('room1');
    expect(room1Users).toHaveLength(1);
    expect(room1Users[0].id).toBe('1');

    // Join second room (should work without leaving first)
    await db.addUserToRoom('room2', '1');
    let room2Users = await db.getRoomUsers('room2');
    expect(room2Users).toHaveLength(1);
    expect(room2Users[0].id).toBe('1');

    // Verify user is still in first room
    room1Users = await db.getRoomUsers('room1');
    expect(room1Users).toHaveLength(1);
    expect(room1Users[0].id).toBe('1');

    // Leave first room
    await db.removeUserFromRoom('room1', '1');
    room1Users = await db.getRoomUsers('room1');
    expect(room1Users).toHaveLength(0);

    // Verify user is still in second room
    room2Users = await db.getRoomUsers('room2');
    expect(room2Users).toHaveLength(1);
    expect(room2Users[0].id).toBe('1');
  });

  it('should handle room operations independently', async () => {
    const user1: User = {
      id: '1',
      name: 'User 1',
      photoURL: 'https://example.com/photo1.jpg'
    };

    const user2: User = {
      id: '2',
      name: 'User 2',
      photoURL: 'https://example.com/photo2.jpg'
    };

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

    // Setup
    await db.createUser(user1);
    await db.createUser(user2);
    await db.createRoom(room1);
    await db.createRoom(room2);

    // User 1 joins both rooms
    await db.addUserToRoom('room1', '1');
    await db.addUserToRoom('room2', '1');

    // User 2 joins only room 1
    await db.addUserToRoom('room1', '2');

    // Verify room 1 has both users
    const room1Users = await db.getRoomUsers('room1');
    expect(room1Users).toHaveLength(2);
    expect(room1Users.map(u => u.id)).toContain('1');
    expect(room1Users.map(u => u.id)).toContain('2');

    // Verify room 2 has only user 1
    const room2Users = await db.getRoomUsers('room2');
    expect(room2Users).toHaveLength(1);
    expect(room2Users[0].id).toBe('1');
  });
}); 