import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AlertBadge from '../components/AlertBadge';

export default function HealthDataEntryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.patient_details?.patient_id || user?.id;

  const defaultValues = {
    systolic_bp: 120,
    diastolic_bp: 80,
    heart_rate: 72,
    blood_glucose: 100,
    hba1c: 5.6,
    bmi: 24.5,
    serum_creatinine: 0.9,
    blood_urea: 25.0,
    egfr: 95.0,
    hemoglobin: 14.0,
    albumin: 4.2,
    total_cholesterol: 180.0,
    exercise_induced_angina: false,
    symptoms: 'None reported',
    notes: 'Routine daily home measurement'
  };

  const [formData, setFormData] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const presets = [
    {
      label: 'Optimal Baseline',
      desc: 'All parameters in target range',
      data: {
        systolic_bp: 118, diastolic_bp: 76, heart_rate: 68, blood_glucose: 92,
        hba1c: 5.2, bmi: 23.5, serum_creatinine: 0.8, blood_urea: 20.0,
        egfr: 105.0, hemoglobin: 14.5, albumin: 4.4, total_cholesterol: 172.0,
        exercise_induced_angina: false, symptoms: 'Feeling energetic and healthy'
      }
    },
    {
      label: 'Hypertensive Escalation',
      desc: 'Arterial pressure crosses 160 mmHg',
      data: {
        systolic_bp: 168, diastolic_bp: 102, heart_rate: 90, blood_glucose: 140,
        hba1c: 6.8, bmi: 28.2, serum_creatinine: 1.2, blood_urea: 32.0,
        egfr: 78.0, hemoglobin: 13.8, albumin: 4.0, total_cholesterol: 220.0,
        exercise_induced_angina: false, symptoms: 'Occipital morning headache, dizziness'
      }
    },
    {
      label: 'Severe Hyperglycemia',
      desc: 'Blood glucose spikes to 230 mg/dL',
      data: {
        systolic_bp: 144, diastolic_bp: 92, heart_rate: 86, blood_glucose: 230,
        hba1c: 8.9, bmi: 30.1, serum_creatinine: 1.1, blood_urea: 28.0,
        egfr: 82.0, hemoglobin: 13.5, albumin: 4.1, total_cholesterol: 215.0,
        exercise_induced_angina: false, symptoms: 'Intense thirst, dry mouth, blurred vision'
      }
    },
    {
      label: 'Renal Impairment (CKD)',
      desc: 'Creatinine reaches 2.9, low eGFR',
      data: {
        systolic_bp: 156, diastolic_bp: 96, heart_rate: 76, blood_glucose: 125,
        hba1c: 6.4, bmi: 26.5, serum_creatinine: 2.9, blood_urea: 68.0,
        egfr: 30.0, hemoglobin: 10.4, albumin: 3.1, total_cholesterol: 198.0,
        exercise_induced_angina: false, symptoms: 'Bilateral ankle edema, nausea, fatigue'
      }
    }
  ];

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({ ...prev, ...preset.data }));
    setResult(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.addPatientVitals(patientId, formData);
      setResult(res.adaptive_evaluation);
    } catch (err) {
      setError(err.message || 'Failed to submit health record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Log Health Telemetry</h1>
        <p className="text-xs text-slate-500 mt-1">
          Submitting measurements automatically triggers longitudinal delta evaluation and multi-disease risk recalculation.
        </p>
      </div>

      {/* 1-Click Simulation Presets */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Simulation Presets (1-Click Fill)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-3 text-left rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block">
                {p.label}
              </span>
              <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission Success & Adaptive AI Feedback Card */}
      {result && (
        <div className="bg-white rounded-2xl border-2 border-blue-500 p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Adaptive AI Evaluation Complete</h3>
                <p className="text-xs text-slate-500">Record #{result.record_id} processed by all 4 disease models</p>
              </div>
            </div>
            <AlertBadge severity={result.monitoring_status} label={`Ward Status: ${result.monitoring_status}`} />
          </div>

          {/* Deltas & Alerts */}
          {result.deltas && Object.keys(result.deltas).length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Longitudinal Delta vs Previous Log:</span>
              <div className="flex flex-wrap gap-4 text-slate-600">
                <span>Systolic BP: <strong className={result.deltas.systolic_bp > 0 ? 'text-red-600' : 'text-emerald-600'}>{result.deltas.systolic_bp > 0 ? `+${result.deltas.systolic_bp}` : result.deltas.systolic_bp} mmHg</strong></span>
                <span>Glucose: <strong className={result.deltas.blood_glucose > 0 ? 'text-red-600' : 'text-emerald-600'}>{result.deltas.blood_glucose > 0 ? `+${result.deltas.blood_glucose}` : result.deltas.blood_glucose} mg/dL</strong></span>
                <span>Creatinine: <strong className={result.deltas.serum_creatinine > 0 ? 'text-red-600' : 'text-emerald-600'}>{result.deltas.serum_creatinine > 0 ? `+${result.deltas.serum_creatinine}` : result.deltas.serum_creatinine} mg/dL</strong></span>
              </div>
            </div>
          )}

          {result.alert_details && result.alert_details.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Generated Virtual Ward Alerts ({result.alerts_generated})</span>
              </span>
              {result.alert_details.map((msg, idx) => (
                <div key={idx} className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  {msg}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        {/* Section 1: Hemodynamics & Blood Pressure */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
            1. Blood Pressure & Hemodynamics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Systolic BP (mmHg) <span className="text-slate-400 font-normal">Normal: &lt;120</span>
              </label>
              <input
                type="number"
                step="any"
                required
                name="systolic_bp"
                value={formData.systolic_bp}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diastolic BP (mmHg) <span className="text-slate-400 font-normal">Normal: &lt;80</span>
              </label>
              <input
                type="number"
                step="any"
                required
                name="diastolic_bp"
                value={formData.diastolic_bp}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Heart Rate (bpm) <span className="text-slate-400 font-normal">Normal: 60-100</span>
              </label>
              <input
                type="number"
                step="any"
                required
                name="heart_rate"
                value={formData.heart_rate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Glycemic & Metabolic */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
            2. Glycemic & Metabolic Parameters (Diabetes)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Glucose (mg/dL) <span className="text-slate-400 font-normal">Fasting: 70-99</span>
              </label>
              <input
                type="number"
                step="any"
                required
                name="blood_glucose"
                value={formData.blood_glucose}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HbA1c (%) <span className="text-slate-400 font-normal">Normal: &lt;5.7</span>
              </label>
              <input
                type="number"
                step="0.1"
                name="hba1c"
                value={formData.hba1c}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                BMI (kg/m²) <span className="text-slate-400 font-normal">Target: 18.5 - 24.9</span>
              </label>
              <input
                type="number"
                step="0.1"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Renal Panel (CKD) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
            3. Renal Profile (Chronic Kidney Disease)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Creatinine (mg/dL) <span className="text-slate-400 font-normal">0.6 - 1.2</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="serum_creatinine"
                value={formData.serum_creatinine}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Urea (mg/dL) <span className="text-slate-400 font-normal">7 - 20</span>
              </label>
              <input
                type="number"
                step="any"
                name="blood_urea"
                value={formData.blood_urea}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                eGFR (mL/min) <span className="text-slate-400 font-normal">&ge;90</span>
              </label>
              <input
                type="number"
                step="any"
                name="egfr"
                value={formData.egfr}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Albumin (g/dL) <span className="text-slate-400 font-normal">3.5 - 5.0</span>
              </label>
              <input
                type="number"
                step="0.1"
                name="albumin"
                value={formData.albumin}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Cardiovascular & Lipid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
            4. Cardiovascular & Lipid Indicators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Cholesterol (mg/dL) <span className="text-slate-400 font-normal">&lt;200</span>
              </label>
              <input
                type="number"
                step="any"
                name="total_cholesterol"
                value={formData.total_cholesterol}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="exercise_induced_angina"
                  checked={formData.exercise_induced_angina}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Exertional Chest Tightness / Angina Reported</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Symptoms & Notes */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
            5. Clinical Context & Patient Notes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reported Symptoms</label>
              <input
                type="text"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="e.g. Mild shortness of breath, headache"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telemetry Notes</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Taken 30 mins after breakfast"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Submit & Recalculate AI Risk</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
