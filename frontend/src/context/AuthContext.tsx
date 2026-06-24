import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/axios';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  avatar: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isResolving: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // true while we're waiting for the /me response — used to show a global spinner
  // and prevent protected routes from redirecting prematurely.
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    // _noRedirect tells the axios interceptor: if both /me AND /refresh return 401,
    // don't redirect to /login — just let the user stay on the current page as a guest.
    api
      .get<{ user: AuthUser }>('/me', { _noRedirect: true })
      .then(({ data }) => setUser(data.user))
      .catch(() => {}) // not logged in — stay null
      .finally(() => setIsResolving(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isResolving }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
