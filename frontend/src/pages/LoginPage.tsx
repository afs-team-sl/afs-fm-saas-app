import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Building2 from 'lucide-react/dist/esm/icons/building-2';

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
      const userFirstName = user.firstName || '';
      const userLastName = user.lastName || '';

      // Super Admin check: Must have ADMIN role AND match Super Tenant ID
      const isSuperAdmin = userRole === 'ADMIN' && userTenantId === envSuperTenantId;

      console.group('🔐 LOGIN - Super Admin Detection');
      console.log('User Tenant ID:', userTenantId);
      console.log('User Role:', userRole);
      console.log('Super Tenant ID:', envSuperTenantId);
      console.log('Is Super Admin?', isSuperAdmin);
      console.groupEnd();

      // Update AuthContext with user data including firstName and lastName
      login(access_token, userTenantId, userRole, userId, userFirstName, userLastName);
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-5 shadow-lg shadow-blue-500/30">
            <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AFS Nexus</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Smart Facility Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button
              type="submit" 
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            New organization?{' '}
            <button 
              onClick={() => navigate('/register')} 
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;