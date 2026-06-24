import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_DEV_BACKEND_URL as string;

// In production BACKEND_URL is empty → connect to the same origin (the Vercel
// domain) and let vercel.json proxy /socket.io to the HTTP backend. In dev it's
// the backend URL directly.
const sameOrigin = !BACKEND_URL;

// Singleton — one connection shared across the entire app.
// autoConnect: false so we connect only when the editor page mounts
// and disconnect cleanly when it unmounts.
export const socket = io(BACKEND_URL || window.location.origin, {
  withCredentials: true, // sends the accessToken HTTP-only cookie automatically
  autoConnect: false,
  // The Vercel proxy can't upgrade WebSockets, so over the proxy we must stay on
  // HTTP long-polling. Direct (dev) connections can use the faster WebSocket.
  transports: sameOrigin ? ['polling'] : ['polling', 'websocket'],
});
