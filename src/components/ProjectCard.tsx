import { useNavigate } from 'react-router-dom';
import type { Project } from '../services/projectService';
import { ArrowLeft, Calendar, Clock, Coins, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProjectCardProps {
  project: Project;
}

const STATUS_CONFIG: Record<
  string,
  { labelKey: string; defaultLabel: string; className: string }
> = {
  openforbids: {
    labelKey: 'status.openForBids',
    defaultLabel: 'مفتوح للعروض',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  closedforbids: {
    labelKey: 'status.closedForBids',
    defaultLabel: 'مغلق للعروض',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  in_progress: {
    labelKey: 'status.inProgress',
    defaultLabel: 'قيد التنفيذ',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  completed: {
    labelKey: 'status.completed',
    defaultLabel: 'مكتمل',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  cancelled: {
    labelKey: 'status.cancelled',
    defaultLabel: 'ملغي',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  closed: {
    labelKey: 'status.closed',
    defaultLabel: 'مغلق',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/project/${project.id}`);
  };

  const statusInfo = STATUS_CONFIG[project.status] || {
    labelKey: 'status.closed',
    defaultLabel: project.status,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const createdDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/project/${project.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/projects/project/${project.id}`);
        }
      }}
      className="
        group relative bg-white rounded-xl border border-gray-200/80
        overflow-hidden
        shadow-sm hover:shadow-lg hover:border-gray-300/80
        transition-all duration-200 ease-out
        cursor-pointer
        flex flex-col h-full
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        before:content-[''] before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-primary/10 before:pointer-events-none before:transition-colors before:duration-200
        hover:before:border-primary/30
      "
    >
      {/* Top accent - subtle gradient by status */}
      <div
        className="h-1 w-full bg-gradient-to-l from-primary/20 to-primary/5"
        aria-hidden
      />

      <div className="p-5 sm:p-6 flex flex-col flex-1 min-h-0">
        {/* Status badge - above title for quick scanning */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`
              inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
              ${statusInfo.className}
            `}
          >
            {t(statusInfo.labelKey, statusInfo.defaultLabel)}
          </span>
          {project.specification && (
            <span className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[50%]">
              <FolderOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{project.specification.name}</span>
            </span>
          )}
        </div>

        {/* Title - primary focus */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        {/* Description - secondary, limited lines */}
        {project.description && (
          <p className="text-sm text-gray-500 line-clamp-3 flex-1 min-h-[3.75rem] mb-4 leading-relaxed">
            {project.description}
          </p>
        )}
        {!project.description && <div className="flex-1 min-h-[2rem]" />}

        {/* Meta grid - budget, duration, date */}
        <div className="grid grid-cols-1 gap-3 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Coins className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">{t('labels.budget', 'الميزانية')}</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(project.minBudget)} – {formatCurrency(project.maxBudget)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">{t('labels.duration', 'المدة')}</span>
              <span className="font-semibold text-gray-900">{project.duration} {t('labels.days', 'يوم')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 shrink-0">
              <Calendar className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">{t('labels.createdAt', 'تاريخ الإنشاء')}</span>
              <span className="font-medium text-gray-700">{createdDate}</span>
            </div>
          </div>
        </div>

        {/* CTA - clear action */}
        <button
          type="button"
          onClick={handleView}
          className="
            w-full inline-flex items-center justify-center gap-2
            px-4 py-2.5 rounded-lg
            bg-primary text-white
            text-sm font-semibold
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          "
        >
          <span className="order-1">{t('actions.viewDetails', 'عرض التفاصيل')}</span>
          <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 shrink-0 order-2" />
        </button>
      </div>
    </article>
  );
}
