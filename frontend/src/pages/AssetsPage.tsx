import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Plus, Search, Box, Trash2, Edit3, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNo: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

const AssetsPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit කරනවා නම් ඒ දත්ත තියාගන්න
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serialNo: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await apiClient.get('/assets');
      setAssets(response.data);
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
        // --- EDIT LOGIC ---
        await apiClient.patch(`/assets/${editingId}`, formData);
      } else {
        // --- ADD LOGIC ---
        await apiClient.post('/assets', formData);
      }
      setModalOpen(false);
      fetchAssets();
    } catch (error) {
      alert('Operation failed. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also delete related work orders.`)) {
      try {
        await apiClient.delete(`/assets/${id}`);
        fetchAssets();
      } catch (error) {
        alert('Failed to delete asset.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-100",
      MAINTENANCE: "bg-amber-50 text-amber-600 border-amber-100",
      INACTIVE: "bg-slate-50 text-slate-600 border-slate-100",
      RETIRED: "bg-red-50 text-red-600 border-red-100"
    };
    return <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${styles[status as keyof typeof styles] || styles.INACTIVE}`}>{status}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Asset Registry</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your facility infrastructure</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#001f3f] text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Add Asset
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold animate-pulse">Syncing...</td></tr>
              ) : assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100"><Box size={18}/></div>
                    <span className="font-bold text-slate-700 text-sm">{asset.name}</span>
                  </td>
                  <td className="px-6 py-5 text-xs font-semibold text-slate-500">{asset.category}</td>
                  <td className="px-6 py-5 text-xs font-mono text-slate-400">{asset.serialNo || 'N/A'}</td>
                  <td className="px-6 py-5">{getStatusBadge(asset.status)}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(asset)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                      <button onClick={() => handleDelete(asset.id, asset.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-900">{editingId ? 'Update Asset' : 'Register New Asset'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#001f3f] font-semibold text-sm"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#001f3f] font-semibold text-sm"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#001f3f] font-semibold text-sm appearance-none"
                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="RETIRED">RETIRED</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#001f3f] text-white font-black rounded-2xl shadow-xl flex justify-center items-center gap-3 transition-all active:scale-95">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : (editingId ? 'Save Changes' : 'Register Asset')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;