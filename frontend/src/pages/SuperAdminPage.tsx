import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Building2, Users, Box, Activity, Server, Search, Send, LogIn, Trash2, X, MessageSquare, ArrowUpRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Announcement {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'DANGER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Tenant {
  id: string;
  name: string;
  _count?: {
    users?: number;
    assets?: number;
    workOrders?: number;
  };
}

const SuperAdminPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Announcement Management State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    type: 'INFO',
    isActive: true,
  });

  useEffect(() => {
    fetchGlobalData();
    fetchAnnouncements();
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

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get('/tenants/active-announcements');
      setAnnouncements(res.data);
    } catch (e) {
      console.error('Failed to fetch announcements:', e);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      message: '',
      type: 'INFO',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleSubmitBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/tenants/broadcast', formData);
      toast.success(
        <div>
          <p className="font-semibold">Global announcement created!</p>
          <p className="text-xs opacity-90">All users will see this message</p>
        </div>,
        { duration: 4000 }
      );
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await apiClient.delete(`/tenants/announcements/${id}`);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const getAnnouncementTypeBadge = (type: Announcement['type']) => {
    const styles: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-700 border-blue-200',
      WARNING: 'bg-orange-100 text-orange-700 border-orange-200',
      DANGER: 'bg-red-100 text-red-700 border-red-200',
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

  const totalUsers = tenants.reduce((acc, curr) => acc + (curr._count?.users || 0), 0);
  const totalAssets = tenants.reduce((acc, curr) => acc + (curr._count?.assets || 0), 0);
  const totalWorkOrders = tenants.reduce((acc, curr) => acc + (curr._count?.workOrders || 0), 0);

  const handleImpersonate = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Login as admin for "${tenantName}"? This will switch your session.`)) {
      return;
    }

    setImpersonatingId(tenantId);
    try {
      const res = await apiClient.get(`/tenants/${tenantId}/impersonate`);
      const { access_token, user, tenant } = res.data;
      
      login(access_token, tenant.id, user.role, user.id, user.firstName, user.lastName);
      
      toast.success(`Now logged in as ${user.firstName} ${user.lastName} (${tenant.name})`);
      
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

      fetchGlobalData();
    } catch (err: any) {
      console.error('Delete tenant error:', err);
      toast.error(
        err.response?.data?.message || 'Failed to delete organization',
        { id: loadingToast }
      );
    }
  };

  const filteredTenants = tenants.filter((t) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tenant Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {tenants.length} organizations • {totalUsers.toLocaleString()} total users
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Broadcast Message
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-primary-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-dark" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Organizations</p>
            <h3 className="text-2xl font-semibold text-slate-900">{tenants.length}</h3>
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
            <p className="text-sm text-slate-600 mb-1">Platform Users</p>
            <h3 className="text-2xl font-semibold text-slate-900">{totalUsers.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-emerald-700" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Assets Managed</p>
            <h3 className="text-2xl font-semibold text-slate-900">{totalAssets.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white border border-cyan-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-700" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Work Orders</p>
            <h3 className="text-2xl font-semibold text-slate-900">{totalWorkOrders.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900">Organizations</h3>
            <span className="text-sm text-slate-500">({filteredTenants.length})</span>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No organizations found</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {t.name}
                          </p>
                          <p className="text-xs text-slate-500 font-mono font-medium">
                            {t.id.slice(0, 8)}...
                          </p>
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
                        <span className="text-sm text-slate-900">
                            {t._count?.assets || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">
                            {t._count?.workOrders || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeleteTenant(t.id, t.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-md hover:bg-red-100 border border-red-200 transition-colors"
                          title="Delete Organization"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                        <button
                          onClick={() => handleImpersonate(t.id, t.name)}
                          disabled={impersonatingId === t.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {impersonatingId === t.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Switching...
                            </>
                          ) : (
                            <>
                              <LogIn className="w-3.5 h-3.5" />
                              Manage
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

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Broadcast Message</h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitBroadcast} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Message Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all bg-white"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    required
                  >
                    <option value="INFO">Information</option>
                    <option value="WARNING">Warning</option>
                    <option value="DANGER">Danger</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Broadcast Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message here..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all resize-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-[#232249] border-slate-300 rounded focus:ring-[#232249]"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Activate immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Broadcast
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default SuperAdminPage;

