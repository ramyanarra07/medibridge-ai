import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AlertBadge({ severity = 'info', label }) {
  const norm = (severity || 'info').toLowerCase();

  let styles = 'bg-blue-50 text-blue-700 border-blue-200';
  let Icon = Info;
  let text = label || 'Info';

  if (norm === 'critical' || norm === 'critical watch' || norm === 'high') {
    styles = 'bg-red-50 text-red-700 border-red-200';
    Icon = AlertCircle;
    text = label || 'Critical';
  } else if (norm === 'warning' || norm === 'requires review' || norm === 'moderate') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
    text = label || 'Warning';
  } else if (norm === 'stable' || norm === 'low' || norm === 'normal') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle;
    text = label || 'Stable';
  } else if (norm === 'active monitoring') {
    styles = 'bg-sky-50 text-sky-700 border-sky-200';
    Icon = Info;
    text = label || 'Active Monitoring';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{text}</span>
    </span>
  );
}
