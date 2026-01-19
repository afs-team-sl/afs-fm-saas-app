import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Box, ClipboardList, Settings, 
  LogOut, Menu, X, User, Bell, ChevronRight, UserCog, ShieldCheck
} from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, role } = useAuth(); // AuthContext එකෙන් Role එක ගන්නවා
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // මෙතන තමයි අපි Roles පාලනය කරන්නේ 🎯
  // Admin ට ඔක්කොම පේනවා, Technician ට පේන්නේ Dashboard එකයි Work Orders විතරයි.
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Assets Registry', path: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Work Orders', path: '/work-orders', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Team Management', path: '/users', icon: UserCog, roles: ['ADMIN'] },
    { name: 'System Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  // දැනට ඉන්න පේජ් එකේ නම හොයාගන්නවා
  const currentPage = menuItems.find(i => i.path === location.pathname);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f8fafc]">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#001f3f] text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 h-full flex flex-col shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight block uppercase">FacilityOS</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] opacity-80">Enterprise v1.0</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems
            .filter(item => item.roles.includes(role || 'OCCUPANT')) // Role එක අනුව මෙනු එක Filter කරනවා 🛡️
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wide">
                    <item.icon size={20} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight size={16} className="opacity-50" />}
                </button>
              );
            })}
        </nav>

        {/* Footer / Logout Section */}
        <div className="p-6 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center font-black text-xs">AD</div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate uppercase tracking-tighter">System Admin</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase truncate tracking-widest">{role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-widest border border-red-500/10 hover:border-red-500/30"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Modern Glassmorphism Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0 z-40 sticky top-0 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              className="md:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors" 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Breadcrumb Info */}
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Portal</span>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter mt-0.5">
                {currentPage?.name || 'Overview'}
              </h2>
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all relative">
                <Bell size={22} />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                <Settings size={22} />
              </button>
            </div>
            
            <div className="h-10 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-4 pl-2">
              <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white font-black text-sm shadow-xl shadow-slate-900/20 border border-white/10 ring-4 ring-slate-50">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;