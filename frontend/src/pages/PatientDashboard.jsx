import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Droplet,
  Zap,
  PlusCircle,
  FileText,
  AlertTriangle,
  User,
  Stethoscope,
  HeartHandshake,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import AlertBadge from '../components/AlertBadge';
import XAIExplanationCard from '../components/XAIExplanationCard';
import VitalTrendChart from '../components/VitalTrendChart';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const patientId = user?.patient_details?.patient_id || user?.id;

  useEffect(() => {
    if (!patientId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [pRes, vRes, predRes] = await Promise.all([
          api.getPatient(patientId),
          api.getPatientVitals(patientId),
          api.getPatientPredictions(patientId)
        ]);

        setPatientData(pRes.patient);
        setVitalsHistory(vRes.records || []);
        setPredictions(predRes.predictions || []);
      } catch (err) {
        console.error('Error loading patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[50vh]">
        <Activity className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Syncing Virtual Ward Telemetry...</p>
      </div>
    );
  }

  const latest = patientData?.latest_vitals || vitalsHistory[vitalsHistory.length - 1] || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Welcome back, {user?.full_name}
            </h1>
            <AlertBadge severity={patientData?.monitoring_status} label={patientData?.monitoring_status} />
          </div>
          <p className="text-xs text-slate-500">
            Assigned Bed: <span className="font-semibold text-slate-700">{patientData?.ward_bed_no}</span> •{' '}
            Blood Group: <span className="font-semibold text-slate-700">{patientData?.blood_group}</span> •{' '}
            Attending MD: <span className="font-semibold text-blue-600">{patientData?.assigned_doctor_name || 'Dr. Mitchell'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/patient/entry"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Telemetry</span>
          </Link>

          <Link
            to="/patient/reports"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Health Report</span>
          </Link>
        </div>
      </div>

      {/* Critical Status Alert if flagged */}
      {patientData?.monitoring_status === 'Critical Watch' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <h4 className="font-bold text-red-800">Critical Observation Watch Active</h4>
            <p className="text-red-700 mt-0.5">
              Your recent vital parameters have escalated the multi-disease risk score. Your attending physician and caregiver have been alerted. Please rest and follow clinical instructions.
            </p>
          </div>
        </div>
      )}

      {/* Quick Vitals Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Blood Pressure"
          value={latest.systolic_bp ? `${Math.round(latest.systolic_bp)}/${Math.round(latest.diastolic_bp)}` : '--/--'}
          unit="mmHg"
          subtitle="Target: < 120/80"
          icon={Activity}
          color={latest.systolic_bp > 140 ? 'red' : 'blue'}
        />

        <StatCard
          title="Blood Glucose"
          value={latest.blood_glucose ? Math.round(latest.blood_glucose) : '--'}
          unit="mg/dL"
          subtitle="Fasting: 70 - 99"
          icon={Droplet}
          color={latest.blood_glucose > 140 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Serum Creatinine"
          value={latest.serum_creatinine ? latest.serum_creatinine : '--'}
          unit="mg/dL"
          subtitle="Renal Normal: 0.6 - 1.2"
          icon={Zap}
          color={latest.serum_creatinine > 1.3 ? 'red' : 'purple'}
        />

        <StatCard
          title="Heart Rate"
          value={latest.heart_rate ? Math.round(latest.heart_rate) : '--'}
          unit="bpm"
          subtitle="Resting: 60 - 100"
          icon={Heart}
          color="rose"
        />
      </div>

      {/* 4 Chronic Disease AI Assessments Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Multi-Condition AI Risk Assessment</h2>
            <p className="text-xs text-slate-500">Explainable AI feature breakdowns calibrated against clinical benchmarks</p>
          </div>
          <Link to="/predictions" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>Explore Playground</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.length > 0 ? (
            predictions.map((p, i) => (
              <XAIExplanationCard key={i} prediction={p} />
            ))
          ) : (
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500 opacity-60" />
              <p className="text-xs font-semibold">Log your first telemetry reading to initialize AI disease risk models.</p>
            </div>
          )}
        </div>
      </div>

      {/* Longitudinal Vitals Trend Graph */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800">Telemetry Trajectory Over Time</h2>
          <Link to="/patient/history" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View Complete Logs ({vitalsHistory.length})
          </Link>
        </div>
        <VitalTrendChart records={vitalsHistory} />
      </div>

      {/* Care Coordination Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Virtual Ward Care Team Coordination</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">{patientData?.assigned_doctor_name || 'Dr. Sarah Mitchell, MD'}</span>
              <span className="text-slate-500 text-[11px]">Primary Attending Physician</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">{patientData?.assigned_caregiver_name || 'Emma Johnson'}</span>
              <span className="text-slate-500 text-[11px]">Primary Family Caregiver</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
