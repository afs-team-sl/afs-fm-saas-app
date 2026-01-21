import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, ArrowRight, Building2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // --- CONFIGURATION ---
  const SUPER_TENANT_ID = import.meta.env.VITE_SUPER_TENANT_ID;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      // Sanitize IDs (remove whitespace, newlines, quotes)
      const userTenantId = String(user.tenantId || '').trim();
      const userId = String(user.id || '').trim();
      const envSuperTenantId = String(SUPER_TENANT_ID || '').trim();
      const userRole = user.role;

      // Super Admin check: Must have ADMIN role AND match Super Tenant ID
      const isSuperAdmin = userRole === 'ADMIN' && userTenantId === envSuperTenantId;

      console.group('🔐 LOGIN - Super Admin Detection');
      console.log('User Tenant ID:', userTenantId);
      console.log('User Role:', userRole);
      console.log('Super Tenant ID:', envSuperTenantId);
      console.log('Is Super Admin?', isSuperAdmin);
      console.groupEnd();

      // Update AuthContext with user data
      login(access_token, userTenantId, userRole, userId);
      
      toast.success(`Welcome back, ${user.firstName}!`);

      // Redirect based on Super Admin status
      setTimeout(() => {
        const targetRoute = isSuperAdmin ? '/super-admin' : '/';
        console.log(`🚀 Navigating to: ${targetRoute}`);
        navigate(targetRoute, { replace: true });
      }, 600);

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans animate-in fade-in duration-700">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1929] relative overflow-hidden flex-col justify-center px-16 text-white text-left text-wrap">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 border border-blue-500/20 rounded-full animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 border border-indigo-500/20 rounded-full" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase">FacilityOS</span>
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight">Enterprise Facility Intelligence.</h1>
          <p className="text-xl text-blue-200/70 max-w-md font-medium">Manage assets and scale your team with our multi-tenant SaaS platform.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 font-bold mt-2 text-xs uppercase tracking-[0.3em]">Authorized Workspace Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-wrap">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="email" required 
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-blue-600 outline-none transition-all bg-slate-50/50" 
                    placeholder="name@company.com" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-wrap">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="password" required 
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-blue-600 outline-none transition-all bg-slate-50/50" 
                    placeholder="••••••••••••" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-5 bg-[#0A1929] hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span className="tracking-[0.2em] text-xs font-black">AUTHENTICATE ACCESS</span><ArrowRight size={18} /></>}
            </button>
          </form>

          {/* --- REGISTER LINK (The Missing Piece) --- */}
          <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <p className="text-sm text-slate-500 font-medium">
              New organization? {' '}
              <button 
                onClick={() => navigate('/register')} 
                className="font-black text-blue-600 uppercase text-xs tracking-wider hover:underline"
              >
                Register Your Company
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;