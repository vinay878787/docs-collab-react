import axios, { type AxiosInstance } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _noRedirect?: boolean;
  }

  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _noRedirect?: boolean;
  }
}

const isDev = import.meta.env.DEV;

const AUTH_BASE_URL = isDev
  ? 'http://localhost:5000/api/v1/auth'
  : '/api/v1/auth';

const DOCS_BASE_URL = isDev
  ? 'http://localhost:5000/api/v1/docs'
  : '/api/v1/docs';

// --- CSRF singleton ---
let csrfToken = '';
let csrfFetch: Promise<void> | null = null;

const ensureCsrf = (authInstance: AxiosInstance): Promise<void> => {
  if (!csrfFetch) {
    csrfFetch = authInstance
      .get<{ csrfToken: string }>('/csrf-token')
      .then(({ data }) => {
        csrfToken = data.csrfToken;
      });
  }

  return csrfFetch;
};

// --- Refresh singleton ---
let isRefreshing = false;
let suppressRedirectOnRefreshFail = false;

const queue: {
  resolve: () => void;
  reject: (e: unknown) => void;
}[] = [];

const drainQueue = (err: unknown) =>
  queue
    .splice(0)
    .forEach(({ resolve, reject }) => (err ? reject(err) : resolve()));

function attachInterceptors(
  instance: AxiosInstance,
  authInstance: AxiosInstance,
) {
  instance.interceptors.request.use(async (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
      await ensureCsrf(authInstance);
      config.headers['x-csrf-token'] = csrfToken;
    }

    return config;
  });

  instance.interceptors.response.use(null, async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      throw error;
    }

    if (original.url?.includes('/refresh')) {
      const skip = suppressRedirectOnRefreshFail;

      suppressRedirectOnRefreshFail = false;

      drainQueue(error);

      if (!skip) {
        window.location.href = '/login';
      }

      throw error;
    }

    if (original._noRedirect) {
      suppressRedirectOnRefreshFail = true;
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) =>
        queue.push({ resolve, reject }),
      ).then(() => instance(original));
    }

    isRefreshing = true;
    original._retry = true;

    try {
      await authInstance.post('/refresh');

      suppressRedirectOnRefreshFail = false;

      drainQueue(null);

      return instance(original);
    } catch (e) {
      drainQueue(e);
      throw e;
    } finally {
      isRefreshing = false;
    }
  });
}

export const api = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const docsApi = axios.create({
  baseURL: DOCS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

attachInterceptors(api, api);
attachInterceptors(docsApi, api);
