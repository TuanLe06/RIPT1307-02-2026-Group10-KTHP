import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

const getJwtSecret = (): string =>
  process.env.JWT_SECRET || process.env.SECRET_KEY || 'secret';

let io: Server;

export const initSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map((s) => s.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('No token provided'));
    }
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { id: number; email: string; role: string };
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`[Socket] Connected: user#${user.id} (${user.role})`);

    socket.join(`user:${user.id}`);
    if (user.role === 'ADMIN') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: user#${user.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
