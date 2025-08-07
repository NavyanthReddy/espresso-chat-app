import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupSocketIO } from './socket';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chat server is running' });
});

// Setup Socket.IO
const io = setupSocketIO(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
}); 