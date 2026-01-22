import { useState } from 'react';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">FacilityOS</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="you@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button
              type="submit" 
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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