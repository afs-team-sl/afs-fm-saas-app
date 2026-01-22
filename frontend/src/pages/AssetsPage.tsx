import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Navigation සඳහා එක් කළා
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, Box, Trash2, Edit3, X, Loader2, Package, ChevronRight } from 'lucide-react';

interface Asset {
  id: string; name: string; category: string; serialNo: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

const AssetsPage = () => {
  const navigate = useNavigate(); // Hook එක Initialize කළා
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
        toast.success('Asset updated');
      } else {
        await apiClient.post('/assets', formData);
        toast.success('New asset created');
      }
      setModalOpen(false);
      fetchAssets();
    } catch (error) { toast.error('Operation failed'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await apiClient.delete(`/assets/${id}`);
        toast.success('Asset removed');
        fetchAssets();
      } catch (error) { toast.error('Failed to delete'); }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
      MAINTENANCE: "bg-amber-50 text-amber-700 border-amber-100",
      RETIRED: "bg-red-50 text-red-700 border-red-100"
    };
    return <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase ${styles[status] || "bg-gray-50 text-gray-500"}`}>{status}</span>;
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20 font-sans">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0A1929] to-[#1a3a5a] rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-blue-900/20">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Assets Registry</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Enterprise Infrastructure Hub</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-[#0A1929] hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
          <Plus size={18} strokeWidth={3} /> Add New Record
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input type="text" placeholder="Filter by name, category or serial..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-600 transition-all text-sm font-bold text-slate-700 shadow-sm" />
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-black uppercase tracking-[0.2em] animate-pulse">Syncing assets...</td></tr>
              ) : filteredAssets.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-400 font-bold uppercase text-xs">No records matching your search.</td></tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      {/* නම උඩ Click කළාම History පේජ් එකට යනවා 👇 */}
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/assets/${asset.id}`)}>
                         <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                           <Box size={20} />
                         </div>
                         <span className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-blue-600 uppercase tracking-tighter">{asset.category}</td>
                    <td className="px-8 py-6 text-xs font-mono text-slate-400 font-bold">{asset.serialNo || '---'}</td>
                    <td className="px-8 py-6">{getStatusBadge(asset.status)}</td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(asset)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(asset.id, asset.name)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal එක (පරණ කෝඩ් එකමයි, මම Styling විතරක් පොඩ්ඩක් මට්ටම් කළා) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 overflow-hidden p-10 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{editingId ? 'Update Record' : 'Register Asset'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400"><X size={24}/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                   <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#0A1929] font-bold text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div>
                   <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#0A1929] font-bold text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}/></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial No</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#0A1929] font-bold text-sm font-mono" value={formData.serialNo} onChange={e => setFormData({...formData, serialNo: e.target.value})}/></div>
                   </div>
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                   <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#0A1929] font-bold text-sm appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="ACTIVE">ACTIVE</option><option value="MAINTENANCE">MAINTENANCE</option><option value="INACTIVE">INACTIVE</option><option value="RETIRED">RETIRED</option>
                   </select></div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#0A1929] text-white font-black rounded-2xl shadow-xl flex justify-center items-center gap-3 active:scale-95 transition-all">
                   {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : 'SAVE ASSET DATA'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;