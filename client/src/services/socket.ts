import { io, Socket } from 'socket.io-client';

// Singleton socket instance for chat and notifications
let socket: Socket | undefined;

export function getSocket(token?: string) {
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

  if (socket) {
    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
      console.log("socket connected");
      
    }
    return socket;
  }

  socket = io(url, {
    // auth: { token },
    transports: ['websocket'],
    // reconnection: true,
    withCredentials: true,
  });

  socket.on('connect', () => console.log('[Socket] Connected:', socket?.id, 'to', url));
  socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[Socket] Connect error:', err));

  return socket;
}
