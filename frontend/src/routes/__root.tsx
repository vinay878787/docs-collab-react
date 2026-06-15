import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from '../context/ThemeContext';
import '../index.css';

const RootLayout = () => (
  <ThemeProvider>
    <Outlet />
  </ThemeProvider>
);

export const Route = createRootRoute({ component: RootLayout });
