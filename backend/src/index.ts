import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookies from 'cookie-parser';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';

// routes
import groupRoutes from './routes/group-route';

const app = express();
const server = createServer(app); // Serveur HTTP
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});
const port = 3000;

app.disable('x-powered-by');

app.use(
  cors({
    origin: process.env.FRONT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookies());

// Better Auth
app.all('/api/auth/*splat', toNodeHandler(auth));

// REST routes
app.use('/api/group', groupRoutes);

// Socket.IO
app.set('io', io);
io.on('connection', (socket) => {
  console.log('🔌 A user connected');

  socket.on('group', (data) => {
    console.log('📢 Group event:', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// ⚠️ IMPORTANT → écouter avec server.listen, pas app.listen
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
