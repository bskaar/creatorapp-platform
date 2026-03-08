import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface PublicHeaderProps {
  transparent?: boolean;
  variant?: 'light' | 'dark';
  showFeatures?: boolean;
}

export default function PublicHeader({ transparent = false, variant = 'light', showFeatures = false }: PublicHeaderProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = variant === 'dark';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b ${
        isDark
          ? 'bg-slate-900 border-white/10'
          : transparent
            ? 'bg-white/95 backdrop-blur-md border-gray-100'
            : 'bg-white border-gray-200'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="flex items-center">
            <Logo variant="light" className="scale-100 sm:scale-110 md:scale-125" />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition ${
              isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'
            }`}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="hidden md:flex items-center space-x-8">
            {showFeatures && (
              <a
                href="#features"
                className={`font-medium transition-colors relative group ${
                  isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Features
                {isDark && (
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                )}
              </a>
            )}
            <Link
              to="/pricing"
              className={`font-medium transition-colors relative group ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Pricing
              {isDark && (
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`font-medium transition-colors relative group ${
                    isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                  {isDark && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`font-medium transition-colors ${
                    isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-7 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg'
                  }`}
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-t px-4 py-4 space-y-3 ${
            isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-100'
          }`}
        >
          {showFeatures && (
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium ${
                isDark
                  ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Features
            </a>
          )}
          <Link
            to="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-lg font-medium ${
              isDark
                ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium ${
                  isDark
                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg font-medium ${
                  isDark
                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium ${
                  isDark
                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-semibold text-center ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                }`}
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
