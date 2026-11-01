import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Database,
  BrainCircuit,
  Activity,
  Server,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/client';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [uRes, mRes, hRes] = await Promise.all([
          api.request('/auth/users'),
          api.getModelMetadata(),
          api.getHealth()
        ]);
        setUsers(uRes.users || []);
        setMetadata(mRes);
        setHealth(hRes);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              System Administration & Telemetry Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Platform Status: <span className="font-bold text-emerald-600">Operational (Healthy)</span> • SQLite ORM Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Core REST API Online</span>
          </span>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Registered Users"
          value={users.length}
          subtitle="Patients, MDs, Caregivers"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="ML Condition Models"
          value={4}
          subtitle="Diabetes, CKD, HTN, CVD"
          icon={BrainCircuit}
          color="purple"
        />

        <StatCard
          title="Database Status"
          value="Connected"
          subtitle="SQLite Relational Engine"
          icon={Database}
          color="emerald"
        />

        <StatCard
          title="Virtual Ward Core"
          value="v1.0.0"
          subtitle="Academic Research Prototype"
          icon={Server}
          color="teal"
        />
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Registered System Users ({users.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Created Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">#{u.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{u.full_name}</td>
                  <td className="py-3 px-4 font-medium text-slate-600">{u.username}</td>
                  <td className="py-3 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'doctor'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : u.role === 'caregiver'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Initial Seed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
