import axios from 'axios';

const apiUrl = import.meta.env.VITE_DEV_BACKEND_URL;

export const api = axios.create({
  baseURL: `${apiUrl}/api/v1/auth`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- CSRF ---
let csrfToken = '';
let csrfFetch: Promise<void> | null = null;

const ensureCsrf = (): Promise<void> => {
  if (!csrfFetch) {
    csrfFetch = api
      .get<{ csrfToken: string }>('/csrf-token')
      .then(({ data }) => {
        csrfToken = data.csrfToken;
      });
  }
  return csrfFetch;
};

api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
    await ensureCsrf();
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

// --- Refresh on 401 ---
let isRefreshing = false;
const queue: { resolve: () => void; reject: (e: unknown) => void }[] = [];

const drainQueue = (err: unknown) => {
  queue
    .splice(0)
    .forEach(({ resolve, reject }) => (err ? reject(err) : resolve()));
};

api.interceptors.response.use(null, async (error) => {
  const original = error.config;

  if (error.response?.status !== 401 || original._retry) throw error;

  // Refresh itself failed → clear everything and redirect
  if (original.url?.includes('/refresh')) {
    drainQueue(error);
    window.location.href = '/login';
    throw error;
  }

  // Queue concurrent 401s while a refresh is already in flight
  if (isRefreshing) {
    return new Promise<void>((resolve, reject) =>
      queue.push({ resolve, reject }),
    ).then(() => api(original));
  }

  isRefreshing = true;
  original._retry = true;

  try {
    await api.post('/refresh');
    drainQueue(null);
    return api(original);
  } catch (e) {
    drainQueue(e);
    window.location.href = '/login';
    throw e;
  } finally {
    isRefreshing = false;
  }
});
