import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Activity,
  ArrowRight,
  Filter,
  FileEdit,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import AlertBadge from '../components/AlertBadge';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [triage, setTriage] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'review' | 'stable'
  const [loading, setLoading] = useState(true);

  const doctorId = user?.doctor_details?.doctor_id || user?.id;

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        api.getDoctorPatients(doctorId, true),
        api.getTriageSummary()
      ]);
      setPatients(pRes.patients || []);
      setTriage(tRes);
    } catch (err) {
      console.error('Error loading doctor virtual ward:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [doctorId]);

  const filteredPatients = patients.filter(p => {
    if (filter === 'critical') return p.monitoring_status === 'Critical Watch';
    if (filter === 'review') return p.monitoring_status === 'Requires Review';
    if (filter === 'stable') return p.monitoring_status === 'Stable' || p.monitoring_status === 'Active Monitoring';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Ward Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Virtual Ward Triage Board
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Attending Physician: <span className="font-semibold text-slate-800">{user?.full_name}</span> • Medi Bridge Academic Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>Alerts ({triage?.active_unread_alerts || 0})</span>
          </Link>
        </div>
      </div>

      {/* Triage Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Inpatients"
          value={triage?.total_registered_patients || patients.length}
          subtitle="Monitored in Virtual Ward"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Critical Watch"
          value={triage?.critical_watch || 0}
          subtitle="Immediate Review Required"
          icon={AlertCircle}
          color="red"
        />

        <StatCard
          title="Requires Review"
          value={triage?.requires_review || 0}
          subtitle="Elevated Risk Trajectory"
          icon={AlertTriangle}
          color="amber"
        />

        <StatCard
          title="Stable Telemetry"
          value={triage?.stable_monitoring || 0}
          subtitle="Well Controlled Parameters"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Filter Tabs & Patient Roster */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter Ward Patients
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            {[
              { id: 'all', label: `All (${patients.length})` },
              { id: 'critical', label: `Critical Watch (${triage?.critical_watch || 0})` },
              { id: 'review', label: `Requires Review (${triage?.requires_review || 0})` },
              { id: 'stable', label: `Stable (${triage?.stable_monitoring || 0})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map(p => {
            const vitals = p.latest_vitals || {};
            const isCritical = p.monitoring_status === 'Critical Watch';

            return (
              <div
                key={p.patient_id}
                className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all hover:shadow-md ${
                  isCritical ? 'border-red-200 bg-red-50/20' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{p.full_name}</h3>
                      <span className="text-[11px] font-semibold text-slate-400">({p.gender}, DOB: {p.date_of_birth})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bed: <strong className="text-slate-700">{p.ward_bed_no}</strong> • Emergency: {p.emergency_contact}
                    </p>
                  </div>
                  <AlertBadge severity={p.monitoring_status} label={p.monitoring_status} />
                </div>

                {/* Medical History */}
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="font-semibold text-slate-700">Medical History: </span>
                  {p.medical_history_summary || 'No prior chronic history logged.'}
                </div>

                {/* Key Latest Vitals */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">BP</span>
                    <strong className="text-slate-800">
                      {vitals.systolic_bp ? `${Math.round(vitals.systolic_bp)}/${Math.round(vitals.diastolic_bp)}` : '--'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Glucose</span>
                    <strong className="text-slate-800">
                      {vitals.blood_glucose ? `${Math.round(vitals.blood_glucose)}` : '--'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Creatinine</span>
                    <strong className="text-slate-800">
                      {vitals.serum_creatinine || '--'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                    <strong className="text-slate-800">
                      {vitals.heart_rate ? `${Math.round(vitals.heart_rate)}` : '--'}
                    </strong>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/doctor/patient/${p.patient_id}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Clinical Review & Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
