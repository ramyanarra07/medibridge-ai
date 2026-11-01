import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, User, Mail, Lock, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'patient',
    // Patient specific
    date_of_birth: '1975-06-15',
    gender: 'Male',
    blood_group: 'O+',
    emergency_contact: '',
    medical_history: '',
    // Doctor specific
    specialization: 'Internal Medicine',
    license_number: 'MD-VW-9001',
    department: 'Chronic Disease Virtual Ward',
    // Caregiver specific
    relationship: 'Family Member',
    contact_method: 'In-App Alerts'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(formData);
      const role = res.user?.role;
      if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'caregiver') navigate('/caregiver/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Create Medi Bridge AI Account</h2>
          <p className="text-xs text-slate-500 mt-1">Register for continuous remote virtual ward monitoring</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['patient', 'doctor', 'caregiver'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    formData.role === r
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1-555-012-3456"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Patient Specific Fields */}
          {formData.role === 'patient' && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Patient Medical Demographics
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="Emma (Daughter) - +1-555-010-2001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chronic Conditions / History</label>
                <textarea
                  name="medical_history"
                  rows="2"
                  value={formData.medical_history}
                  onChange={handleChange}
                  placeholder="e.g. Type-2 Diabetes diagnosed 2020, Stage 1 Hypertension..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* Doctor Specific Fields */}
          {formData.role === 'doctor' && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Doctor Professional Credentials
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">License Number</label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
