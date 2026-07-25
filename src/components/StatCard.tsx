import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({
  label,
  value,
  change,
  isPositive,
  icon: Icon,
  iconColor = 'text-blue-600 bg-blue-50',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <span className={`flex items-center justify-center w-8 h-8 rounded-md shrink-0 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-sm text-gray-500 truncate">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-xl sm:text-2xl font-semibold text-gray-900 truncate min-w-0">{value}</div>
        <div className={`flex items-center gap-1 text-sm shrink-0 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}
