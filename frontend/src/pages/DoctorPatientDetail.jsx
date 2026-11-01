import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  FileEdit,
  Send,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  HeartHandshake,
  User,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import AlertBadge from '../components/AlertBadge';
import VitalTrendChart from '../components/VitalTrendChart';
import XAIExplanationCard from '../components/XAIExplanationCard';

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Status state
  const [currentStatus, setCurrentStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [pRes, vRes, predRes, nRes] = await Promise.all([
        api.getPatient(id),
        api.getPatientVitals(id),
        api.getPatientPredictions(id),
        api.getClinicalNotes(id)
      ]);
      setPatient(pRes.patient);
      setCurrentStatus(pRes.patient.monitoring_status);
      setVitalsHistory(vRes.records || []);
      setPredictions(predRes.predictions || []);
      setNotes(nRes.notes || []);
    } catch (err) {
      console.error('Failed to load patient detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await api.updatePatientVirtualWardStatus(id, { monitoring_status: newStatus });
      setCurrentStatus(newStatus);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmittingNote(true);
    setNoteSuccess(false);
    try {
      await api.addClinicalNote(id, { note_text: noteText, action_plan: actionPlan });
      setNoteText('');
      setActionPlan('');
      setNoteSuccess(true);
      // Refresh notes list
      const nRes = await api.getClinicalNotes(id);
      setNotes(nRes.notes || []);
      setTimeout(() => setNoteSuccess(false), 4000);
    } catch (err) {
      alert('Failed to add clinical note: ' + err.message);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Loading patient clinical dossier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div>
        <Link to="/doctor/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage Board</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900">{patient?.full_name}</h1>
              <AlertBadge severity={currentStatus} label={currentStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bed: <strong className="text-slate-800">{patient?.ward_bed_no}</strong> •{' '}
              DOB: {patient?.date_of_birth} • Gender: {patient?.gender} • Blood Group: {patient?.blood_group}
            </p>
          </div>

          {/* Quick Status Updater */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase">Triage Status:</span>
            <select
              value={currentStatus}
              disabled={statusUpdating}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Stable">Stable Monitoring</option>
              <option value="Active Monitoring">Active Monitoring</option>
              <option value="Requires Review">Requires Review</option>
              <option value="Critical Watch">Critical Watch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trajectory Chart */}
      <VitalTrendChart records={vitalsHistory} />

      {/* AI Multi-Disease Predictions */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Multi-Disease Risk Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((p, i) => (
            <XAIExplanationCard key={i} prediction={p} />
          ))}
        </div>
      </div>

      {/* Doctor Clinical Notes & Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Note Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileEdit className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Add Clinical Assessment & Action Plan</h3>
          </div>

          {noteSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Clinical evaluation recorded and notifications dispatched!</span>
            </div>
          )}

          <form onSubmit={handleAddNote} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Clinical Examination & Observations
              </label>
              <textarea
                required
                rows="3"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter clinical assessment of recent trajectory..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Structured Action Plan & Next Steps
              </label>
              <textarea
                rows="3"
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="1. Titrate medication... 2. Dietary review... 3. Follow-up..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={submittingNote}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
            >
              {submittingNote ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Record Clinical Note</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Notes History */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Clinical Evaluation History ({notes.length})</h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {notes.length > 0 ? (
              notes.map((n) => (
                <div key={n.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="font-semibold text-blue-700">{n.doctor_name}</span>
                    <span>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">{n.note_text}</p>
                  {n.action_plan && (
                    <div className="pt-1.5 mt-1 border-t border-slate-200/60 text-slate-600">
                      <strong className="text-slate-700 block mb-0.5">Action Plan:</strong>
                      <span className="whitespace-pre-line">{n.action_plan}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No previous clinical notes logged for this patient.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
