import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-nav dark:bg-gray-800/80 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow duration-200">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight dark:text-white">TaskFlow</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user && (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-3.5 py-1.5 dark:bg-gray-700">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white uppercase">{user.email[0]}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium max-w-[180px] truncate dark:text-gray-300">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn-secondary !py-2 !px-3.5 text-sm"
                >
                  <svg className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
