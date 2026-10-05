import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Store, LogIn, AlertCircle, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);

      // Route based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your network and credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: 'ADMIN' | 'OWNER' | 'USER') => {
    setError(null);
    if (role === 'ADMIN') {
      setEmail('admin@roxiler.com');
      setPassword('Admin@123');
    } else if (role === 'OWNER') {
      setEmail('rajesh.owner@store.com');
      setPassword('Owner@123');
    } else {
      setEmail('rahul.sharma@example.com');
      setPassword('User@123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            StoreRate Platform
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Single login portal for Administrators, Store Owners & Users
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-indigo-600" />
            <span>Sign in to your account</span>
          </h2>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 transition duration-150"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('ADMIN')}
                className="px-2 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl text-xs font-medium text-rose-700 flex flex-col items-center gap-1 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('OWNER')}
                className="px-2 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-xl text-xs font-medium text-amber-800 flex flex-col items-center gap-1 transition"
              >
                <Store className="w-4 h-4" />
                <span>Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('USER')}
                className="px-2 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-800 flex flex-col items-center gap-1 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>User</span>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a user account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-700 underline"
            >
              Sign up as a Normal User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
