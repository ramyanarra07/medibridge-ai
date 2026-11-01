import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AlertBadge from '../components/AlertBadge';

export default function PatientReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const patientId = user?.patient_details?.patient_id || user?.id;

  useEffect(() => {
    if (!patientId) return;
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.getPatientReport(patientId);
        setReport(res.report);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Generating comprehensive clinical report...</p>
      </div>
    );
  }

  const pInfo = report?.patient_info || {};
  const vSum = report?.vitals_summary || {};
  const latest = vSum.latest || {};
  const avg = vSum.averages || {};
  const preds = report?.ai_risk_assessment || [];
  const notes = report?.clinical_notes || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/patient/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-8 sm:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                MB
              </div>
              <h1 className="text-xl font-black text-slate-900">MEDI BRIDGE AI</h1>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mt-1">
              Virtual Ward Telemetry & Clinical Risk Summary Report
            </span>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Report Date: <strong className="text-slate-800">{report?.generated_at}</strong></div>
            <div>Facility: <strong className="text-slate-800">Academic Medical Center Virtual Ward</strong></div>
          </div>
        </div>

        {/* Section 1: Demographics */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Patient Demographics & Ward Allocation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
              <strong className="text-slate-800 text-sm">{pInfo.full_name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">DOB / Gender</span>
              <strong className="text-slate-800">{pInfo.date_of_birth} ({pInfo.gender})</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Virtual Bed No</span>
              <strong className="text-slate-800">{pInfo.ward_bed_no}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
              <strong className="text-slate-800">{pInfo.blood_group}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Attending MD</span>
              <strong className="text-slate-800">{pInfo.attending_physician}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Contact</span>
              <strong className="text-slate-800">{pInfo.emergency_contact}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Vitals Summary */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Physiological Parameters & Telemetry Baseline
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Latest Blood Pressure</span>
              <strong className="text-slate-800 text-base">{latest.systolic_bp} / {latest.diastolic_bp} mmHg</strong>
              {avg.avg_systolic && <span className="text-[10px] text-slate-500 block mt-0.5">7-Log Avg: {avg.avg_systolic}/{avg.avg_diastolic}</span>}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Glucose</span>
              <strong className="text-slate-800 text-base">{latest.blood_glucose} mg/dL</strong>
              {avg.avg_glucose && <span className="text-[10px] text-slate-500 block mt-0.5">7-Log Avg: {avg.avg_glucose} mg/dL</span>}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Renal Function</span>
              <strong className="text-slate-800 text-base">Cr: {latest.serum_creatinine || '--'} mg/dL</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">eGFR: {latest.egfr || '--'} mL/min</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Metabolic / Lipids</span>
              <strong className="text-slate-800 text-base">BMI: {latest.bmi}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Total Chol: {latest.total_cholesterol || '--'} mg/dL</span>
            </div>
          </div>
        </div>

        {/* Section 3: AI Risk Assessments */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Multi-Disease Risk Estimations & Explainable AI Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {preds.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 text-sm">{p.condition_type?.toUpperCase()}</strong>
                  <span className="font-bold text-slate-800">{p.risk_level} ({p.risk_percentage}%)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{p.explainability_summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Clinical Notes & Action Plan */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Attending Physician Notes & Care Instructions
          </h2>
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-slate-800">{n.doctor_name}</span>
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700">{n.note_text}</p>
                  {n.action_plan && (
                    <div className="pt-2 border-t border-slate-200">
                      <strong className="text-slate-800 block mb-1">Prescribed Action Plan:</strong>
                      <p className="whitespace-pre-line text-slate-600">{n.action_plan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
          )}
        </div>

        {/* Document Footer & Academic Disclaimer */}
        <div className="pt-8 border-t border-slate-200 text-slate-500 text-[11px] space-y-4">
          <p className="leading-relaxed text-justify bg-slate-50 p-3 rounded-lg border border-slate-200/60">
            {report?.disclaimer}
          </p>

          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Electronic Authorization</span>
              <span className="text-xs font-semibold text-slate-700">Verified by Virtual Ward Clinical Engine</span>
            </div>

            <div className="text-right">
              <div className="w-44 border-b border-slate-400 pb-1 mb-1"></div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Attending Physician Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
