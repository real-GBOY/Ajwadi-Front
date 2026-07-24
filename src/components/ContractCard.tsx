import { useNavigate } from 'react-router-dom';
import type { Contract } from '../services/contractService';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Coins,
  User,
  Users,
  Check,
  X,
  FileText,
} from 'lucide-react';

interface ContractCardProps {
  contract: Contract;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: 'قيد الانتظار',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'موافق عليه',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'مرفوض',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  active: {
    label: 'نشط',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'مكتمل',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  cancelled: {
    label: 'ملغي',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export default function ContractCard({ contract }: ContractCardProps) {
  const navigate = useNavigate();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/contracts/${contract.id}`);
  };

  const statusInfo = STATUS_CONFIG[contract.status] || {
    label: contract.status,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getProfilePictureUrl = (profilePicture?: { url: string; id?: string } | null) => {
    if (!profilePicture) return null;
    return profilePicture.url || null;
  };

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || '—';

  const startDate = contract.startdate
    ? new Date(contract.startdate).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const Avatar = ({
    name,
    picture,
    label,
    icon: Icon,
  }: {
    name: string;
    picture?: { url: string } | null;
    label: string;
    icon: React.ElementType;
  }) => (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="relative w-9 h-9 flex-shrink-0 rounded-full overflow-hidden bg-slate-100 border border-slate-200/80">
        {getProfilePictureUrl(picture) ? (
          <img
            src={getProfilePictureUrl(picture)!}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.style.display = 'none';
              const fallback = t.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center text-slate-600 font-semibold text-sm ${getProfilePictureUrl(picture) ? 'hidden' : ''}`}
        >
          {getInitials(name)}
        </div>
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <Icon className="w-3.5 h-3.5 shrink-0" />
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
      </div>
    </div>
  );

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/contracts/${contract.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/contracts/${contract.id}`);
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
      {/* Top accent */}
      <div
        className="h-1 w-full bg-gradient-to-l from-primary/20 to-primary/5"
        aria-hidden
      />

      <div className="p-5 sm:p-6 flex flex-col flex-1 min-h-0">
        {/* Status + version */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
          {contract.version != null && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>الإصدار {contract.version}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-snug group-hover:text-primary transition-colors">
          عقد <span className="font-english">#{contract.id.slice(0, 8)}</span>
        </h3>
        {contract.proposalData?.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {contract.proposalData.description}
          </p>
        )}
        {!contract.proposalData?.description && <div className="mb-4" />}

        {/* People - freelancer & client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {contract.freelancerData && (
            <Avatar
              name={contract.freelancerData.name}
              picture={contract.freelancerData.profilePicture}
              label="المستقل"
              icon={Users}
            />
          )}
          {contract.clientData && (
            <Avatar
              name={contract.clientData.name}
              picture={contract.clientData.profilePicture}
              label="العميل"
              icon={User}
            />
          )}
        </div>

        {/* Meta - value, duration, date */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Coins className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">قيمة العقد</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(contract.value)}
              </span>
              {contract.paidValue != null && Number(contract.paidValue) > 0 && (
                <span className="text-xs text-gray-500 block mt-0.5">
                  مدفوع: {formatCurrency(contract.paidValue)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">المدة</span>
              <span className="font-semibold text-gray-900">{contract.duration} يوم</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 shrink-0">
              <Calendar className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">تاريخ البدء</span>
              <span className="font-medium text-gray-700">{startDate}</span>
            </div>
          </div>
        </div>

        {/* Approvals - compact inline */}
        <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80">
            {contract.clientapproval ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>موافقة العميل</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80">
            {contract.freelancerapproval ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>موافقة المستقل</span>
          </span>
        </div>

        {/* CTA */}
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
          <span className="order-1">عرض التفاصيل</span>
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 shrink-0 order-2" />
        </button>
      </div>
    </article>
  );
}
