import CodeIcon from '@mui/icons-material/Code';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Link } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-900 dark:text-gray-100 no-underline"
        >
          <CodeIcon className="text-blue-600 dark:text-blue-400 text-xl!" />
          <span className="text-lg font-bold tracking-tight">CodeCollab</span>
          <span className="hidden sm:inline-block rounded-full bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
            🇮🇳 India
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <LightModeOutlinedIcon fontSize="small" />
            ) : (
              <DarkModeOutlinedIcon fontSize="small" />
            )}
          </button>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex h-8 items-center rounded border border-gray-300 dark:border-gray-700 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline"
              >
                Dashboard
              </Link>
              <button
                onClick={() => void logout()}
                className="flex h-8 items-center gap-1.5 rounded bg-gray-900 dark:bg-gray-100 px-3 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                title="Sign out"
              >
                <LogoutOutlinedIcon style={{ fontSize: 15 }} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex h-8 items-center rounded border border-gray-300 dark:border-gray-700 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex h-8 items-center rounded bg-blue-600 dark:bg-blue-500 px-3 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors no-underline"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
