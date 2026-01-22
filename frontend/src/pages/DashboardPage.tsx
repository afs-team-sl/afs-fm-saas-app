import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Box, Activity, CheckCircle, Users, Wrench, 
  Briefcase, Clock, Globe, Zap, TrendingUp, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { role, userId, tenantId } = useAuth();
  const [stats, setStats] = useState({
    totalAssets: 0,
    openOrders: 0,
    completedOrders: 0,
    technicians: 0,
    tenantsCount: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const SUPER_TENANT_ID = import.meta.env.VITE_SUPER_TENANT_ID;

  useEffect(() => {
    fetchDashboardData();
  }, [role, userId, tenantId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (tenantId === SUPER_TENANT_ID) {
        const [tenantsRes, usersRes, assetsRes] = await Promise.all([
          apiClient.get('/tenants'),
          apiClient.get('/users'),
          apiClient.get('/assets')
        ]);

        setStats({
          ...stats,
          tenantsCount: tenantsRes.data.length,
          technicians: usersRes.data.length,
          totalAssets: assetsRes.data.length
        });

        setChartData(tenantsRes.data.map((t: any) => ({
          name: t.name.substring(0, 10),
          value: t._count?.workOrders || 0
        })));

      } else if (role === 'TECHNICIAN') {
        const ordersRes = await apiClient.get('/work-orders');
        const myOrders = ordersRes.data;

        const pending = myOrders.filter((o: any) => o.status === 'OPEN').length;
        const active = myOrders.filter((o: any) => o.status === 'IN_PROGRESS').length;
        const done = myOrders.filter((o: any) => o.status === 'COMPLETED').length;

        setStats({ ...stats, openOrders: pending + active, completedOrders: done });
        setChartData([
          { name: 'Pending', value: pending },
          { name: 'Active', value: active },
          { name: 'Done', value: done }
        ]);

      } else {
        const [assetsRes, ordersRes, usersRes] = await Promise.all([
          apiClient.get('/assets'),
          apiClient.get('/work-orders'),
          apiClient.get('/users')
        ]);

        const open = ordersRes.data.filter((o: any) => o.status !== 'COMPLETED').length;
        const completed = ordersRes.data.filter((o: any) => o.status === 'COMPLETED').length;

        setStats({
          totalAssets: assetsRes.data.length,
          openOrders: open,
          completedOrders: completed,
          technicians: usersRes.data.length,
          tenantsCount: 0
        });

        setChartData([
          { name: 'Pending', value: ordersRes.data.filter((o: any) => o.status === 'OPEN').length },
          { name: 'Active', value: ordersRes.data.filter((o: any) => o.status === 'IN_PROGRESS').length },
          { name: 'Done', value: completed }
        ]);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd'];

  const getUIConfig = () => {
    if (tenantId === SUPER_TENANT_ID) {
      return {
        title: 'Super Admin Dashboard',
        subtitle: 'Platform overview',
        stats: [
          { label: 'Organizations', val: stats.tenantsCount, icon: Globe, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
          { label: 'Total Assets', val: stats.totalAssets, icon: Box, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
          { label: 'All Users', val: stats.technicians, icon: Users, color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
          { label: 'Uptime', val: '99.9%', icon: TrendingUp, color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
        ]
      };
    }
    if (role === 'TECHNICIAN') {
      return {
        title: 'My Tasks',
        subtitle: 'Your work overview',
        stats: [
          { label: 'Active Tasks', val: stats.openOrders, icon: Briefcase, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
          { label: 'Completed', val: stats.completedOrders, icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
          { label: 'Upcoming', val: 2, icon: Clock, color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
          { label: 'Efficiency', val: '94%', icon: Zap, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
        ]
      };
    }
    return {
      title: 'Dashboard',
      subtitle: 'Overview of your facility',
      stats: [
        { label: 'Total Assets', val: stats.totalAssets, icon: Box, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
        { label: 'Open Orders', val: stats.openOrders, icon: Wrench, color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
        { label: 'Completed', val: stats.completedOrders, icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
        { label: 'Team Members', val: stats.technicians, icon: Users, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      ]
    };
  };

  const config = getUIConfig();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{config.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{config.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {config.stats.map((stat, idx) => (
          <div key={idx} className={`bg-white border ${stat.border} rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-semibold text-slate-900">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900">Activity Overview</h3>
              <p className="text-sm text-slate-500">Work order distribution</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium opacity-90">System Status</h3>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="mb-6">
            <div className="text-5xl font-bold mb-2">
              98.2<span className="text-2xl text-blue-200">%</span>
            </div>
            <p className="text-sm text-blue-100">Overall Performance</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-100">Response Time</span>
                <span className="text-sm font-semibold">24ms</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-100">Status</span>
                <span className="text-sm font-semibold text-green-300">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
