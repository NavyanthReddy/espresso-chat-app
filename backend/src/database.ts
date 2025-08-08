import sqlite3 from 'sqlite3';
import { User, Message, Room } from './types';

export class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(':memory:', (err: Error | null) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(':memory:', async (err: Error | null) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          await this.initializeTables();
          resolve();
        }
      });
    });
  }

  private async initializeTables(): Promise<void> {
    // Users table
    await new Promise<void>((resolve, reject) => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          photoURL TEXT,
          socketId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Rooms table
    await new Promise<void>((resolve, reject) => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Messages table
    await new Promise<void>((resolve, reject) => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          userId TEXT NOT NULL,
          roomId TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id),
          FOREIGN KEY (roomId) REFERENCES rooms (id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Room users junction table
    await new Promise<void>((resolve, reject) => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS room_users (
          roomId TEXT NOT NULL,
          userId TEXT NOT NULL,
          joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (roomId, userId),
          FOREIGN KEY (roomId) REFERENCES rooms (id),
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // User operations
  async createUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO users (id, name, email, photoURL, socketId) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.name, user.email || null, user.photoURL, user.socketId || null],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getUser(userId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row ? row as User : null);
        }
      );
    });
  }

  async updateUserSocketId(userId: string, socketId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET socketId = ? WHERE id = ?',
        [socketId, userId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async deleteUser(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM users WHERE id = ?', [userId], (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Room operations
  async createRoom(room: Room): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO rooms (id, name) VALUES (?, ?)',
        [room.id, room.name],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getRoom(roomId: string): Promise<Room | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId],
        async (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve(null);
            return;
          }

          try {
            const users = await this.getRoomUsers(roomId);
            const messages = await this.getRoomMessages(roomId);
            
            resolve({
              id: row.id,
              name: row.name,
              users: new Map(users.map(u => [u.id, u])),
              messages,
              createdAt: new Date(row.createdAt)
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  async getAllRooms(): Promise<Array<{ id: string; name: string; userCount: number; createdAt: Date }>> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT r.id, r.name, r.createdAt, COUNT(ru.userId) as userCount 
         FROM rooms r 
         LEFT JOIN room_users ru ON r.id = ru.roomId 
         GROUP BY r.id`,
        [],
        (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            id: row.id,
            name: row.name,
            userCount: row.userCount,
            createdAt: new Date(row.createdAt)
          })));
        }
      );
    });
  }

  // Room users operations
  async addUserToRoom(roomId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO room_users (roomId, userId) VALUES (?, ?)',
        [roomId, userId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM room_users WHERE roomId = ? AND userId = ?',
        [roomId, userId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getRoomUsers(roomId: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT u.* FROM users u 
         INNER JOIN room_users ru ON u.id = ru.userId 
         WHERE ru.roomId = ?`,
        [roomId],
        (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows as User[]);
        }
      );
    });
  }

  // Message operations
  async addMessage(message: Message): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO messages (id, text, userId, roomId) VALUES (?, ?, ?, ?)',
        [message.id, message.text, message.user.id, message.roomId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT m.*, u.name, u.email, u.photoURL 
         FROM messages m 
         INNER JOIN users u ON m.userId = u.id 
         WHERE m.roomId = ? 
         ORDER BY m.timestamp ASC`,
        [roomId],
        (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            id: row.id,
            text: row.text,
            user: {
              id: row.userId,
              name: row.name,
              email: row.email,
              photoURL: row.photoURL,
              socketId: ''
            },
            timestamp: new Date(row.timestamp),
            roomId: row.roomId
          })));
        }
      );
    });
  }

  // Cleanup
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const databaseService = new DatabaseService(); 