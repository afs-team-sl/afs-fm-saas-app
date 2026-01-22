import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { 
  ArrowLeft, Box, History, Calendar, 
  User, CheckCircle2, Clock, AlertTriangle, FileText, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const fetchAssetDetails = async () => {
    try {
      const res = await apiClient.get(`/assets/${id}`);
      setAsset(res.data);
    } catch (e) {
      toast.error("Could not load asset history.");
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest">Accessing Secure Records...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/assets')} className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Registry
        </button>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Print Tag</button>
           <button className="px-4 py-2 bg-[#001f3f] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 active:scale-95 transition-all">Edit Specs</button>
        </div>
      </div>

      {/* Asset Overview Header */}
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
         <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center border border-blue-100 shadow-inner">
            <Box size={40} strokeWidth={2.5} />
         </div>
         <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{asset.name}</h1>
               <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">{asset.status}</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 font-bold text-[11px] uppercase tracking-wider pt-2">
               <span className="flex items-center gap-2"><Settings size={14}/> {asset.category}</span>
               <span className="flex items-center gap-2"><FileText size={14}/> SN: {asset.serialNo || 'N/A'}</span>
               <span className="flex items-center gap-2"><Calendar size={14}/> Registered: {new Date(asset.createdAt).toLocaleDateString()}</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left Side: Performance Metrics */}
         <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700"></div>
               <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Uptime Performance</p>
               <h2 className="text-5xl font-black mt-2 tracking-tighter">99.8<span className="text-blue-500 text-2xl">%</span></h2>
               <div className="mt-8 pt-6 border-t border-white/5">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Last Critical Failure</p>
                  <p className="text-sm font-bold mt-1 text-slate-300">None Recorded</p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" /> Maintenance Summary
               </h3>
               <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Total Orders</span>
                     <span className="text-sm font-black text-slate-800">{asset.workOrders?.length || 0}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Side: Maintenance Timeline (The Masterpiece) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-10">
                  <History className="text-blue-600" size={24} strokeWidth={3} />
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Maintenance Timeline</h3>
               </div>

               <div className="space-y-10 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100 hidden sm:block"></div>

                  {asset.workOrders && asset.workOrders.length > 0 ? (
                    asset.workOrders.map((wo: any, index: number) => (
                      <div key={wo.id} className="relative pl-0 sm:pl-12 group">
                        {/* Dot on Timeline */}
                        <div className="absolute left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-4 border-white ring-1 ring-blue-600 hidden sm:block z-10"></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all duration-300">
                           <div className="space-y-1">
                              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{wo.title}</h4>
                              <p className="text-xs text-slate-500 font-medium line-clamp-1">{wo.description || 'No detailed log provided.'}</p>
                              <div className="flex items-center gap-4 mt-2">
                                 <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                    <Calendar size={12}/> {new Date(wo.createdAt).toLocaleDateString()}
                                 </span>
                                 <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                    <User size={12}/> {wo.assignedTo ? `${wo.assignedTo.firstName}` : 'Unassigned'}
                                 </span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${wo.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                 {wo.status}
                              </span>
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center space-y-3">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><CheckCircle2 size={32}/></div>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No maintenance history recorded for this asset.</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default AssetDetailsPage;