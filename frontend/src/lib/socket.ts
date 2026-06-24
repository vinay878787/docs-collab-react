import { io } from 'socket.io-client';

const isDev = import.meta.env.DEV;

export const socket = io(
  isDev ? 'http://localhost:5000' : window.location.origin,
  {
    withCredentials: true,
    autoConnect: false,

    // Production goes through Vercel rewrite
    path: '/socket.io',

    transports: isDev ? ['polling', 'websocket'] : ['polling'],
  },
);
