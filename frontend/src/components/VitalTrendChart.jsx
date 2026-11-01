import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export default function VitalTrendChart({ records = [] }) {
  const [activeMetric, setActiveMetric] = useState('systolic_bp');

  const metricConfigs = {
    systolic_bp: {
      name: 'Systolic Blood Pressure',
      unit: 'mmHg',
      color: '#0284c7', // sky-600
      refMin: 90,
      refMax: 120,
      domain: [70, 210]
    },
    blood_glucose: {
      name: 'Blood Glucose',
      unit: 'mg/dL',
      color: '#d97706', // amber-600
      refMin: 70,
      refMax: 100,
      domain: [60, 260]
    },
    heart_rate: {
      name: 'Resting Heart Rate',
      unit: 'bpm',
      color: '#e11d48', // rose-600
      refMin: 60,
      refMax: 100,
      domain: [40, 140]
    },
    serum_creatinine: {
      name: 'Serum Creatinine',
      unit: 'mg/dL',
      color: '#7c3aed', // violet-600
      refMin: 0.6,
      refMax: 1.2,
      domain: [0.4, 4.0]
    }
  };

  const config = metricConfigs[activeMetric] || metricConfigs.systolic_bp;

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
        <p className="text-sm font-medium">No longitudinal vitals logged yet.</p>
      </div>
    );
  }

  // Extract points
  const points = records.map((r, i) => {
    const val = r[activeMetric] !== null && r[activeMetric] !== undefined ? Number(r[activeMetric]) : null;
    let label = `Log ${i + 1}`;
    if (r.recorded_at) {
      const d = new Date(r.recorded_at);
      label = `${d.getMonth() + 1}/${d.getDate()}`;
    }
    return { val, label };
  }).filter(p => p.val !== null);

  const values = points.map(p => p.val);
  const minVal = Math.min(...values, config.domain[0]);
  const maxVal = Math.max(...values, config.domain[1]);
  const range = maxVal - minVal || 1;

  // Chart dimensions
  const width = 600;
  const height = 220;
  const paddingX = 45;
  const paddingY = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Map data to coordinates
  const coords = points.map((p, i) => {
    const x = paddingX + (points.length > 1 ? (i / (points.length - 1)) * chartW : chartW / 2);
    const y = height - paddingY - ((p.val - minVal) / range) * chartH;
    return { ...p, x, y };
  });

  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Normal range reference band coordinates
  const refYMax = height - paddingY - ((config.refMax - minVal) / range) * chartH;
  const refYMin = height - paddingY - ((config.refMin - minVal) / range) * chartH;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Longitudinal Telemetry Trend</h3>
          <p className="text-xs text-slate-500">
            Target Reference: {config.refMin} - {config.refMax} {config.unit}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(metricConfigs).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeMetric === key
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cfg.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 select-none">
          {/* Reference normal band */}
          <rect
            x={paddingX}
            y={Math.max(paddingY, Math.min(refYMin, refYMax))}
            width={chartW}
            height={Math.abs(refYMin - refYMax)}
            fill="#10b981"
            fillOpacity="0.08"
          />

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" />

          {/* Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke={config.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {coords.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#ffffff"
                stroke={config.color}
                strokeWidth="2.5"
              />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#334155"
              >
                {pt.val}
              </text>
              <text
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {pt.label}
              </text>
            </g>
          ))}

          {/* Y Axis Labels */}
          <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {Math.round(maxVal)}
          </text>
          <text x={paddingX - 8} y={height - paddingY} textAnchor="end" fontSize="10" fill="#94a3b8">
            {Math.round(minVal)}
          </text>
        </svg>
      </div>
    </div>
  );
}
