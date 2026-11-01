import React from 'react';

export default function StatCard({ title, value, unit = '', subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600'
  };

  const badgeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${badgeColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
