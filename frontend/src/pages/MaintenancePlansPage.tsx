import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Plus, Zap, Calendar, Clock, Trash2, Edit3, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Asset {
  id: string;
  name: string;
  category: string;
  status: string;
}

interface MaintenancePlan {
  id: string;
  title: string;
  description?: string;
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  nextDueDate: string;
  lastGeneratedAt?: string;
  asset: Asset;
  createdAt: string;
}

const MaintenancePlansPage = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [assets, setAssets] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'MONTHLY' as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
    nextDueDate: '',
    assetId: '',
  });

  useEffect(() => {
    fetchPlans();
    fetchAssets();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/maintenance-plans');
      setPlans(res.data);
    } catch (error) {
      toast.error('Failed to fetch maintenance plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await apiClient.get('/assets');
      setAssets(res.data);
    } catch (error) {
      console.error('Failed to fetch assets', error);
    }
  };

  const handleOpenModal = (plan?: MaintenancePlan) => {
    if (plan) {
      setEditingId(plan.id);
      setFormData({
        title: plan.title,
        description: plan.description || '',
        frequency: plan.frequency,
        nextDueDate: plan.nextDueDate.split('T')[0],
        assetId: plan.asset.id,
      });
    } else {
      setEditingId(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: '',
        description: '',
        frequency: 'MONTHLY',
        nextDueDate: tomorrow.toISOString().split('T')[0],
        assetId: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await apiClient.patch(`/maintenance-plans/${editingId}`, formData);
        toast.success('Maintenance plan updated successfully');
      } else {
        await apiClient.post('/maintenance-plans', formData);
        toast.success('Maintenance plan created successfully');
      }
      setModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete maintenance plan: "${title}"?`)) {
      try {
        await apiClient.delete(`/maintenance-plans/${id}`);
        toast.success('Maintenance plan deleted');
        fetchPlans();
      } catch (error) {
        toast.error('Failed to delete maintenance plan');
      }
    }
  };

  const handleGenerateWorkOrder = async (planId: string, planTitle: string) => {
    if (window.confirm(`Generate work order now for: "${planTitle}"?\n\nThis will create a new work order and update the next due date.`)) {
      try {
        const res = await apiClient.post(`/maintenance-plans/${planId}/generate`);
        toast.success(`Work order created: ${res.data.workOrder.title}`);
        fetchPlans(); // Refresh to show updated nextDueDate
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to generate work order');
      }
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const badges: Record<string, string> = {
      WEEKLY: 'bg-blue-100 text-blue-700 border-blue-200',
      MONTHLY: 'bg-green-100 text-green-700 border-green-200',
      QUARTERLY: 'bg-purple-100 text-purple-700 border-purple-200',
      YEARLY: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return badges[frequency] || 'bg-secondary-100 text-secondary-600 border-secondary-200';
  };

  const isOverdue = (nextDueDate: string) => {
    return new Date(nextDueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Preventive Maintenance Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule recurring maintenance for your assets</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Setup New Schedule
        </button>
      </div>

      {/* Plans Table */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Plan Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Next Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Last Generated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-secondary-400">
                      <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading maintenance plans...</span>
                    </div>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-sm text-secondary-500">No maintenance plans scheduled</p>
                    <button
                      onClick={() => handleOpenModal()}
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Create your first schedule
                    </button>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{plan.title}</span>
                        {plan.description && (
                          <span className="text-xs text-slate-500 mt-1 line-clamp-1">{plan.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary-600">
                            {plan.asset.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{plan.asset.name}</span>
                          <span className="text-xs text-slate-500">{plan.asset.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${getFrequencyBadge(plan.frequency)}`}>
                        <Clock className="w-3 h-3" />
                        {plan.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isOverdue(plan.nextDueDate) ? 'text-red-500' : 'text-primary-600'}`} />
                        <span className={`text-sm font-medium ${isOverdue(plan.nextDueDate) ? 'text-red-600' : 'text-slate-900'}`}>
                          {formatDate(plan.nextDueDate)}
                        </span>
                        {isOverdue(plan.nextDueDate) && (
                          <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {plan.lastGeneratedAt ? formatDate(plan.lastGeneratedAt) : 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateWorkOrder(plan.id, plan.title)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Generate Work Order Now"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(plan)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="Edit Plan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id, plan.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? 'Edit Maintenance Plan' : 'Setup New Schedule'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-secondary-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Plan Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., HVAC Filter Replacement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Optional maintenance details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Asset <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!!editingId}
                  >
                    <option value="">Select Asset</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                  {editingId && (
                    <p className="text-xs text-slate-500 mt-1">Asset cannot be changed after creation</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Next Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-secondary-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 font-medium rounded-md hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update Plan' : 'Create Plan'
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

export default MaintenancePlansPage;
