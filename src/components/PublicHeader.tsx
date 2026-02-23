import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface PublicHeaderProps {
  transparent?: boolean;
}

export default function PublicHeader({ transparent = false }: PublicHeaderProps) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b ${
        transparent
          ? 'bg-white/95 backdrop-blur-md border-gray-100'
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
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
              className="hidden sm:block text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Pricing
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 md:px-7 py-2.5 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
