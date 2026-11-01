import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, User, AlertCircle, ArrowRight, Stethoscope, HeartHandshake, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      const role = res.user?.role;
      if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'caregiver') navigate('/caregiver/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Sign in to Virtual Ward</h2>
          <p className="text-xs text-slate-500 mt-1">Select your credentials or use a 1-click demo persona</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john_doe or dr_mitchell"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Fill Demo Personas */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
            1-Click Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('dr_mitchell', 'doctor123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold truncate">Dr. Mitchell (MD)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('john_doe', 'patient123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="font-semibold truncate">John Doe (Patient)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('maria_garcia', 'patient123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-semibold truncate">Maria G. (CKD)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('caregiver_emma', 'caregiver123')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold truncate">Emma (Caregiver)</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-5 text-center text-xs text-slate-500">
          New user?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
