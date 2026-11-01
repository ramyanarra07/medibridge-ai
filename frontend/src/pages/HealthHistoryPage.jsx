import React, { useState, useEffect } from 'react';
import { History, Activity, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import VitalTrendChart from '../components/VitalTrendChart';

export default function HealthHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const patientId = user?.patient_details?.patient_id || user?.id;

  useEffect(() => {
    if (!patientId) return;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.getPatientVitals(patientId);
        setRecords(res.records || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/patient/dashboard" className="p-1 text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Longitudinal Health History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-7">
            Chronological log of telemetry parameters and trajectory progression.
          </p>
        </div>
      </div>

      {/* Trajectory Graph */}
      <VitalTrendChart records={records} />

      {/* History Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Telemetry Ingestion Log ({records.length} Records)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Heart Rate</th>
                <th className="py-3 px-4">Glucose / HbA1c</th>
                <th className="py-3 px-4">Creatinine / eGFR</th>
                <th className="py-3 px-4">BMI</th>
                <th className="py-3 px-4">Cholesterol</th>
                <th className="py-3 px-4">Reported Symptoms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length > 0 ? (
                [...records].reverse().map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-500 whitespace-nowrap">
                      {r.recorded_at ? new Date(r.recorded_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {r.systolic_bp} / {r.diastolic_bp} <span className="text-[10px] text-slate-400">mmHg</span>
                    </td>
                    <td className="py-3 px-4">
                      {r.heart_rate} <span className="text-[10px] text-slate-400">bpm</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{r.blood_glucose} mg/dL</span>
                      {r.hba1c && <span className="text-slate-400 block text-[10px]">HbA1c: {r.hba1c}%</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{r.serum_creatinine || '--'} mg/dL</span>
                      {r.egfr && <span className="text-slate-400 block text-[10px]">eGFR: {r.egfr}</span>}
                    </td>
                    <td className="py-3 px-4">
                      {r.bmi} <span className="text-[10px] text-slate-400">kg/m²</span>
                    </td>
                    <td className="py-3 px-4">
                      {r.total_cholesterol ? `${r.total_cholesterol} mg/dL` : '--'}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {r.symptoms || 'None reported'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No historical records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
