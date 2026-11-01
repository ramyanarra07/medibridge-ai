import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Activity,
  AlertTriangle,
  CheckCircle,
  Phone,
  User,
  Clock,
  Check,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AlertBadge from '../components/AlertBadge';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const caregiverId = user?.caregiver_details?.caregiver_id || user?.id;

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, notifRes] = await Promise.all([
        api.getCaregiverPatients(caregiverId),
        api.getNotifications(false)
      ]);
      setPatients(pRes.patients || []);
      setAlerts(notifRes.notifications || []);
    } catch (err) {
      console.error('Failed to load caregiver data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caregiverId]);

  const handleAcknowledge = async (notifId) => {
    try {
      await api.acknowledgeNotification(notifId);
      loadData();
    } catch (err) {
      alert('Failed to acknowledge alert: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Loading caregiver portal...</p>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter(a => !a.is_read || !a.acknowledged_by);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Caregiver Coordination Portal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Caregiver: <span className="font-semibold text-slate-800">{user?.full_name}</span> • Active Virtual Ward Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {unacknowledgedAlerts.length} Unacknowledged Alerts
          </span>
        </div>
      </div>

      {/* Critical Alerts Section */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Important Patient Alerts Requiring Attention</span>
          </h2>
          <div className="space-y-2">
            {unacknowledgedAlerts.map(a => (
              <div
                key={a.id}
                className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{a.title}</span>
                    <AlertBadge severity={a.severity} label={a.severity} />
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{a.message}</p>
                </div>
                <button
                  onClick={() => handleAcknowledge(a.id)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitored Patients Roster */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Assigned Patients Telemetry Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map(p => {
            const vitals = p.latest_vitals || {};
            return (
              <div key={p.patient_id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.full_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bed: <strong className="text-slate-700">{p.ward_bed_no}</strong> • Contact: {p.emergency_contact}
                    </p>
                  </div>
                  <AlertBadge severity={p.monitoring_status} label={p.monitoring_status} />
                </div>

                {/* Vitals Overview */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
                    <strong className="text-slate-800 text-sm">
                      {vitals.systolic_bp ? `${Math.round(vitals.systolic_bp)}/${Math.round(vitals.diastolic_bp)}` : '--'}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Glucose</span>
                    <strong className="text-slate-800 text-sm">
                      {vitals.blood_glucose ? `${Math.round(vitals.blood_glucose)} mg/dL` : '--'}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                    <strong className="text-slate-800 text-sm">
                      {vitals.heart_rate ? `${Math.round(vitals.heart_rate)} bpm` : '--'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>MD: {p.assigned_doctor_name || 'Dr. Mitchell'}</span>
                  </span>
                  <span>{p.total_records} Total Telemetry Logs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
