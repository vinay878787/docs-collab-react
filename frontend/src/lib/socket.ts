import { io } from 'socket.io-client';

const isDev = import.meta.env.DEV;
const BACKEND_URL = import.meta.env.VITE_DEV_BACKEND_URL;

// Singleton — one connection shared across the entire app.
// autoConnect: false so we connect only when the editor page mounts
// and disconnect cleanly when it unmounts.
export const socket = io(isDev ? 'http://localhost:5000' : BACKEND_URL, {
  withCredentials: true, // sends the accessToken HTTP-only cookie automatically
  autoConnect: false,
  // The backend is real HTTPS now, so wss works directly. Keep polling as a
  // fallback for restrictive networks; Socket.io upgrades to WebSocket when able.
  transports: ['websocket', 'polling'],
});
