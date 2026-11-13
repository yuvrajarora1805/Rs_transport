import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'slate',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">{title}</p>
        {icon && <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>{icon}</div>}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="mt-1.5 text-xs font-medium text-slate-500">{subtitle}</p>}
        {trend && <p className="mt-1.5 text-xs font-semibold text-emerald-600">{trend}</p>}
      </div>
    </div>
  );
};
