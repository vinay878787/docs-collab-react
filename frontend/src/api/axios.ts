import axios from 'axios';

const apiUrl = import.meta.env.VITE_DEV_BACKEND_URL;

export const api = axios.create({
  baseURL: `${apiUrl}/api/v1/auth`,
  headers: { 'Content-Type': 'application/json' },
});
