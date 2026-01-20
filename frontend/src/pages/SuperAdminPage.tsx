import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Building2, Users, Box, ClipboardCheck, ShieldAlert, Loader2, Globe, Activity } from 'lucide-react';

const SuperAdminPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await apiClient.get('/tenants');
      setTenants(res.data);
    } catch (e) {
      toast.error("Unauthorized. Only Super Admins can access this.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
            <ShieldAlert className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Global Control</h1>
        </div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] ml-1">Multi-tenant Infrastructure Oversight</p>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Tenants</p>
              <h2 className="text-5xl font-black text-slate-900 mt-2">{tenants.length}</h2>
            </div>
            <Globe className="text-slate-100 w-16 h-16" />
         </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Metrics</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
              ) : tenants.map((t: any) => (
                <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                        <Building2 size={24}/>
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase tracking-tight">{t.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">{t.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex gap-8">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Users</span>
                           <span className="text-sm font-black text-slate-700">{t._count?.users}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Assets</span>
                           <span className="text-sm font-black text-slate-700">{t._count?.assets}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Work Orders</span>
                           <span className="text-sm font-black text-slate-700">{t._count?.workOrders}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                        <Activity size={12} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase">Healthy</span>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;