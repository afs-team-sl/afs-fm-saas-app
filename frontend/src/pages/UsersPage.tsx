import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
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
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserData | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123', // Default for now, they can change it later
    role: 'TECHNICIAN'
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
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
      toast.success('User added successfully!');
      setModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: 'password123', role: 'TECHNICIAN' });
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to register user. Email might be already in use.';
      toast.error(errorMsg);
    } finally { setIsSubmitting(false); }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/users/${editingUser.id}`, editFormData);
      toast.success('User updated successfully!');
      setEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update user.';
      toast.error(errorMsg);
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = (user: UserData) => {
    setDeleteConfirmUser(user);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      await apiClient.delete(`/users/${deleteConfirmUser.id}`);
      toast.success('User deleted successfully!');
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user.';
      toast.error(errorMsg);
    }
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
                          <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => handleDelete(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
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

      {/* --- EDIT USER MODAL --- */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001f3f]/50 backdrop-blur-md" onClick={() => setEditModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900">Edit Member</h2>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Update user information</p>
                </div>
                <button onClick={() => setEditModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm"
                      value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm"
                      value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Access Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['ADMIN', 'MANAGER', 'TECHNICIAN', 'OCCUPANT'].map(r => (
                      <button key={r} type="button" 
                        onClick={() => setEditFormData({...editFormData, role: r as any})}
                        className={`py-3 text-[10px] font-black rounded-xl border transition-all ${editFormData.role === r ? 'bg-[#001f3f] text-white border-[#001f3f]' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#001f3f] text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-900/30 flex justify-center items-center gap-3 active:scale-[0.98] transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : 'Update Member'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmUser(null)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 text-center mb-2">Delete User?</h2>
              <p className="text-slate-500 text-sm text-center mb-6">
                Are you sure you want to delete <span className="font-bold">{deleteConfirmUser.firstName} {deleteConfirmUser.lastName}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;