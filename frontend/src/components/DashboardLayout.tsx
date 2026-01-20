import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Box, ClipboardList, Settings, 
  LogOut, Menu, X, User, Bell, ChevronRight, UserCog, ShieldCheck, ShieldAlert
} from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, role, tenantId, userId } = useAuth(); // userId එකත් ගන්නවා
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- පද්ධතියේ ප්‍රධාන (Super Admin) විස්තර ---
  const SYSTEM_TENANT_ID = '2411cbe9-483d-4f63-87ef-53aa591529a8'; 
  const SYSTEM_SUPER_USER_ID = 'ඔයාගේ_USER_ID_එක_මෙතනට_දාන්න'; // <--- අනිවාර්යයෙන්ම මේක නිවැරදි කරන්න

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Assets Registry', path: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Work Orders', path: '/work-orders', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
    { name: 'Team Management', path: '/users', icon: UserCog, roles: ['ADMIN'] },
    { name: 'Global Control', path: '/super-admin', icon: ShieldAlert, roles: ['ADMIN'] },
    { name: 'System Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  ];

  // --- 🛡️ මෙනු එක Filter කරන සුපිරි ලොජික් එක ---
  const filteredMenu = menuItems.filter(item => {
    const hasRoleAccess = item.roles.includes(role || '');
    if (!hasRoleAccess) return false;

    // 'Global Control' පෙන්වන්නේ SUPER_USER ට විතරයි 🛡️
    if (item.path === '/super-admin') {
      return tenantId === SYSTEM_TENANT_ID && userId === SYSTEM_SUPER_USER_ID;
    }

    // Super Admin ලොග් වුණාම එයාට Assets/Work Orders පේන්න ඕනේ නෑ
    if (tenantId === SYSTEM_TENANT_ID && userId === SYSTEM_SUPER_USER_ID) {
      if (['/assets', '/work-orders'].includes(item.path)) return false;
    }

    return true;
  });

  const currentPage = menuItems.find(i => i.path === location.pathname);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f8fafc] font-sans text-slate-900">
      {/* ... (Sidebar සහ Header UI කොටස් පරණ විදියටම තියෙන්න දෙන්න) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#001f3f] text-white transform transition-transform duration-300 md:relative md:translate-x-0 h-full flex flex-col shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center gap-4 border-b border-white/5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck className="text-white w-6 h-6" /></div>
          <div><span className="font-black text-xl tracking-tight block uppercase">FacilityOS</span><span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] opacity-80">Enterprise SaaS</span></div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.name} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex items-center gap-4 text-[13px] font-black uppercase tracking-wide">
                  <item.icon size={19} strokeWidth={isActive ? 3 : 2} />
                  {item.name}
                </div>
                {isActive && <ChevronRight size={16} className="opacity-50" />}
              </button>
            );
          })}
        </nav>
        <div className="p-6 border-t border-white/5 bg-black/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 font-black text-[10px] uppercase tracking-[0.2em] border border-red-500/10 transition-all">
            <LogOut size={16} /> Exit System
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0 z-40 sticky top-0 shadow-sm">
           <button className="md:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-2xl" onClick={() => setSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? <X size={28} /> : <Menu size={28} />}</button>
           <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">Gateway / {currentPage?.name || 'Home'}</div>
           <div className="flex items-center gap-4">
              <Bell size={20} className="text-slate-300" />
              <div className="h-8 w-px bg-slate-100"></div>
              <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white font-black text-sm border border-white/10 ring-4 ring-slate-50 uppercase">{role?.substring(0,2)}</div>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8fafc] relative custom-scrollbar">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;