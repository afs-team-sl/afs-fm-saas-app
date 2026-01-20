import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, Box, Trash2, Edit3, X, Loader2, Package } from 'lucide-react';

interface Asset {
  id: string; name: string; category: string; serialNo: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

const AssetsPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', category: '', serialNo: '', status: 'ACTIVE' });

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const response = await apiClient.get('/assets');
      setAssets(response.data);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally { setLoading(false); }
  };

  const handleOpenModal = (asset?: Asset) => {
    if (asset) {
      setEditingId(asset.id);
      setFormData({ name: asset.name, category: asset.category, serialNo: asset.serialNo || '', status: asset.status });
    } else {
      setEditingId(null);
      setFormData({ name: '', category: '', serialNo: '', status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await apiClient.patch(`/assets/${editingId}`, formData);
        toast.success('Asset updated successfully');
      } else {
        await apiClient.post('/assets', formData);
        toast.success('Asset created successfully');
      }
      setModalOpen(false);
      fetchAssets();
    } catch (error) {
      toast.error('Operation failed');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      try {
        await apiClient.delete(`/assets/${id}`);
        toast.success('Asset deleted');
        fetchAssets();
      } catch (error) { 
        toast.error('Failed to delete asset'); 
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
      MAINTENANCE: "bg-amber-100 text-amber-700 border-amber-200",
      INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
      RETIRED: "bg-red-100 text-red-700 border-red-200"
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.INACTIVE}`}>{status}</span>;
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.serialNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
      
      {/* Header Section */}
      <div className="pt-6 pb-8 sm:pt-8 sm:pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Assets</h1>
              <p className="text-sm text-gray-600">Manage your facility assets</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-gradient-to-br from-blue-900 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus size={20} /> Add Asset
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                    <p className="text-gray-500 font-medium">Loading assets...</p>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Box className="text-gray-300 mx-auto mb-2" size={48} />
                    <p className="text-gray-500 font-medium">No assets found</p>
                  </td>
                </tr>
              ) : filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <Box size={20} className="text-blue-700" />
                      </div>
                      <span className="font-semibold text-gray-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{asset.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{asset.serialNo || '—'}</td>
                  <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(asset)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(asset.id, asset.name)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 px-6 py-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Asset' : 'Add New Asset'}</h2>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                  <X size={20}/>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="assetName" className="block text-sm font-semibold text-gray-700 mb-2">Asset Name</label>
                  <input 
                    id="assetName"
                    type="text" 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter asset name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <input 
                      id="category"
                      type="text" 
                      required 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g., HVAC"
                    />
                  </div>

                  <div>
                    <label htmlFor="serialNo" className="block text-sm font-semibold text-gray-700 mb-2">Serial Number</label>
                    <input 
                      id="serialNo"
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium font-mono"
                      value={formData.serialNo} 
                      onChange={e => setFormData({...formData, serialNo: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select 
                    id="status"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-blue-900 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18}/>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Update Asset' : 'Create Asset'}</span>
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

export default AssetsPage;