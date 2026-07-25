import { useMemo } from 'react';
import { Calendar, Users, User, FolderKanban, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/StatCard';
import ProductSalesChart from '../components/ProductSalesChart';
import DonutChart from '../components/DonutChart';
import TransactionsChart from '../components/TransactionsChart';
import {
  useDashboardOverview,
  useDashboardActiveProjects,
  useDashboardProjectsByField,
} from '../hooks/dashboard/useDashboard';
import { useGetAllTransactions } from '../hooks/wallet/useWallet';

const SEED_PROJECTS_BY_FIELD: Array<{ key: string; percentage: number }> = [
  { key: 'webDevelopment', percentage: 28 },
  { key: 'mobileDevelopment', percentage: 18 },
  { key: 'uiUxDesign', percentage: 14 },
  { key: 'graphicDesign', percentage: 12 },
  { key: 'digitalMarketing', percentage: 10 },
  { key: 'dataAnalysis', percentage: 8 },
  { key: 'writing', percentage: 5 },
  { key: 'translation', percentage: 3 },
  { key: 'videoEditing', percentage: 1 },
  { key: 'photography', percentage: 1 },
];

const CHART_COLORS = [
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#f97316',
  '#a855f7',
  '#06b6d4',
];

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.getDate();
    const mon = d.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${mon}`;
  } catch {
    return iso;
  }
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ﷼`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ﷼`;
  return `${value.toLocaleString()} ﷼`;
}

function parseChange(change: string): { display: string; isPositive: boolean } {
  const raw = String(change ?? '0').trim();
  const s = raw.replace('%', '').trim();
  const num = parseFloat(s);
  const isPositive = !Number.isNaN(num) && num >= 0;
  const display = raw.endsWith('%') ? raw : `${Number.isNaN(num) ? s : num}%`;
  return { display, isPositive };
}

export default function DashboardPage() {
  const { t } = useTranslation();

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }, []);

  const overviewQuery = useDashboardOverview(dateRange);
  const activeProjectsQuery = useDashboardActiveProjects(dateRange);
  const transactionsQuery = useGetAllTransactions();
  const projectsByFieldQuery = useDashboardProjectsByField();

  const overview = overviewQuery.data;
  const activeProjects = activeProjectsQuery.data;
  const transactions = transactionsQuery.data ?? [];
  const projectsByField = projectsByFieldQuery.data ?? [];

  const projectsChartData = useMemo(() => {
    if (!activeProjects?.timeSeries?.length) return [];
    return activeProjects.timeSeries.map(({ date, active, completed }) => ({
      date: formatDateShort(date),
      active: Number(active) || 0,
      completed: Number(completed) || 0,
    }));
  }, [activeProjects?.timeSeries]);

  const categoryData = useMemo(() => {
    if (projectsByField.length === 0) {
      return SEED_PROJECTS_BY_FIELD.map((item, i) => ({
        label: t(`categories.${item.key}`),
        percentage: item.percentage,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    }
    return projectsByField.map((item, i) => ({
      label: item.field || t('unknown'),
      percentage: Number(item.percentage) || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [projectsByField, t]);

  const transactionsChartData = useMemo(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const byDate: Record<string, { completed: number; pending: number; amount: number }> = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      byDate[key] = { completed: 0, pending: 0, amount: 0 };
    }
    transactions.forEach((tx) => {
      const key = tx.createdAt?.slice(0, 10) ?? '';
      if (!byDate[key]) return;
      const amount = Number(tx.amount) || 0;
      if (tx.status === 'COMPLETED') {
        byDate[key].completed += 1;
        byDate[key].amount += amount;
      } else {
        byDate[key].pending += 1;
      }
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { completed, pending, amount }]) => ({
        date: formatDateShort(date),
        count: completed + pending,
        completed,
        pending,
        amount: Math.round(amount * 100) / 100,
      }));
  }, [transactions, dateRange.startDate, dateRange.endDate]);

  const isLoading =
    overviewQuery.isLoading ||
    activeProjectsQuery.isLoading ||
    transactionsQuery.isLoading ||
    projectsByFieldQuery.isLoading;

  const hasError =
    overviewQuery.isError ||
    activeProjectsQuery.isError ||
    transactionsQuery.isError ||
    projectsByFieldQuery.isError;

  if (hasError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-red-600">{t('errorLoadingDashboard') || 'Failed to load dashboard.'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{t('dashboard')}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{t('timePeriod')}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse min-w-0" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            label={t('totalFreelancers')}
            value={overview.freelancers.total.toLocaleString()}
            change={parseChange(overview.freelancers.change).display}
            isPositive={parseChange(overview.freelancers.change).isPositive}
            icon={Users}
            iconColor="text-indigo-600 bg-indigo-50"
          />
          <StatCard
            label={t('totalClients')}
            value={overview.clients.total.toLocaleString()}
            change={parseChange(overview.clients.change).display}
            isPositive={parseChange(overview.clients.change).isPositive}
            icon={User}
            iconColor="text-blue-600 bg-blue-50"
          />
          <StatCard
            label={t('totalProjects')}
            value={overview.projects.total.toLocaleString()}
            change={parseChange(overview.projects.change).display}
            isPositive={parseChange(overview.projects.change).isPositive}
            icon={FolderKanban}
            iconColor="text-amber-600 bg-amber-50"
          />
          <StatCard
            label={t('totalRevenue')}
            value={formatRevenue(overview.revenue.total)}
            change={parseChange(overview.revenue.change).display}
            isPositive={parseChange(overview.revenue.change).isPositive}
            icon={Wallet}
            iconColor="text-emerald-600 bg-emerald-50"
          />
        </div>
      ) : null}

      <div className="mb-4 sm:mb-6 min-w-0">
        {activeProjectsQuery.isLoading ? (
          <div className="h-64 sm:h-72 lg:h-80 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <ProductSalesChart data={projectsChartData} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {projectsByFieldQuery.isLoading ? (
          <div className="h-64 sm:h-72 lg:h-80 bg-gray-100 rounded-lg animate-pulse min-w-0" />
        ) : (
          <DonutChart data={categoryData} />
        )}
        {transactionsQuery.isLoading ? (
          <div className="h-64 sm:h-72 lg:h-80 bg-gray-100 rounded-lg animate-pulse min-w-0" />
        ) : (
          <TransactionsChart data={transactionsChartData} />
        )}
      </div>
    </div>
  );
}
