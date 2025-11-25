import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  FolderOpen,
  GitBranch,
  Mail,
  ShoppingCart,
  Video,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  FileText,
  X,
  ChevronDown,
  Package,
  Zap,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentSite, sites, switchSite } = useSite();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Content Library', href: '/content', icon: FolderOpen },
    { name: 'Funnels & Pages', href: '/funnels', icon: GitBranch },
    { name: 'Email Marketing', href: '/email', icon: Mail },
    { name: 'Automations', href: '/automations', icon: Zap },
    { name: 'Commerce', href: '/commerce', icon: ShoppingCart },
    { name: 'Orders', href: '/orders', icon: Package },
    { name: 'Webinars', href: '/webinars', icon: Video },
    { name: 'Contacts & CRM', href: '/contacts', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminMenuItems = [
    { name: 'Marketing Pages', href: '/marketing-pages', icon: FileText },
    { name: 'User Management', href: '/user-management', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-border z-30 px-4 py-3 flex items-center justify-between shadow-light">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="h-6 w-6 text-text-primary" /> : <Menu className="h-6 w-6 text-text-primary" />}
          </button>
          <Logo variant="light" className="scale-75" />
        </div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="mb-6">
              <Logo variant="light" className="scale-100" />
            </div>

            {currentSite && (
              <div className="relative">
                <button
                  onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl hover:shadow-light transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-light">
                      {currentSite.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm text-text-primary">{currentSite.name}</div>
                      <div className="text-xs text-text-secondary">{currentSite.subscription_plan_name} Plan</div>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-text-secondary" />
                </button>

                {siteDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-medium py-2 z-50">
                    {sites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => {
                          switchSite(site.id);
                          setSiteDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 text-left transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {site.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-text-primary">{site.name}</div>
                          <div className="text-xs text-text-secondary">{site.subscription_plan_name} Plan</div>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-border my-2"></div>
                    <Link
                      to="/setup"
                      onClick={() => setSiteDropdownOpen(false)}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 text-primary font-semibold text-sm transition-all"
                    >
                      + Create New Site
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-light'
                        : 'text-text-secondary hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="px-4 mb-2">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Admin</h3>
              </div>
              <div className="space-y-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-light'
                          : 'text-text-secondary hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3 px-4 py-3 mb-2 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-light">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-text-secondary hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-text-primary rounded-xl transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-72 pt-16 lg:pt-0">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
