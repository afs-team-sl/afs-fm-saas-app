import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Box, ClipboardList, Settings, LogOut, Menu, X, Bell, UserCog, Package, ShieldCheck, Calendar, MapPin, AlertCircle, Info, AlertTriangle, CheckCircle2, CheckCheck, Globe, Users, Activity } from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

interface UserNotification {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

interface Announcement {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'DANGER';
  isActive: boolean;
  createdAt: string;
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, role, tenantId, firstName, lastName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  // Fetch user notifications on mount and every 60 seconds (real-time feel)
  useEffect(() => {
    fetchUserNotifications();
    fetchAnnouncements();
    
    // Poll every 60 seconds for new notifications and announcements
    const interval = setInterval(() => {
      fetchUserNotifications();
      fetchAnnouncements();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load dismissed announcements from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setUserNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch user notifications:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get('/tenants/active-announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  const dismissAnnouncement = (id: string) => {
    const newDismissed = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  const getAnnouncementStyle = (type: Announcement['type']) => {
    switch (type) {
      case 'DANGER':
        return { bg: 'bg-red-600', border: 'border-red-700', text: 'text-white', icon: AlertCircle };
      case 'WARNING':
        return { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white', icon: AlertTriangle };
      default:
        return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white', icon: Info };
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      await fetchUserNotifications();
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      await fetchUserNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  // Time ago helper
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get user notification icon and color
  const getUserNotificationStyle = (type: UserNotification['type']) => {
    switch (type) {
      case 'ERROR':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' };
      case 'WARNING':
        return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'SUCCESS':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { icon: Info, color: 'text-primary', bg: 'bg-primary-50' };
    }
  };

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
    // Regular User Dashboard
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'], superAdminOnly: false, hideForSuperAdmin: true },
    
    // Super Admin Dashboard
    { name: 'Platform Overview', path: '/', icon: Globe, roles: ['SUPER_ADMIN'], superAdminOnly: true, hideForSuperAdmin: false },
    
    // Regular Tenant Operations
    { name: 'Assets', path: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER'], superAdminOnly: false, hideForSuperAdmin: true },
    { name: 'Work Orders', path: '/work-orders', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'], superAdminOnly: false, hideForSuperAdmin: true },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'], superAdminOnly: false, hideForSuperAdmin: true },
    { name: 'Maintenance Plans', path: '/maintenance', icon: Calendar, roles: ['ADMIN', 'MANAGER'], superAdminOnly: false, hideForSuperAdmin: true },
    { name: 'Locations', path: '/locations', icon: MapPin, roles: ['ADMIN', 'MANAGER'], superAdminOnly: false, hideForSuperAdmin: true },
    { name: 'Users', path: '/users', icon: UserCog, roles: ['ADMIN'], superAdminOnly: false, hideForSuperAdmin: true },
    
    // Super Admin Exclusive
    { name: 'Global Users', path: '/users', icon: Users, roles: ['SUPER_ADMIN'], superAdminOnly: true, hideForSuperAdmin: false },
    { name: 'Tenant Management', path: '/super-admin', icon: ShieldCheck, roles: ['SUPER_ADMIN'], superAdminOnly: true, hideForSuperAdmin: false },
    { name: 'Security Logs', path: '/settings', icon: Activity, roles: ['SUPER_ADMIN'], superAdminOnly: true, hideForSuperAdmin: false },
    
    // Common
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'], superAdminOnly: false, hideForSuperAdmin: true },
  ];

  /**
   * STRICT ROLE-BASED SIDEBAR FILTERING
   * 
   * SUPER_ADMIN (tenantId: null):
   * - Shows: Dashboard, Global Control, Team Management, Settings
   * - Hides: Assets, Work Orders, Inventory, Maintenance, Locations, regular Users
   * 
   * ADMIN (tenantId: set):
   * - Shows: Everything except Global Control
   * 
   * MANAGER:
   * - Shows: Dashboard, Assets, Work Orders, Inventory, Maintenance, Locations, Settings
   * - Hides: Users, Global Control
   * 
   * TECHNICIAN:
   * - Shows: Dashboard, Work Orders, Inventory, Settings
   * - Hides: Everything else
   */
  const filteredMenu = menuItems.filter(item => {
    const currentRole = role || '';
    const isSuperAdmin = currentRole === 'SUPER_ADMIN';

    // If SUPER_ADMIN: Show only items marked for SUPER_ADMIN or items that are not hidden for super admin
    if (isSuperAdmin) {
      if (item.hideForSuperAdmin) {
        return false;
      }
      return item.roles.includes('SUPER_ADMIN');
    }

    // For regular users: Hide SUPER_ADMIN-only items
    if (item.superAdminOnly) {
      return false;
    }

    // Check if user's role has access to this menu item
    return item.roles.includes(currentRole);
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
            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 max-h-[500px] flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-primary to-primary-dark rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="flex-1 overflow-y-auto">
                    {userNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <Bell className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-1">No notifications</p>
                        <p className="text-xs text-slate-500 text-center">
                          You're all caught up! We'll notify you when something important happens.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {userNotifications.map((notif) => {
                          const style = getUserNotificationStyle(notif.type);
                          const Icon = style.icon;
                          return (
                            <div
                              key={notif.id}
                              onClick={() => !notif.isRead && markAsRead(notif.id)}
                              className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                                !notif.isRead ? 'bg-primary-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 ${style.bg} ${style.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {getTimeAgo(notif.createdAt)}
                                  </p>
                                </div>
                                {!notif.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {userNotifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                      <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Announcements Banner */}
        {announcements
          .filter(a => a.isActive && !dismissedAnnouncements.includes(a.id))
          .map((announcement) => {
            const style = getAnnouncementStyle(announcement.type);
            const Icon = style.icon;
            return (
              <div
                key={announcement.id}
                className={`${style.bg} ${style.border} border-b-2 px-4 md:px-6 py-3 flex items-center gap-3 shadow-sm`}
              >
                <div className={`w-8 h-8 ${style.text} bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${style.text}`}>
                    {announcement.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissAnnouncement(announcement.id)}
                  className={`${style.text} hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0`}
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

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
