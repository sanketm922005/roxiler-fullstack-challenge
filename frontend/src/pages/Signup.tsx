import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Store, UserPlus, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Validations
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = isPasswordLength && hasUppercase && hasSpecialChar;

  const isFormValid = isNameValid && isAddressValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!isFormValid) {
      setError('Please review the form requirements and fix all highlighted issues.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name,
        email,
        address,
        password,
      });

      const { token, user } = res.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-200 mb-2">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register as a normal user to rate and review stores
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>
                <span className={`text-xs ${isNameValid ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  {name.length}/60 chars (Min 20)
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name (20 to 60 characters)"
                required
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                  name.length > 0
                    ? isNameValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {name.length > 0 && !isNameValid && (
                <p className="text-xs text-rose-600 mt-1">
                  Name must be between 20 and 60 characters long.
                </p>
              )}
              {fieldErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                  email.length > 0
                    ? isEmailValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {email.length > 0 && !isEmailValid && (
                <p className="text-xs text-rose-600 mt-1">Please enter a valid email address.</p>
              )}
              {fieldErrors.email && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Address
                </label>
                <span className={`text-xs ${isAddressValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {address.length}/400 chars
                </span>
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                maxLength={400}
                placeholder="Enter complete residential or office address"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {fieldErrors.address && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.address[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                  password.length > 0
                    ? isPasswordValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.password[0]}</p>
              )}

              {/* Password checklist */}
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <div className={`flex items-center gap-1.5 ${isPasswordLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  {isPasswordLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>8–16 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>1 special character</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
