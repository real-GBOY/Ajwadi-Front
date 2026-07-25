import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetProjectById,
  useGetProposalsByProjectId,
  useGetContractsByProjectId,
} from '../hooks/projects/useProjects';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react';
import Loader from '../designSystem/Loader';
import { Tabs } from '../designSystem/ui/tabs';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useGetProjectById(id || null);
  const [activeTab, setActiveTab] = useState('proposals');

  // Fetch tab data
  const { data: proposalsData, isLoading: proposalsLoading } = useGetProposalsByProjectId(id || null);
  const { data: contractsData, isLoading: contractsLoading } = useGetContractsByProjectId(id || null);

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const getStatusBadge = useCallback((status: string) => {
    const statusMap: Record<string, { label: string; style: React.CSSProperties }> = {
      openforbids: {
        label: 'مفتوح للعروض',
        style: {
          backgroundColor: 'var(--c-badge-info-bg)',
          color: 'var(--c-badge-info-text)',
          borderColor: 'var(--c-badge-info-border)',
        },
      },
      closedforbids: {
        label: 'مغلق للعروض',
        style: {
          backgroundColor: 'var(--c-badge-gray-bg)',
          color: 'var(--c-badge-gray-text)',
          borderColor: 'var(--c-badge-gray-border)',
        },
      },
      in_progress: {
        label: 'قيد التنفيذ',
        style: {
          backgroundColor: 'var(--c-badge-warning-bg)',
          color: 'var(--c-badge-warning-text)',
          borderColor: 'var(--c-badge-warning-border)',
        },
      },
      completed: {
        label: 'مكتمل',
        style: {
          backgroundColor: 'var(--c-badge-success-bg)',
          color: 'var(--c-badge-success-text)',
          borderColor: 'var(--c-badge-success-border)',
        },
      },
      cancelled: {
        label: 'ملغي',
        style: {
          backgroundColor: 'var(--c-badge-error-bg)',
          color: 'var(--c-badge-error-text)',
          borderColor: 'var(--c-badge-error-border)',
        },
      },
      closed: {
        label: 'مغلق',
        style: {
          backgroundColor: 'var(--c-badge-gray-bg)',
          color: 'var(--c-badge-gray-text)',
          borderColor: 'var(--c-badge-gray-border)',
        },
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      style: {
        backgroundColor: 'var(--c-badge-gray-bg)',
        color: 'var(--c-badge-gray-text)',
        borderColor: 'var(--c-badge-gray-border)',
      },
    };

    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
        style={statusInfo.style}>
        {statusInfo.label}
      </span>
    );
  }, []);

  // Early returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-border p-6">
          <p className="text-text-sub">المشروع غير موجود</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const tabs = [
    {
      id: 'proposals',
      label: 'العروض',
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-strong mb-4">العروض</h3>
            {proposalsLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : proposalsData && proposalsData.length > 0 ? (
              <div className="space-y-4">
                {proposalsData.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-text-strong mb-1">
                          عرض
                        </h4>
                        <p className="text-xs text-text-sub">
                          تاريخ الإنشاء:{' '}
                          {new Date(proposal.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap border"
                        style={{
                          backgroundColor:
                            proposal.status === 'accepted'
                              ? 'var(--c-badge-success-bg)'
                              : proposal.status === 'rejected'
                              ? 'var(--c-badge-error-bg)'
                              : 'var(--c-badge-gray-bg)',
                          color:
                            proposal.status === 'accepted'
                              ? 'var(--c-badge-success-text)'
                              : proposal.status === 'rejected'
                              ? 'var(--c-badge-error-text)'
                              : 'var(--c-badge-gray-text)',
                          borderColor:
                            proposal.status === 'accepted'
                              ? 'var(--c-badge-success-border)'
                              : proposal.status === 'rejected'
                              ? 'var(--c-badge-error-border)'
                              : 'var(--c-badge-gray-border)',
                        }}>
                        {proposal.status === 'accepted'
                          ? 'مقبول'
                          : proposal.status === 'rejected'
                          ? 'مرفوض'
                          : 'قيد الانتظار'}
                      </span>
                    </div>
                    {proposal.freelancerData && (
                      <div className="mb-3 pb-3 border-b border-border">
                        <p className="text-xs font-medium text-text-sub mb-2">المستقل:</p>
                        <div className="flex items-center gap-3">
                          {proposal.freelancerData.profilePictureData?.url ? (
                            <img
                              src={proposal.freelancerData.profilePictureData.url}
                              alt={proposal.freelancerData.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-lg ${
                              proposal.freelancerData.profilePictureData?.url ? 'hidden' : 'flex'
                            }`}
                            style={{
                              display: proposal.freelancerData.profilePictureData?.url ? 'none' : 'flex',
                            }}>
                            {proposal.freelancerData.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-text-strong">
                              {proposal.freelancerData.name}
                            </h5>
                            {proposal.freelancerData.jobTitle && (
                              <p className="text-xs text-text-sub">{proposal.freelancerData.jobTitle}</p>
                            )}
                            <p className="text-xs text-text-sub font-english mt-1">
                              {proposal.freelancerData.phone}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {proposal.freelancerData.avgRating &&
                                proposal.freelancerData.avgRating !== '0.00' &&
                                proposal.freelancerData.avgRating !== 0 && (
                                  <span className="inline-flex items-center text-xs text-text-sub">
                                    <Star className="w-3.5 h-3.5 me-1 fill-yellow-500 text-yellow-500" />
                                    {typeof proposal.freelancerData.avgRating === 'string'
                                      ? parseFloat(proposal.freelancerData.avgRating).toFixed(1)
                                      : proposal.freelancerData.avgRating.toFixed(1)}{' '}
                                    ({proposal.freelancerData.totalReviews || 0})
                                  </span>
                                )}
                              {proposal.freelancerData.isVerifiedAsFreelancer && (
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
                                  style={{
                                    backgroundColor: 'var(--c-badge-success-bg)',
                                    color: 'var(--c-badge-success-text)',
                                    borderColor: 'var(--c-badge-success-border)',
                                  }}>
                                  <CheckCircle className="w-3.5 h-3.5 me-1" /> محقق
                                </span>
                              )}
                              {proposal.freelancerData.available !== undefined && (
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
                                  style={{
                                    backgroundColor: proposal.freelancerData.available
                                      ? 'var(--c-badge-info-bg)'
                                      : 'var(--c-badge-gray-bg)',
                                    color: proposal.freelancerData.available
                                      ? 'var(--c-badge-info-text)'
                                      : 'var(--c-badge-gray-text)',
                                    borderColor: proposal.freelancerData.available
                                      ? 'var(--c-badge-info-border)'
                                      : 'var(--c-badge-gray-border)',
                                  }}>
                                  {proposal.freelancerData.available ? 'متاح' : 'غير متاح'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="text-sm text-text-strong mb-1">وصف العرض:</p>
                      <p className="text-sm text-text-sub">{proposal.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-text-sub block mb-1">ميزانية العرض</span>
                        <span className="text-sm font-medium text-text-strong">
                          {typeof proposal.budget === 'string'
                            ? parseFloat(proposal.budget).toFixed(2)
                            : proposal.budget.toFixed(2)}{' '}
                          ريال
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-text-sub block mb-1">مدة التنفيذ</span>
                        <span className="text-sm font-medium text-text-strong">
                          {proposal.duration} يوم
                        </span>
                      </div>
                    </div>
                    {proposal.filesData && proposal.filesData.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs font-medium text-text-sub mb-2">الملفات المرفقة:</p>
                        <div className="flex flex-wrap gap-2">
                          {proposal.filesData.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline">
                              {file.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-sub">لا توجد عروض حالياً</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'contracts',
      label: 'العقود',
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-strong mb-4">العقود</h3>
            {contractsLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : contractsData && contractsData.length > 0 ? (
              <div className="space-y-4">
                {contractsData.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-text-strong mb-1">
                          عقد #{contract.id.slice(0, 8)}
                        </h4>
                        <p className="text-xs text-text-sub">
                          تاريخ الإنشاء:{' '}
                          {new Date(contract.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap border"
                        style={{
                          backgroundColor:
                            contract.status === 'active'
                              ? 'var(--c-badge-success-bg)'
                              : contract.status === 'completed'
                              ? 'var(--c-badge-info-bg)'
                              : contract.status === 'cancelled'
                              ? 'var(--c-badge-error-bg)'
                              : 'var(--c-badge-gray-bg)',
                          color:
                            contract.status === 'active'
                              ? 'var(--c-badge-success-text)'
                              : contract.status === 'completed'
                              ? 'var(--c-badge-info-text)'
                              : contract.status === 'cancelled'
                              ? 'var(--c-badge-error-text)'
                              : 'var(--c-badge-gray-text)',
                          borderColor:
                            contract.status === 'active'
                              ? 'var(--c-badge-success-border)'
                              : contract.status === 'completed'
                              ? 'var(--c-badge-info-border)'
                              : contract.status === 'cancelled'
                              ? 'var(--c-badge-error-border)'
                              : 'var(--c-badge-gray-border)',
                        }}>
                        {contract.status === 'active'
                          ? 'نشط'
                          : contract.status === 'completed'
                          ? 'مكتمل'
                          : contract.status === 'cancelled'
                          ? 'ملغي'
                          : contract.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-text-strong mb-1">شروط وأحكام العقد:</p>
                      <p className="text-sm text-text-sub line-clamp-3">{contract.termsAndConditions}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-text-sub block mb-1">قيمة العقد</span>
                        <span className="text-sm font-medium text-text-strong">
                          {formatCurrency(contract.value)} ريال
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-text-sub block mb-1">المبلغ المدفوع</span>
                        <span className="text-sm font-medium text-text-strong">
                          {formatCurrency(contract.paidValue)} ريال
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-text-sub block mb-1">مدة العقد</span>
                        <span className="text-sm font-medium text-text-strong">
                          {contract.duration} يوم
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-text-sub block mb-1">تاريخ البدء</span>
                        <span className="text-sm font-medium text-text-strong">
                          {new Date(contract.startdate).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    {(contract.clientData || contract.freelancerData) && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs font-medium text-text-sub mb-2">أطراف العقد:</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {contract.clientData && (
                            <div>
                              <span className="text-text-sub block mb-1">العميل:</span>
                              <span className="text-text-strong">{contract.clientData.name}</span>
                              <span className="text-text-sub font-english block mt-1">
                                {contract.clientData.phone}
                              </span>
                            </div>
                          )}
                          {contract.freelancerData && (
                            <div>
                              <span className="text-text-sub block mb-1">المستقل:</span>
                              <span className="text-text-strong">{contract.freelancerData.name}</span>
                              <span className="text-text-sub font-english block mt-1">
                                {contract.freelancerData.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="pt-3 border-t border-border mt-3">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-text-sub">موافقة العميل:</span>
                          <span
                            className="px-2 py-1 rounded border"
                            style={{
                              backgroundColor: contract.clientapproval
                                ? 'var(--c-badge-success-bg)'
                                : 'var(--c-badge-gray-bg)',
                              color: contract.clientapproval
                                ? 'var(--c-badge-success-text)'
                                : 'var(--c-badge-gray-text)',
                              borderColor: contract.clientapproval
                                ? 'var(--c-badge-success-border)'
                                : 'var(--c-badge-gray-border)',
                            }}>
                            {contract.clientapproval ? 'موافق' : 'غير موافق'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-sub">موافقة المستقل:</span>
                          <span
                            className="px-2 py-1 rounded border"
                            style={{
                              backgroundColor: contract.freelancerapproval
                                ? 'var(--c-badge-success-bg)'
                                : 'var(--c-badge-gray-bg)',
                              color: contract.freelancerapproval
                                ? 'var(--c-badge-success-text)'
                                : 'var(--c-badge-gray-text)',
                              borderColor: contract.freelancerapproval
                                ? 'var(--c-badge-success-border)'
                                : 'var(--c-badge-gray-border)',
                            }}>
                            {contract.freelancerapproval ? 'موافق' : 'غير موافق'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-sub">لا توجد عقود حالياً</p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/projects/project')}
        className="flex items-center gap-2 text-text-sub hover:text-text-strong mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>العودة إلى المشاريع</span>
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-text-strong mb-2">{project.title}</h1>
            {project.specification && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-text-sub">التخصص:</span>
                <span className="text-sm font-medium text-text-strong">{project.specification.name}</span>
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              {getStatusBadge(project.status)}
              <span className="text-sm text-text-sub">
                تاريخ الإنشاء:{' '}
                {new Date(project.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-text-sub mb-1">الميزانية</p>
            <p className="text-lg font-semibold text-text-strong">
              {formatCurrency(project.minBudget)} - {formatCurrency(project.maxBudget)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-text-sub mb-1">المدة</p>
            <p className="text-lg font-semibold text-text-strong">{project.duration} يوم</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-text-sub mb-1">الحالة</p>
            <div className="mt-1">{getStatusBadge(project.status)}</div>
          </div>
        </div>

        {project.description && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-text-strong mb-2">الوصف:</p>
            <p className="text-sm text-text-sub leading-relaxed">{project.description}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
