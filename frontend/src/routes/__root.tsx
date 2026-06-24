import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from '../pages/loader';
import { ThemeProvider } from '../context/ThemeContext';
import '../index.css';

const RootLayout = () => {
  const { isResolving } = useAuth();

  // Block all routes from rendering until we know whether the user is logged in.
  // This prevents protected pages from briefly showing their content or
  // redirecting to /login before the /me response arrives.
  if (isResolving) {
    return (
      <ThemeProvider>
        <FullPageLoader />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
};

export const Route = createRootRoute({ component: RootLayout });
