import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_DEV_BACKEND_URL as string;

// Singleton — one connection shared across the entire app.
// autoConnect: false so we connect only when the editor page mounts
// and disconnect cleanly when it unmounts.
export const socket = io(BACKEND_URL, {
  withCredentials: true, // sends the accessToken HTTP-only cookie automatically
  autoConnect: false,
});
