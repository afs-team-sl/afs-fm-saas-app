import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { 
  Plus, UserPlus, Shield, UserCog, User, 
  Mail, Trash2, Edit3, X, Loader2, Search 
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'OCCUPANT';
  createdAt: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123', // Default for now, they can change it later
    role: 'TECHNICIAN'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/users', formData);
      setModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: 'password123', role: 'TECHNICIAN' });
      fetchUsers();
    } catch (error) {
      alert('Failed to register user. Email might be already in use.');
    } finally { setIsSubmitting(false); }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { color: string, icon: any }> = {
      ADMIN: { color: 'text-purple-700 bg-purple-50 border-purple-100', icon: Shield },
      MANAGER: { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: UserCog },
      TECHNICIAN: { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: User },
      OCCUPANT: { color: 'text-slate-600 bg-slate-50 border-slate-200', icon: User },
    };
    const Config = roles[role] || roles.OCCUPANT;
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 w-fit ${Config.color}`}>
        <Config.icon size={12} /> {role}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 text-sm font-medium">Control user access and system roles</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#001f3f] text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <UserPlus size={20} strokeWidth={3} /> Add Member
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
           <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search members..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#001f3f] text-sm font-medium" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Level</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-24 text-center text-slate-400 font-bold animate-pulse">Loading directory...</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black border border-slate-200 uppercase">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-semibold text-slate-500">
                       <div className="flex items-center gap-2"><Mail size={14} className="text-slate-300" /> {user.email}</div>
                    </td>
                    <td className="px-6 py-5">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001f3f]/50 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900">Add Member</h2>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Assign roles and permissions</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm"
                      value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm"
                      value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <input type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Access Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['ADMIN', 'MANAGER', 'TECHNICIAN', 'OCCUPANT'].map(r => (
                      <button key={r} type="button" 
                        onClick={() => setFormData({...formData, role: r as any})}
                        className={`py-3 text-[10px] font-black rounded-xl border transition-all ${formData.role === r ? 'bg-[#001f3f] text-white border-[#001f3f]' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#001f3f] text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-900/30 flex justify-center items-center gap-3 active:scale-[0.98] transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : 'Register Member'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;