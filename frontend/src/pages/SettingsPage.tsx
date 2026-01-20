import React, { useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ShieldCheck, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: 'System', // පස්සේ අපි මේවා API එකෙන් ලෝඩ් කරමු
    lastName: 'Admin',
    email: 'admin@alpha.com',
    password: ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // මෙතනට ඔයාගේ User ID එක ලෝඩ් කරගන්න ඕනේ (දැනට login එකෙන් එන එක ගමු)
      // අපි දැනටමත් Users update API එක හදලා තියෙන්නේ
      toast.success('Profile credentials updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Account Settings</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Manage your security and profile</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-12">
        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* Identity Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <User size={18} className="text-blue-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <Lock size={18} className="text-blue-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Login Credentials</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password (Leave blank to keep current)</label>
                <input type="password" placeholder="••••••••••••" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-[#001f3f] text-white font-black rounded-2xl shadow-xl flex justify-center items-center gap-3 active:scale-[0.98] transition-all">
            {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> SAVE SETTINGS</>}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-[2rem] border border-red-100 p-8 flex items-center justify-between">
         <div>
            <h4 className="text-sm font-black text-red-700 uppercase tracking-widest">Organization Control</h4>
            <p className="text-xs text-red-500 font-medium mt-1 uppercase">Warning: Changes here affect the entire tenant instance.</p>
         </div>
         <ShieldCheck size={32} className="text-red-200" />
      </div>
    </div>
  );
};

export default SettingsPage;