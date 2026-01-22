import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Box, ClipboardList, Settings, 
  LogOut, Menu, X, Bell, UserCog, Package, ShieldCheck
} from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, role, tenantId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const SUPER_TENANT_ID = String(import.meta.env.VITE_SUPER_TENANT_ID || '').trim();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Assets', path: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Work Orders', path: '/work-orders', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Users', path: '/users', icon: UserCog, roles: ['ADMIN'] },
    { name: 'Super Admin', path: '/super-admin', icon: ShieldCheck, roles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  ];

  const filteredMenu = menuItems.filter(item => {
    const hasRoleAccess = item.roles.includes(role || '');
    if (!hasRoleAccess) return false;

    const currentTenantId = String(tenantId || '').trim();
    const currentRole = role || '';
    
    const isSuperAdmin = currentRole === 'ADMIN' && currentTenantId === SUPER_TENANT_ID;

    if (item.path === '/super-admin') {
      return isSuperAdmin;
    }

    if (isSuperAdmin && ['/assets', '/work-orders'].includes(item.path)) {
      return false;
    }

    return true;
  });

  const currentPage = menuItems.find(i => i.path === location.pathname);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 md:relative md:translate-x-0 h-full flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-lg text-slate-900">FacilityOS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.name} 
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-200">
          <div className="mb-2 px-3 py-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{role?.substring(0,2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-medium text-slate-900">{currentPage?.name || 'Dashboard'}</h2>
              <p className="text-xs text-slate-500">Welcome back</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
