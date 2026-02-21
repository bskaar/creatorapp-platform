import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePlatformAdmin } from '../contexts/PlatformAdminContext';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Globe,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Activity,
  FileText,
  Key,
  Brain,
} from 'lucide-react';

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminData, isSuperAdmin } = usePlatformAdmin();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/platform-admin', icon: LayoutDashboard, permission: 'view_analytics' },
    { name: 'Sites', href: '/platform-admin/sites', icon: Globe, permission: 'view_sites' },
    { name: 'Users', href: '/platform-admin/users', icon: Users, permission: 'view_users' },
    { name: 'Invitation Codes', href: '/platform-admin/invitation-codes', icon: Key, permission: 'manage_platform_settings' },
    { name: 'AI Usage', href: '/platform-admin/ai-usage', icon: Brain, permission: 'view_analytics' },
    { name: 'Activity Log', href: '/platform-admin/audit-log', icon: Activity, permission: 'view_analytics' },
    { name: 'Settings', href: '/platform-admin/settings', icon: Settings, permission: 'manage_platform_settings' },
  ];

  const filteredNavigation = navigation.filter(
    (item) => isSuperAdmin || adminData?.permissions[item.permission as keyof typeof adminData.permissions]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold text-white">Platform Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{adminData?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center h-16 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 lg:hidden hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-between flex-1 px-6">
            <h1 className="text-lg font-semibold text-gray-900">
              CreatorApp.US Platform Administration
            </h1>
            <Link
              to="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Exit to Site Dashboard
            </Link>
          </div>
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
