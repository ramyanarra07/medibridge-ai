import React from 'react';
import { ShieldAlert, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import AlertBadge from './AlertBadge';

export default function XAIExplanationCard({ prediction }) {
  if (!prediction) return null;

  const {
    condition_name,
    condition_type,
    risk_percentage,
    risk_level,
    prediction_label,
    top_contributing_factors = [],
    explainability_summary
  } = prediction;

  const getBarColor = (pct) => {
    if (pct > 40) return 'bg-red-500';
    if (pct > 20) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">{condition_name || condition_type.toUpperCase()}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{prediction_label}</p>
        </div>
        <AlertBadge severity={risk_level} label={`${risk_level} (${risk_percentage}%)`} />
      </div>

      {/* Progress Bar for Risk */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
          <span>AI Calibrated Complication Risk</span>
          <span className="font-bold text-slate-800">{risk_percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              risk_level === 'Critical' || risk_level === 'High'
                ? 'bg-gradient-to-r from-amber-500 to-red-500'
                : risk_level === 'Moderate'
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(risk_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Explainable AI Top Factors Breakdown */}
      {top_contributing_factors.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Key Feature Influences (XAI Breakdown)</span>
          </h4>
          <div className="space-y-2">
            {top_contributing_factors.slice(0, 4).map((f, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700">{f.label || f.feature}</span>
                  <span className="text-slate-500">
                    <span className="font-semibold text-slate-700">{f.value} {f.unit}</span>
                    <span className="ml-1 text-slate-400">({f.contribution_pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(f.contribution_pct)}`}
                    style={{ width: `${Math.min(f.contribution_pct * 1.5, 100)}%` }}
                  />
                </div>
                {f.status && f.status !== 'Normal range' && (
                  <p className="text-[11px] text-amber-700 mt-0.5">{f.status}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Natural Language Explanation for Patients */}
      {explainability_summary && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800 block mb-1">Clinical Insight:</span>
          {explainability_summary}
        </div>
      )}
    </div>
  );
}
