import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Box, Activity, CheckCircle, TrendingUp, Users, Wrench, BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalAssets: 0,
    openOrders: 0,
    completedOrders: 0,
    technicians: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [assets, orders, users] = await Promise.all([
        apiClient.get('/assets'),
        apiClient.get('/work-orders'),
        apiClient.get('/users')
      ]);

      const open = orders.data.filter((o: any) => o.status !== 'COMPLETED').length;
      const completed = orders.data.filter((o: any) => o.status === 'COMPLETED').length;

      setStats({
        totalAssets: assets.data.length,
        openOrders: open,
        completedOrders: completed,
        technicians: users.data.filter((u: any) => u.role === 'TECHNICIAN' || u.role === 'ADMIN').length
      });

      const dist = [
        { name: 'Pending', value: orders.data.filter((o: any) => o.status === 'OPEN').length },
        { name: 'Active', value: orders.data.filter((o: any) => o.status === 'IN_PROGRESS').length },
        { name: 'Done', value: completed },
      ];
      setChartData(dist);
    } finally { setLoading(false); }
  };

  const COLORS = ['#60a5fa', '#3b82f6', '#2563eb'];

  return (
    <div className="min-h-screen pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
      
      {/* Header Section */}
      <div className="pt-6 pb-8 sm:pt-8 sm:pb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">Dashboard</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 ml-11 sm:ml-[52px]">
          Overview of your facility management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {[
          { 
            label: 'Total Assets', 
            val: stats.totalAssets, 
            icon: Box, 
            gradient: 'from-blue-900 to-blue-700'
          },
          { 
            label: 'Open Work Orders', 
            val: stats.openOrders, 
            icon: Wrench, 
            gradient: 'from-blue-800 to-blue-600'
          },
          { 
            label: 'Completed', 
            val: stats.completedOrders, 
            icon: CheckCircle, 
            gradient: 'from-blue-700 to-blue-500'
          },
          { 
            label: 'Technicians', 
            val: stats.technicians, 
            icon: Users, 
            gradient: 'from-blue-600 to-blue-400'
          },
        ].map((stat, idx) => (
          <div 
            key={idx} 
            className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-100 mb-1">{stat.label}</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Work Order Analytics</h3>
              <p className="text-sm text-gray-500">Current status distribution</p>
            </div>
            <div className="flex items-center gap-6">
              {[
                { name: 'Pending', color: 'bg-blue-400' },
                { name: 'Active', color: 'bg-blue-600' },
                { name: 'Done', color: 'bg-blue-700' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-xs font-medium text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-[280px] sm:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorBar0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorBar2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6', opacity: 0.3 }} 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                  labelStyle={{ color: '#93c5fd', fontSize: '12px', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[12, 12, 0, 0]} 
                  maxBarSize={70}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#colorBar${index})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Stats Summary Below Chart */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            {chartData.map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">{item.name}</p>
                <p className="text-2xl font-bold" style={{ color: COLORS[idx] }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-blue-300" />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">System Health</span>
            </div>
            
            <div className="mb-8">
              <h2 className="text-5xl sm:text-6xl font-bold mb-2">
                98.2<span className="text-2xl text-blue-300">%</span>
              </h2>
              <p className="text-sm text-blue-200">Overall performance</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-200">Uptime</span>
                  <span className="text-sm font-bold text-white">99.9%</span>
                </div>
                <div className="w-full bg-blue-800/50 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-300 h-1.5 rounded-full" style={{width: '99.9%'}}></div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-200">Response Time</span>
                  <span className="text-sm font-bold text-white">145ms</span>
                </div>
                <div className="w-full bg-blue-800/50 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between p-3 bg-blue-400/10 rounded-xl border border-blue-400/20">
              <span className="text-xs font-semibold text-blue-300">All Systems Operational</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;