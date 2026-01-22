import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { User, Lock, ShieldCheck, Loader2, Save, Key, Copy, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { role, userId, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [joinCode, setJoinCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchProfile();
    if (role === 'ADMIN') {
      fetchJoinCode();
    }
  }, [userId, role]);

  const fetchProfile = async () => {
    try {
      if (!userId) {
        console.error('No userId available');
        return;
      }
      const response = await apiClient.get(`/users/${userId}`);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        password: ''
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
      toast.error('Failed to load profile data.');
    } finally {
      setFetching(false);
    }
  };

  const fetchJoinCode = async () => {
    try {
      const response = await apiClient.get('/tenants/me');
      if (response.data && response.data.joinCode) {
        setJoinCode(response.data.joinCode);
      }
    } catch (error) {
      // Silently fail - user may not have permission
      console.error('Error fetching join code:', error);
    }
  };

  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setCopied(true);
      toast.success('Join code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatePayload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      if (formData.password.trim() !== '') {
        updatePayload.password = formData.password;
      }

      await apiClient.patch(`/users/${userId}`, updatePayload);
      
      toast.success('Profile updated successfully');
      
      fetchProfile();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Update failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile and organization settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-medium text-slate-900">Profile Information</h2>
              </div>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-slate-600" />
                  <h3 className="text-base font-medium text-slate-900">Change Password</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Role Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-medium text-slate-900">Account Role</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-600">Current Role</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role}
                </span>
              </div>
              <button
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 font-medium rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Join Code Card - Only for Admins */}
          {role === 'ADMIN' && joinCode && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-slate-600" />
                  <h2 className="text-lg font-medium text-slate-900">Organization Code</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  Share this code with new team members to join your organization.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                  <code className="text-sm font-mono text-slate-900 block text-center tracking-wide">
                    {joinCode}
                  </code>
                </div>
                <button
                  onClick={copyJoinCode}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
