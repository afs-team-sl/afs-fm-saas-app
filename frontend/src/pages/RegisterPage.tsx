import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2, Key, Users } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'join'>('new');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data for creating new organization
  const [newOrgData, setNewOrgData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Form data for joining existing organization
  const [joinOrgData, setJoinOrgData] = useState({
    joinCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleNewOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiClient.post('/auth/register', newOrgData);
      setSuccess(true);
      toast.success('Organization created successfully! Logging you in...');

      // Auto-login after registration
      const { access_token, user } = response.data;
      login(access_token, user.tenantId, user.role, user.id);

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Check your details.';
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiClient.post('/auth/join', joinOrgData);
      setSuccess(true);
      toast.success(`Successfully joined ${response.data.tenant.name}!`);

      // Auto-login after joining
      const { access_token, user } = response.data;
      login(access_token, user.tenantId, user.role, user.id);

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to join organization. Check your join code.';
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">FacilityOS</h1>
          <p className="text-sm text-slate-500 mt-1">Create or join your organization</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-white rounded-lg border border-slate-200 mb-6">
          <button
            onClick={() => { setActiveTab('new'); setError(''); setSuccess(false); }}
            className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'new'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>New Organization</span>
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('join'); setError(''); setSuccess(false); }}
            className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'join'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>Join Organization</span>
            </div>
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 mb-6">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Success! Initializing workspace...</span>
          </div>
        )}

        {/* Registration Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
          {/* Form Content - New Organization */}
          {activeTab === 'new' && (
            <form onSubmit={handleNewOrganization} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" required
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Acme Corporation"
                    value={newOrgData.companyName}
                    onChange={e => setNewOrgData({...newOrgData, companyName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                    value={newOrgData.firstName}
                    onChange={e => setNewOrgData({...newOrgData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                    value={newOrgData.lastName}
                    onChange={e => setNewOrgData({...newOrgData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" required
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@company.com"
                    value={newOrgData.email}
                    onChange={e => setNewOrgData({...newOrgData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password" required minLength={6}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Minimum 6 characters"
                    value={newOrgData.password}
                    onChange={e => setNewOrgData({...newOrgData, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Success!
                  </>
                ) : (
                  <>
                    Create Organization
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form Content - Join Organization */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinOrganization} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization Join Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" required
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="clxyz123abc456def789"
                    value={joinOrgData.joinCode}
                    onChange={e => setJoinOrgData({...joinOrgData, joinCode: e.target.value})}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Ask your admin for the organization join code</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jane"
                    value={joinOrgData.firstName}
                    onChange={e => setJoinOrgData({...joinOrgData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Smith"
                    value={joinOrgData.lastName}
                    onChange={e => setJoinOrgData({...joinOrgData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" required
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@company.com"
                    value={joinOrgData.email}
                    onChange={e => setJoinOrgData({...joinOrgData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password" required minLength={6}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Minimum 6 characters"
                    value={joinOrgData.password}
                    onChange={e => setJoinOrgData({...joinOrgData, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Success!
                  </>
                ) : (
                  <>
                    Join Organization
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;