import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Building2, Users, Box, Globe, Activity, Server, ChevronRight, Search, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    try {
      const res = await apiClient.get('/tenants');
      setTenants(res.data);
    } catch (e) {
      toast.error("Failed to fetch tenant data.");
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = tenants.reduce((acc, curr: any) => acc + (curr._count?.users || 0), 0);
  const totalAssets = tenants.reduce((acc, curr: any) => acc + (curr._count?.assets || 0), 0);
  const totalOrders = tenants.reduce((acc, curr: any) => acc + (curr._count?.workOrders || 0), 0);

  const filteredTenants = tenants.filter((t: any) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Super Admin Dashboard</h1>
          </div>
          <p className="text-sm text-slate-500">Managing {tenants.length} organizations across the platform</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">System Online</span>
            </div>
          </div>
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Organizations', val: tenants.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Total Users', val: totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
          { label: 'Total Assets', val: totalAssets, icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Work Orders', val: totalOrders, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-5 rounded-lg border ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-lg flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{s.label}</p>
              <h3 className="text-2xl font-semibold text-slate-900">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-medium text-slate-900">Organizations</h2>
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
              {filteredTenants.length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search organizations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Assets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Work Orders</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading organizations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                    No organizations found
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{t.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{t._count?.users || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{t._count?.assets || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{t._count?.workOrders || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
