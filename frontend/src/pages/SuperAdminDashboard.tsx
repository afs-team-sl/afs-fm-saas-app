import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Globe, Users, Activity, Database, Building2, Server, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Tenant {
  id: string;
  name: string;
  _count?: {
    users?: number;
    assets?: number;
    workOrders?: number;
  };
  createdAt?: string;
}

interface PlatformMetrics {
  totalOrganizations: number;
  totalUsers: number;
  systemHealth: number;
  databaseLoad: number;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalOrganizations: 0,
    totalUsers: 0,
    systemHealth: 99.9,
    databaseLoad: 34.2
  });

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    try {
      const res = await apiClient.get('/tenants');
      const tenantsData = res.data;
      setTenants(tenantsData);

      // Calculate metrics
      const totalUsers = tenantsData.reduce((acc: number, curr: Tenant) => acc + (curr._count?.users || 0), 0);
      
      setMetrics({
        totalOrganizations: tenantsData.length,
        totalUsers,
        systemHealth: 99.9,
        databaseLoad: 34.2
      });
    } catch (error) {
      toast.error('Failed to fetch platform data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    return `${months} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor and manage all organizations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-primary-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-dark" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Organizations</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.totalOrganizations}</h3>
          </div>
        </div>

        <div className="bg-white border border-purple-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-700" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Global Users</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.totalUsers.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">System Health</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.systemHealth}%</h3>
          </div>
        </div>

        <div className="bg-white border border-cyan-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-cyan-700" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Database Load</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.databaseLoad}%</h3>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900">Organizations</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Assets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Created</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No organizations yet</p>
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tenant.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{tenant.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{tenant._count?.users || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{tenant._count?.assets || 0}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{getTimeAgo(tenant.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate('/super-admin')}
                        className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                      >
                        Manage
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

export default SuperAdminDashboard;
