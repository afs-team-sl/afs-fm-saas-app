import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { 
  Plus, ClipboardList, Clock, User, Box, Loader2, X, 
  Trash2, Edit3, CheckCircle2, RefreshCw, Calendar 
} from 'lucide-react';

interface WorkOrder {
  id: string; title: string; description?: string; status: string; priority: string;
  assetId: string; assignedToId?: string; asset: { name: string };
  assignedTo?: { firstName: string, lastName: string }; createdAt: string;
}

const WorkOrdersPage = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<{id: string, name: string}[]>([]);
  const [users, setUsers] = useState<{id: string, firstName: string, lastName: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', assetId: '', assignedToId: '' });

  useEffect(() => { fetchOrders(); fetchSelectionData(); }, []);

  const fetchOrders = async () => {
    try { const res = await apiClient.get('/work-orders'); setOrders(res.data); } 
    finally { setLoading(false); }
  };

  const fetchSelectionData = async () => {
    try {
      const [assetRes, userRes] = await Promise.all([apiClient.get('/assets'), apiClient.get('/users')]);
      setAssets(assetRes.data); setUsers(userRes.data);
    } catch (e) { console.error("Selection error", e); }
  };

  const handleOpenModal = (order?: WorkOrder) => {
    if (order) {
      setEditingId(order.id);
      setFormData({ 
        title: order.title, 
        description: order.description || '', 
        priority: order.priority, 
        assetId: order.assetId, 
        assignedToId: order.assignedToId || '' 
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', priority: 'MEDIUM', assetId: '', assignedToId: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Logic fix for 400 Bad Request: Empty strings are converted to null
      const payload: any = { 
        title: formData.title, 
        description: formData.description, 
        priority: formData.priority 
      };
      
      payload.assignedToId = (formData.assignedToId && formData.assignedToId !== "") ? formData.assignedToId : null;
      
      // We only send assetId on Creation (POST), not on Update (PATCH)
      if (!editingId) payload.assetId = formData.assetId;

      if (editingId) await apiClient.patch(`/work-orders/${editingId}`, payload);
      else await apiClient.post('/work-orders', payload);

      setModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Operation failed'}`);
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete order: "${title}"?`)) {
      try { await apiClient.delete(`/work-orders/${id}`); fetchOrders(); } 
      catch (error) { alert('Failed to delete record.'); }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try { await apiClient.patch(`/work-orders/${orderId}`, { status: newStatus }); fetchOrders(); } 
    catch (error) { alert("Status update failed"); }
  };

  const getPriorityStyle = (p: string) => {
    const styles: Record<string, string> = {
      URGENT: 'text-red-700 bg-red-50 border-red-200',
      HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
      MEDIUM: 'text-blue-700 bg-blue-50 border-blue-200',
      LOW: 'text-slate-600 bg-slate-50 border-slate-200',
    };
    return styles[p] || styles.MEDIUM;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-mono">Work Orders</h1><p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Maintenance Control Center</p></div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-[#001f3f] text-white px-6 py-3 rounded-2xl font-bold shadow-xl active:scale-95 transition-all"><Plus size={20} strokeWidth={3} /> Issue Order</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Order Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Asset</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Technician</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-black text-sm uppercase tracking-widest animate-pulse">Syncing with cloud server...</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{order.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                       <Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 uppercase tracking-tight">
                       <Box size={10} /> {order.asset?.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 uppercase text-[9px] font-black">
                          {order.assignedTo ? `${order.assignedTo.firstName[0]}${order.assignedTo.lastName[0]}` : '??'}
                       </div>
                       {order.assignedTo ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}` : 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-[10px] font-black rounded-xl px-3 py-1.5 outline-none border transition-all shadow-sm cursor-pointer uppercase ${order.status === 'COMPLETED' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'}`}>
                      <option value="OPEN">OPEN</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(order)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14}/></button>
                      <button onClick={() => handleDelete(order.id, order.title)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001f3f]/50 backdrop-blur-md shadow-inner animate-in fade-in" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in duration-300 p-10">
            <div className="flex justify-between items-center mb-8">
              <div><h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase font-mono">{editingId ? 'Modify Record' : 'Create Assignment'}</h2><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">SaaS Multi-tenant Work Logic</p></div>
              <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                  <input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] focus:ring-4 focus:ring-blue-600/5 font-bold text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Asset</label>
                    <select required disabled={!!editingId} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm appearance-none" value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}>
                      <option value="">Choose Reference</option>{assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Member</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm appearance-none font-mono" value={formData.assignedToId} onChange={e => setFormData({...formData, assignedToId: e.target.value})}>
                      <option value="">-- UNASSIGNED --</option>{users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Strategy</label>
                  <div className="flex gap-2">{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (<button key={p} type="button" onClick={() => setFormData({...formData, priority: p})} className={`flex-1 py-3 text-[10px] font-black rounded-xl border transition-all ${formData.priority === p ? 'bg-[#001f3f] text-white border-[#001f3f] shadow-lg shadow-blue-900/20' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-400'}`}>{p}</button>))}</div>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#001f3f] text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-900/30 flex justify-center items-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : (editingId ? 'COMMIT CHANGES' : 'PUBLISH WORK ORDER')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersPage;