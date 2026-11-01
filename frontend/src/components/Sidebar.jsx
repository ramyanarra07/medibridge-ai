import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  BrainCircuit,
  History,
  FileText,
  Bell,
  Users,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  let links = [];

  if (role === 'patient') {
    links = [
      { to: '/patient/dashboard', label: 'My Health Dashboard', icon: LayoutDashboard },
      { to: '/patient/entry', label: 'Log Vitals / Telemetry', icon: PlusCircle },
      { to: '/predictions', label: 'AI Disease Risk Engine', icon: BrainCircuit },
      { to: '/patient/history', label: 'Health Trends & History', icon: History },
      { to: '/patient/reports', label: 'Clinical Health Reports', icon: FileText },
      { to: '/notifications', label: 'Alerts & Messages', icon: Bell },
    ];
  } else if (role === 'doctor') {
    links = [
      { to: '/doctor/dashboard', label: 'Virtual Ward Triage', icon: LayoutDashboard },
      { to: '/predictions', label: 'AI Prediction Playground', icon: BrainCircuit },
      { to: '/notifications', label: 'Clinical Alerts', icon: Bell },
    ];
  } else if (role === 'caregiver') {
    links = [
      { to: '/caregiver/dashboard', label: 'Caregiver Portal', icon: HeartHandshake },
      { to: '/predictions', label: 'AI Risk Playground', icon: BrainCircuit },
      { to: '/notifications', label: 'Patient Alerts', icon: Bell },
    ];
  } else if (role === 'admin') {
    links = [
      { to: '/admin/dashboard', label: 'Admin Telemetry Hub', icon: ShieldCheck },
      { to: '/predictions', label: 'ML Models & Metadata', icon: BrainCircuit },
      { to: '/notifications', label: 'System Audit Alerts', icon: Bell },
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        <div className="px-3 py-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-700 block mb-0.5">Academic Prototype</span>
        Decision-support only. Not certified for direct medical diagnostics.
      </div>
    </aside>
  );
}
