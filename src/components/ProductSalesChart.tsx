import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  active: number;
  completed: number;
}

interface ProductSalesChartProps {
  data: DataPoint[];
}

export default function ProductSalesChart({ data }: ProductSalesChartProps) {
  const { t } = useTranslation();
  const hasData = data.length > 0;

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('activeProjects')}</h3>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm shrink-0" />
            <span className="text-gray-600">{t('activeProjects')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-sm shrink-0" />
            <span className="text-gray-600">{t('completedProjects')}</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500 text-sm">
          {t('noDataForPeriod') || 'No data for this period'}
        </div>
      ) : (
        <div className="h-64 sm:h-72 lg:h-80 w-full min-h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
                formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), '']}
                labelFormatter={(label) => label}
              />
              <Legend
                wrapperStyle={{ paddingTop: 8 }}
                formatter={(value) =>
                  value === 'active' ? t('activeProjects') : t('completedProjects')
                }
              />
              <Bar
                dataKey="active"
                name="active"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                dataKey="completed"
                name="completed"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
