import axios, { type AxiosInstance } from 'axios';

// Extend Axios request config so our custom flags are typed throughout.
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _noRedirect?: boolean;
  }
}

const apiUrl = import.meta.env.VITE_DEV_BACKEND_URL;

// --- CSRF singleton (shared across all instances) ---
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

// --- Refresh singleton (shared across all instances) ---
let isRefreshing = false;
// Set to true when the request that triggered a refresh had _noRedirect.
// Prevents the redirect-to-login when the initial /me check fails to refresh.
let suppressRedirectOnRefreshFail = false;
const queue: { resolve: () => void; reject: (e: unknown) => void }[] = [];

const drainQueue = (err: unknown) =>
  queue
    .splice(0)
    .forEach(({ resolve, reject }) => (err ? reject(err) : resolve()));

function attachInterceptors(
  instance: AxiosInstance,
  authInstance: AxiosInstance,
) {
  // Add CSRF token to all mutating requests
  instance.interceptors.request.use(async (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
      await ensureCsrf(authInstance);
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
  });

  // Auto-refresh on 401
  instance.interceptors.response.use(null, async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) throw error;

    // The /refresh request itself failed — redirect unless suppressed
    if (original.url?.includes('/refresh')) {
      const skip = suppressRedirectOnRefreshFail;
      suppressRedirectOnRefreshFail = false;
      drainQueue(error);
      if (!skip) window.location.href = '/login';
      throw error;
    }

    // If the caller marked this request as silent (e.g. the initial /me check),
    // suppress the redirect if the refresh also fails.
    if (original._noRedirect) {
      suppressRedirectOnRefreshFail = true;
    }

    // Queue concurrent 401s while a refresh is already in flight
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) =>
        queue.push({ resolve, reject }),
      ).then(() => instance(original));
    }

    isRefreshing = true;
    original._retry = true;

    try {
      await authInstance.post('/refresh');
      suppressRedirectOnRefreshFail = false; // refresh succeeded — reset
      drainQueue(null);
      return instance(original);
    } catch (e) {
      drainQueue(e);
      // The /refresh 401 response is handled by the interceptor above (which checks
      // suppressRedirectOnRefreshFail), so we just re-throw here.
      throw e;
    } finally {
      isRefreshing = false;
    }
  });
}

// Auth instance — also used for CSRF fetching and token refresh
export const api = axios.create({
  baseURL: `${apiUrl}/api/v1/auth`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Docs instance — shares CSRF token and refresh cycle with the auth instance
export const docsApi = axios.create({
  baseURL: `${apiUrl}/api/v1/docs`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

attachInterceptors(api, api);
attachInterceptors(docsApi, api);
