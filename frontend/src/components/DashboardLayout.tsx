import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Box, ClipboardList, Settings, LogOut, Menu, X, Bell, UserCog, Package, ShieldCheck, Calendar, MapPin } from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, role, tenantId, firstName, lastName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const SUPER_TENANT_ID = String(import.meta.env.VITE_SUPER_TENANT_ID || '').trim();

  // Generate user initials from first and last name
  const getUserInitials = () => {
    const first = (firstName || 'U').charAt(0).toUpperCase();
    const last = (lastName || 'N').charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  // Get full name
  const getFullName = () => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return 'User';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Assets', path: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Work Orders', path: '/work-orders', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Maintenance Plans', path: '/maintenance', icon: Calendar, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Locations', path: '/locations', icon: MapPin, roles: ['ADMIN', 'MANAGER'] },
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-r border-slate-700/50 transform transition-transform duration-300 md:relative md:translate-x-0 h-full flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700/50 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all">
            <Package className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-xl text-white tracking-tight">AFS Nexus</span>
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider opacity-70">Facility Intelligence</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="mb-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">{getUserInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{getFullName()}</p>
                <p className="text-xs text-slate-400 font-medium">{role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all hover:border-red-500/40"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all" 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <h2 className="text-base font-bold text-slate-900">{currentPage?.name || 'Dashboard'}</h2>
              <p className="text-xs text-slate-500 font-medium">Welcome back to AFS Nexus</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
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
