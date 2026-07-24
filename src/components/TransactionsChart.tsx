import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface TransactionChartPoint {
  date: string;
  count: number;
  completed: number;
  pending: number;
  amount: number;
}

interface TransactionsChartProps {
  data: TransactionChartPoint[];
}

const GRID_STROKE = '#e5e7eb';
const AXIS_FILL = '#6b7280';
const LINE_COMPLETED = '#22c55e';
const LINE_PENDING = '#a855f7';
const LINE_AMOUNT = '#3b82f6';

const MOBILE_BREAKPOINT = 640;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function formatAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ﷼`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ﷼`;
  return `${value.toLocaleString()} ﷼`;
}

export default function TransactionsChart({ data }: TransactionsChartProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const hasData = data.length > 0;

  const countMax = hasData
    ? Math.max(10, Math.ceil((Math.max(...data.flatMap((d) => [d.completed, d.pending])) * 1.2) / 5) * 5)
    : 100;
  const amountMax = hasData
    ? Math.max(100, Math.ceil((Math.max(...data.map((d) => d.amount))) * 1.2 / 100) * 100)
    : 1000;

  const chartMargin = isMobile
    ? { top: 8, right: 24, left: 20, bottom: 4 }
    : { top: 12, right: 48, left: 44, bottom: 8 };
  const axisWidth = isMobile ? 28 : 36;
  const axisWidthRight = isMobile ? 32 : 40;
  const tickFontSize = isMobile ? 10 : 12;
  const dotRadius = isMobile ? 3 : 4;
  const activeDotRadius = isMobile ? 4 : 5;

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 min-w-0 overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
        {t('transactionsChart') || 'المعاملات'}
      </h3>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500 text-sm">
          {t('noDataForPeriod') || 'No data for this period'}
        </div>
      ) : (
        <div className="h-64 sm:h-72 lg:h-80 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={chartMargin}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_STROKE}
                vertical={!isMobile}
                horizontal={true}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: tickFontSize, fill: AXIS_FILL }}
                axisLine={{ stroke: GRID_STROKE }}
                tickLine={false}
                interval={isMobile ? 'preserveStartEnd' : 0}
                minTickGap={isMobile ? 24 : 12}
              />
              <YAxis
                yAxisId="left"
                domain={[0, countMax]}
                tick={{ fontSize: tickFontSize, fill: AXIS_FILL }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tickCount={isMobile ? 4 : 6}
                tickFormatter={(v) => String(v)}
                tickMargin={isMobile ? 4 : 10}
                width={axisWidth}
                label={
                  isMobile
                    ? undefined
                    : { value: t('transactionCount') || 'عدد المعاملات', angle: -90, position: 'insideLeft', style: { fill: AXIS_FILL, fontSize: 11 } }
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, amountMax]}
                tick={{ fontSize: tickFontSize, fill: AXIS_FILL }}
                axisLine={false}
                tickLine={false}
                tickCount={isMobile ? 4 : 6}
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : String(v))}
                tickMargin={isMobile ? 4 : 10}
                width={axisWidthRight}
                label={
                  isMobile
                    ? undefined
                    : { value: t('amount') || 'المبلغ ﷼', angle: 90, position: 'insideRight', style: { fill: AXIS_FILL, fontSize: 11 } }
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: isMobile ? '6px 8px' : undefined,
                }}
                labelStyle={{ color: '#374151', fontWeight: 600, fontSize: isMobile ? 12 : undefined }}
                formatter={(value: number | undefined, name?: string) => {
                  if (name === 'amount') return [formatAmount(value ?? 0), t('amount') || 'المبلغ'];
                  return [
                    (value ?? 0).toLocaleString(),
                    name === 'completed' ? (t('completed') || 'مكتملة') : (t('pending') || 'قيد الانتظار'),
                  ];
                }}
                labelFormatter={(label) => label}
              />
              <Legend
                wrapperStyle={{ paddingTop: isMobile ? 4 : 8 }}
                formatter={(value) => {
                  if (value === 'completed') return t('completed') || 'مكتملة';
                  if (value === 'pending') return t('pending') || 'قيد الانتظار';
                  if (value === 'amount') return t('amount') || 'المبلغ';
                  return value;
                }}
                iconType="circle"
                iconSize={isMobile ? 6 : 8}
                style={{ color: AXIS_FILL, fontSize: isMobile ? 10 : 12 }}
                layout={isMobile ? 'horizontal' : undefined}
                align={isMobile ? 'center' : undefined}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="completed"
                name="completed"
                stroke={LINE_COMPLETED}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={{ fill: LINE_COMPLETED, r: dotRadius, strokeWidth: 0 }}
                activeDot={{ r: activeDotRadius, fill: LINE_COMPLETED, stroke: '#d1d5db', strokeWidth: 2 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pending"
                name="pending"
                stroke={LINE_PENDING}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={{ fill: LINE_PENDING, r: dotRadius, strokeWidth: 0 }}
                activeDot={{ r: activeDotRadius, fill: LINE_PENDING, stroke: '#d1d5db', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="amount"
                name="amount"
                stroke={LINE_AMOUNT}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={{ fill: LINE_AMOUNT, r: dotRadius, strokeWidth: 0 }}
                activeDot={{ r: activeDotRadius, fill: LINE_AMOUNT, stroke: '#d1d5db', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
