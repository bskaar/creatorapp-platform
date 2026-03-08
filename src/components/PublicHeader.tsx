import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface PublicHeaderProps {
  transparent?: boolean;
  variant?: 'light' | 'dark';
}

export default function PublicHeader({ transparent = false, variant = 'light' }: PublicHeaderProps) {
  const { user, signOut } = useAuth();
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
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <Logo variant="light" className="scale-110 md:scale-125" />
          </Link>
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link
              to="/pricing"
              className={`hidden sm:block font-medium transition-colors relative group ${
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
                  className={`hidden md:flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
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
                  className={`px-5 md:px-7 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg'
                  }`}
                >
                  {isDark ? 'Start Free Trial' : 'Get Started'}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
