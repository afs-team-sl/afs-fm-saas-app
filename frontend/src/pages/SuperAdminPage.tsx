import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Building2, Users, Box, Globe, Activity, Server, ChevronRight, Search, TrendingUp, Database, Shield, Send, LogIn, Loader2, Radio, Edit3, Trash2, Plus, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface GlobalNotification {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
}

const SuperAdminPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Broadcast Management State
  const [broadcasts, setBroadcasts] = useState<GlobalNotification[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    type: 'INFO',
    isActive: true,
  });

  useEffect(() => {
    fetchGlobalData();
    fetchBroadcasts();
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

  const fetchBroadcasts = async () => {
    try {
      const res = await apiClient.get('/notifications/global/all');
      setBroadcasts(res.data);
    } catch (e) {
      console.error('Failed to fetch broadcasts:', e);
    }
  };

  const handleOpenModal = (broadcast?: GlobalNotification) => {
    if (broadcast) {
      setEditingId(broadcast.id);
      setFormData({
        message: broadcast.message,
        type: broadcast.type,
        isActive: broadcast.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        message: '',
        type: 'INFO',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmitBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await apiClient.patch(`/notifications/global/${editingId}`, formData);
        toast.success('Broadcast updated successfully');
      } else {
        const response = await apiClient.post('/notifications/global', formData);
        toast.success(
          <div>
            <p className="font-semibold">Broadcast created successfully!</p>
            <p className="text-xs opacity-90">All users will receive this notification</p>
          </div>,
          { duration: 4000 }
        );
      }
      setModalOpen(false);
      fetchBroadcasts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this broadcast?')) {
      return;
    }

    try {
      await apiClient.delete(`/notifications/global/${id}`);
      toast.success('Broadcast deleted successfully');
      fetchBroadcasts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete broadcast');
    }
  };

  const toggleBroadcastStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/notifications/global/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(currentStatus ? 'Broadcast deactivated' : 'Broadcast activated');
      fetchBroadcasts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getBroadcastTypeBadge = (type: GlobalNotification['type']) => {
    const styles: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-700 border-blue-200',
      WARNING: 'bg-orange-100 text-orange-700 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-700 border-red-200',
      MAINTENANCE: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[type]}`}>
        {type}
      </span>
    );
  };

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

  const totalUsers = tenants.reduce((acc, curr: any) => acc + (curr._count?.users || 0), 0);
  const totalAssets = tenants.reduce((acc, curr: any) => acc + (curr._count?.assets || 0), 0);
  const totalOrders = tenants.reduce((acc, curr: any) => acc + (curr._count?.workOrders || 0), 0);

  // Mock data for new metrics
  const totalStorage = '47.3 GB';
  const systemHealth = 98.7;
  const activeBroadcasts = broadcasts.filter(b => b.isActive).length;

  const handleImpersonate = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Login as admin for "${tenantName}"? This will switch your session.`)) {
      return;
    }

    setImpersonatingId(tenantId);
    try {
      const res = await apiClient.get(`/tenants/${tenantId}/impersonate`);
      const { access_token, user, tenant } = res.data;
      
      // Update auth context with impersonated user
      login(access_token, tenant.id, user.role, user.id, user.firstName, user.lastName);
      
      toast.success(`Now logged in as ${user.firstName} ${user.lastName} (${tenant.name})`);
      
      // Navigate to the main dashboard
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to impersonate tenant');
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    // Confirmation dialog with warning
    const confirmed = confirm(
      `⚠️ DELETE ORGANIZATION: "${tenantName}"\n\n` +
      `This will permanently delete:\n` +
      `• All users in this organization\n` +
      `• All assets\n` +
      `• All work orders\n` +
      `• All maintenance plans\n` +
      `• All parts inventory\n` +
      `• All facilities and spaces\n\n` +
      `THIS CANNOT BE UNDONE!\n\n` +
      `Type the organization name to confirm deletion.`
    );

    if (!confirmed) {
      return;
    }

    // Second confirmation for extra safety
    const secondConfirm = prompt(
      `⚠️ FINAL CONFIRMATION\n\nType "${tenantName}" exactly to confirm deletion:`
    );

    if (secondConfirm !== tenantName) {
      toast.error('Organization name did not match. Deletion cancelled.');
      return;
    }

    const loadingToast = toast.loading(`Deleting "${tenantName}" and all related data...`);

    try {
      const response = await apiClient.delete(`/tenants/${tenantId}`);
      
      toast.success(
        <div>
          <p className="font-semibold">Organization deleted successfully</p>
          <p className="text-xs opacity-90 mt-1">
            {response.data.deletedCounts?.users || 0} users, {' '}
            {response.data.deletedCounts?.assets || 0} assets, {' '}
            {response.data.deletedCounts?.workOrders || 0} work orders removed
          </p>
        </div>,
        { duration: 5000, id: loadingToast }
      );

      // Refresh all data
      fetchGlobalData();
    } catch (err: any) {
      console.error('Delete tenant error:', err);
      toast.error(
        err.response?.data?.message || 'Failed to delete organization',
        { id: loadingToast }
      );
    }
  };

  const handleBroadcast = async () => {
    // Legacy function - now handled by modal
    console.warn('Legacy broadcast function - use modal instead');
  };

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
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
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
          <div className="px-3 py-2 bg-primary-50 border border-primary-200 rounded-md">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary-dark">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Organizations', val: tenants.length, icon: Building2, color: 'text-primary', bg: 'bg-primary-50', border: 'border-primary-200' },
          { label: 'Total Users', val: totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
          { label: 'Total Assets', val: totalAssets, icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Work Orders', val: totalOrders, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
          { label: 'Storage Used', val: totalStorage, icon: Database, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', isString: true },
          { label: 'System Health', val: `${systemHealth}%`, icon: Shield, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', isString: true },
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

      {/* Broadcast Center */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#232249] to-[#2d2d5f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Broadcast Center</h2>
                <p className="text-xs text-white/70">Manage system-wide notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#232249] font-medium rounded-md hover:bg-white/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Broadcast
            </button>
          </div>
        </div>

        {/* Active Broadcasts */}
        <div className="p-6">
          {broadcasts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Radio className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">No broadcasts yet</p>
              <p className="text-xs text-slate-500">Create your first system-wide notification</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((broadcast) => (
                <div
                  key={broadcast.id}
                  className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    broadcast.isActive ? 'bg-green-100 border border-green-200' : 'bg-slate-200 border border-slate-300'
                  }`}>
                    <Radio className={`w-5 h-5 ${broadcast.isActive ? 'text-green-600' : 'text-slate-400'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getBroadcastTypeBadge(broadcast.type)}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        broadcast.isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${broadcast.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                        {broadcast.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-slate-500 ml-auto">{getTimeAgo(broadcast.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-900 font-medium mb-1">{broadcast.message}</p>
                    {broadcast.expiresAt && (
                      <p className="text-xs text-slate-500">
                        Expires: {new Date(broadcast.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleBroadcastStatus(broadcast.id, broadcast.isActive)}
                      className={`p-2 rounded-md transition-colors ${
                        broadcast.isActive
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={broadcast.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {broadcast.isActive ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={() => handleOpenModal(broadcast)}
                      className="p-2 text-[#232249] hover:bg-[#232249]/10 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBroadcast(broadcast.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#232249] to-[#2d2d5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {editingId ? 'Edit Broadcast' : 'Create New Broadcast'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitBroadcast} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notification Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all bg-white"
                  required
                >
                  <option value="INFO">Information</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Broadcast Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message here..."
                  rows={4}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#232249] border-slate-300 rounded focus:ring-[#232249]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Activate immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#232249] text-white font-semibold rounded-lg hover:bg-[#1a1a35] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Send className="w-4 h-4" />
                      Update Broadcast
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Create Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organizations Table (kept as before with minor tweaks) */}
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
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] w-full md:w-64"
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
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
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
                        <div className="w-10 h-10 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeleteTenant(t.id, t.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                          title="Delete Organization"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                        <button
                          onClick={() => handleImpersonate(t.id, t.name)}
                          disabled={impersonatingId === t.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {impersonatingId === t.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Switching...
                            </>
                          ) : (
                            <>
                              <LogIn className="w-3.5 h-3.5" />
                              Login as Admin
                            </>
                          )}
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
    </div>
  );
};

export default SuperAdminPage;
