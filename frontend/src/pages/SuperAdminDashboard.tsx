import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { 
  Building2, 
  Users, 
  Activity, 
  Gauge, 
  LogIn, 
  Trash2, 
  Megaphone,
  X,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Settings,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface Tenant {
  id: string;
  name: string;
  plan: 'LITE' | 'PRO' | 'ENTERPRISE';
  maxAssets: number;
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
  totalAssets: number;
  activeWorkOrders: number;
  systemHealth: number;
}

interface AnnouncementModal {
  isOpen: boolean;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

interface AuditLog {
  id: string;
  action: string;
  target: string;
  performedBy: string;
  tenantName: string;
  createdAt: string;
}

interface SystemSettings {
  isMaintenanceMode: boolean;
  maintenanceMessage: string | null;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalAssets: 0,
    activeWorkOrders: 0,
    systemHealth: 99.9
  });
  const [announcementModal, setAnnouncementModal] = useState<AnnouncementModal>({
    isOpen: false,
    message: '',
    severity: 'info'
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    isMaintenanceMode: false,
    maintenanceMessage: null
  });
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  // Mock platform activity data for chart
  const [platformActivity] = useState([
    { month: 'Jan', tenants: 5, assets: 120, workOrders: 45 },
    { month: 'Feb', tenants: 8, assets: 240, workOrders: 89 },
    { month: 'Mar', tenants: 12, assets: 380, workOrders: 156 },
    { month: 'Apr', tenants: 15, assets: 520, workOrders: 203 },
    { month: 'May', tenants: 18, assets: 680, workOrders: 267 },
    { month: 'Jun', tenants: 22, assets: 845, workOrders: 334 }
  ]);

  useEffect(() => {
    fetchPlatformData();
    fetchSystemSettings();
    fetchAuditLogs();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const res = await apiClient.get('/system/settings');
      setSystemSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch system settings', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/system/audit-logs');
      setAuditLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    }
  };

  const fetchPlatformData = async () => {
    try {
      const res = await apiClient.get('/tenants');
      const tenantsData = res.data;
      setTenants(tenantsData);

      // Calculate comprehensive metrics
      const totalUsers = tenantsData.reduce((acc: number, curr: Tenant) => acc + (curr._count?.users || 0), 0);
      const totalAssets = tenantsData.reduce((acc: number, curr: Tenant) => acc + (curr._count?.assets || 0), 0);
      const activeWorkOrders = tenantsData.reduce((acc: number, curr: Tenant) => acc + (curr._count?.workOrders || 0), 0);
      
      setMetrics({
        totalOrganizations: tenantsData.length,
        totalUsers,
        totalAssets,
        activeWorkOrders,
        systemHealth: 99.9
      });
    } catch (error) {
      toast.error('Failed to fetch platform data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (tenantId: string, tenantName: string) => {
    try {
      const res = await apiClient.get(`/tenants/${tenantId}/impersonate`);
      const { access_token, tenant_id } = res.data;

      // Update localStorage with impersonated credentials
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('tenant_id', tenant_id);

      toast.success(`Entering ${tenantName}'s workspace...`, {
        icon: '🚀',
        duration: 2000
      });

      // Navigate to main dashboard after short delay
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Refresh to apply new context
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Impersonation failed');
      console.error(error);
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (!confirm(`⚠️ CRITICAL ACTION\n\nAre you absolutely sure you want to permanently delete "${tenantName}"?\n\nThis will:\n• Delete all users\n• Delete all assets\n• Delete all work orders\n• Delete all data\n\nThis action CANNOT be undone!`)) {
      return;
    }

    try {
      await apiClient.delete(`/tenants/${tenantId}`);
      toast.success(`${tenantName} has been purged from the platform`);
      fetchPlatformData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete tenant');
      console.error(error);
    }
  };

  const handleBroadcastAnnouncement = async () => {
    if (!announcementModal.message.trim()) {
      toast.error('Please enter an announcement message');
      return;
    }

    try {
      await apiClient.post('/tenants/broadcast', {
        message: announcementModal.message,
        type: announcementModal.severity.toUpperCase()
      });

      toast.success('System-wide announcement broadcasted successfully!');
      setAnnouncementModal({ isOpen: false, message: '', severity: 'info' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to broadcast announcement');
      console.error(error);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    try {
      const newMode = !systemSettings.isMaintenanceMode;
      await apiClient.post('/system/maintenance-mode', {
        enabled: newMode,
        message: newMode ? 'System is currently under maintenance. Please try again later.' : null
      });
      
      setSystemSettings({ ...systemSettings, isMaintenanceMode: newMode });
      toast.success(
        newMode ? '🔒 Maintenance Mode Enabled' : '🔓 Maintenance Mode Disabled',
        { duration: 3000 }
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle maintenance mode');
      console.error(error);
    }
  };

  const handleUpdatePlan = async (tenantId: string, plan: string, maxAssets: number) => {
    try {
      await apiClient.patch(`/tenants/${tenantId}/plan`, { plan, maxAssets });
      toast.success('Subscription plan updated successfully!');
      fetchPlatformData();
      setEditingPlan(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update plan');
      console.error(error);
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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'LITE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PRO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ENTERPRISE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPlanMaxAssets = (plan: string) => {
    switch (plan) {
      case 'LITE': return 50;
      case 'PRO': return 200;
      case 'ENTERPRISE': return 999999;
      default: return 50;
    }
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform overview and tenant management</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Maintenance Mode Toggle */}
          <button
            onClick={handleToggleMaintenanceMode}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              systemSettings.isMaintenanceMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            title="Toggle Maintenance Mode"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">
              {systemSettings.isMaintenanceMode ? 'Maintenance ON' : 'System Live'}
            </span>
          </button>

          {/* System Announcement Button */}
          <button
            onClick={() => setAnnouncementModal({ ...announcementModal, isOpen: true })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Platform Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'audit'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Audit Trail ({auditLogs.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Global Entities */}
        <div className="bg-white border border-primary-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-dark" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Organizations</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.totalOrganizations}</h3>
          </div>
        </div>

        {/* Network Usage */}
        <div className="bg-white border border-purple-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-700" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Assets</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.totalAssets.toLocaleString()}</h3>
          </div>
        </div>

        {/* System Load */}
        <div className="bg-white border border-orange-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-700" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Active Work Orders</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.activeWorkOrders}</h3>
          </div>
        </div>

        {/* Platform Uptime */}
        <div className="bg-white border border-emerald-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Gauge className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Platform Uptime</p>
            <h3 className="text-2xl font-semibold text-slate-900">{metrics.systemHealth}%</h3>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900">Platform Activity</h3>
              <p className="text-sm text-slate-500">6-month growth trend</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformActivity}>
                <defs>
                  <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
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
                <Area type="monotone" dataKey="tenants" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTenants)" name="Tenants" />
                <Area type="monotone" dataKey="assets" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAssets)" name="Assets" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium opacity-90">System Status</h3>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="mb-6">
            <div className="text-5xl font-bold mb-2">
              {metrics.systemHealth}<span className="text-2xl text-primary-200">%</span>
            </div>
            <p className="text-sm text-primary-100">Overall Performance</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-primary-100">Total Users</span>
                <span className="text-sm font-semibold">{metrics.totalUsers.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-100">Status</span>
                <span className="text-sm font-semibold text-green-300">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Management Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900">Organization Management</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="w-4 h-4" />
              <span>{metrics.totalUsers.toLocaleString()} Total Users</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
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
                          <p className="text-xs text-slate-500 font-mono">{tenant.id.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingPlan === tenant.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={tenant.plan}
                            onChange={(e) => handleUpdatePlan(tenant.id, e.target.value, getPlanMaxAssets(e.target.value))}
                            className="text-xs border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="LITE">Lite</option>
                            <option value="PRO">Pro</option>
                            <option value="ENTERPRISE">Enterprise</option>
                          </select>
                          <button
                            onClick={() => setEditingPlan(null)}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingPlan(tenant.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs font-medium ${getPlanColor(tenant.plan)}`}
                        >
                          <CreditCard className="w-3 h-3" />
                          {tenant.plan}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Users className="w-3 h-3" />
                          <span>{tenant._count?.users || 0} users</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <BarChart3 className="w-3 h-3" />
                          <span>{tenant._count?.assets || 0}/{tenant.maxAssets} assets</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full" 
                            style={{ width: `${Math.min(((tenant._count?.assets || 0) / tenant.maxAssets) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{getTimeAgo(tenant.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleImpersonate(tenant.id, tenant.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary-dark transition-colors"
                          title="Impersonate / Enter Workspace"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Enter</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </> /* End Overview Tab */
      ) : (
        /* Audit Trail Tab */
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">Global Audit Trail</h3>
                <p className="text-sm text-slate-500">Critical platform actions across all tenants</p>
              </div>
            </div>

            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No audit logs yet</p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{log.target}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-600">By: {log.performedBy}</span>
                        {log.tenantName && (
                          <>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-600">Tenant: {log.tenantName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Announcement Modal */}
      {announcementModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">System-wide Announcement</h3>
              </div>
              <button
                onClick={() => setAnnouncementModal({ ...announcementModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Severity Level
                </label>
                <select
                  value={announcementModal.severity}
                  onChange={(e) => setAnnouncementModal({ 
                    ...announcementModal, 
                    severity: e.target.value as 'info' | 'warning' | 'critical' 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Announcement Message
                </label>
                <textarea
                  value={announcementModal.message}
                  onChange={(e) => setAnnouncementModal({ ...announcementModal, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Enter your system-wide announcement here..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAnnouncementModal({ isOpen: false, message: '', severity: 'info' })}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcastAnnouncement}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Broadcast Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
