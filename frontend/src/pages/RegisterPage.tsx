import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import toast from 'react-hot-toast'; // Toast එකතු කළා
import { Building2, User, Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiClient.post('/auth/register', formData);
      
      // 1. Backend එකෙන් එන දත්ත ටික මෙහෙම ගන්න 👇
      const { access_token, tenant, user } = response.data;
      
      setSuccess(true);
      toast.success('Organization Registered Successfully!');

      // 2. අනිවාර්යයෙන්ම parameters 4ක් යවන්න ඕනේ 🛡️
      // (token, tenantId, role, userId)
      setTimeout(() => {
        login(access_token, tenant.id, user.role, user.id);
      }, 1500);

    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Email might already exist.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex animate-in fade-in duration-700">
      
      {/* Left Side - Branding (UI එක ඔයාගේ එකමයි) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1929] relative overflow-hidden flex-col justify-center px-16 text-white text-left">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 border border-blue-500/20 rounded-full animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 border border-indigo-500/20 rounded-full" />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase">FacilityOS</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-400/30 w-fit">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Enterprise Cloud Access</span>
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight">Scale your<br />operations globally.</h1>
          <p className="text-xl text-blue-200/70 max-w-md">Join hundreds of organizations transforming their facility operations with our comprehensive platform.</p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden text-center mb-8">
            <span className="text-xl font-bold text-slate-900 uppercase tracking-tighter">FacilityOS</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create workspace</h2>
            <p className="text-slate-500 font-medium mt-1">Get started with your free organization account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 uppercase tracking-wider animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Success! Initializing Gateway...</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Organization Name */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-600 outline-none transition-all bg-slate-50/50"
                    placeholder="Acme Corporation"
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
              </div>

              {/* Admin Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input
                    type="text" required
                    className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-600 outline-none transition-all bg-slate-50/50"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input
                    type="text" required
                    className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-600 outline-none transition-all bg-slate-50/50"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="email" required
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-600 outline-none transition-all bg-slate-50/50"
                    placeholder="admin@company.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Secret Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="password" required minLength={6}
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-600 outline-none transition-all bg-slate-50/50"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-5 bg-[#0A1929] hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               success ? <CheckCircle2 className="w-5 h-5" /> : 
               <><span>INITIALIZE PLATFORM</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account? <button onClick={() => navigate('/login')} className="font-black text-blue-600 uppercase text-xs tracking-wider">Sign In</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;