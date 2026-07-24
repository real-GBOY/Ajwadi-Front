import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetContractById,
  useGetContractHistory,
  useGetContractFinancial,
} from '../hooks/contracts/useContracts';
import { ArrowLeft, Calendar, Clock, DollarSign, User, Users, FileText, CheckCircle, XCircle, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import Loader from '../designSystem/Loader';
import { Tabs } from '../designSystem/ui/tabs';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contract, isLoading } = useGetContractById(id || null);
  const [activeTab, setActiveTab] = useState('financial');

  // Fetch contract history (using projectId from proposal)
  const projectId = contract?.proposalData?.projectId;
  const { data: historyData, isLoading: historyLoading } = useGetContractHistory(projectId || null, {
    enabled: !!projectId,
  });

  // Fetch financial data (includes transactions, escrow wallet, and financial summary)
  const { data: financialData, isLoading: financialLoading } = useGetContractFinancial(id || null, {
    enabled: !!id,
  });

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const getStatusBadge = useCallback((status: string) => {
    const statusMap: Record<string, { label: string; style: React.CSSProperties }> = {
      pending: {
        label: 'قيد الانتظار',
        style: {
          backgroundColor: 'var(--c-badge-gray-bg)',
          color: 'var(--c-badge-gray-text)',
          borderColor: 'var(--c-badge-gray-border)',
        },
      },
      approved: {
        label: 'موافق عليه',
        style: {
          backgroundColor: 'var(--c-badge-success-bg)',
          color: 'var(--c-badge-success-text)',
          borderColor: 'var(--c-badge-success-border)',
        },
      },
      rejected: {
        label: 'مرفوض',
        style: {
          backgroundColor: 'var(--c-badge-error-bg)',
          color: 'var(--c-badge-error-text)',
          borderColor: 'var(--c-badge-error-border)',
        },
      },
      active: {
        label: 'نشط',
        style: {
          backgroundColor: 'var(--c-badge-info-bg)',
          color: 'var(--c-badge-info-text)',
          borderColor: 'var(--c-badge-info-border)',
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
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border"
        style={statusInfo.style}>
        {statusInfo.label}
      </span>
    );
  }, []);

  const formatCurrency = useCallback((amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  }, []);

  const getTransactionStatusBadge = useCallback((status: string) => {
    const statusMap: Record<string, { label: string; style: React.CSSProperties }> = {
      COMPLETED: {
        label: 'مكتمل',
        style: {
          backgroundColor: 'var(--c-badge-success-bg)',
          color: 'var(--c-badge-success-text)',
          borderColor: 'var(--c-badge-success-border)',
        },
      },
      PENDING: {
        label: 'قيد الانتظار',
        style: {
          backgroundColor: 'var(--c-badge-warning-bg)',
          color: 'var(--c-badge-warning-text)',
          borderColor: 'var(--c-badge-warning-border)',
        },
      },
      FAILED: {
        label: 'فاشل',
        style: {
          backgroundColor: 'var(--c-badge-error-bg)',
          color: 'var(--c-badge-error-text)',
          borderColor: 'var(--c-badge-error-border)',
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
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border"
        style={statusInfo.style}>
        {statusInfo.label}
      </span>
    );
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <p className="text-text-sub">العقد غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-sub hover:text-text-strong mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span>العودة</span>
      </button>

      {/* Contract Header */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-strong mb-2">
              عقد <span className="font-english text-2xl">#{contract.id.slice(0, 8)}</span>
            </h1>
            {contract.proposalData && (
              <p className="text-text-sub">{contract.proposalData.description || 'لا يوجد وصف'}</p>
            )}
          </div>
          <div>{getStatusBadge(contract.status)}</div>
        </div>

        {/* Contract Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
            </div>
            <div>
              <span className="text-xs font-medium text-text-sub block mb-1">قيمة العقد</span>
              <span className="text-lg font-bold text-text-strong block">{formatCurrency(contract.value)}</span>
              {contract.paidValue && (
                <span className="text-sm text-green-600 font-medium block mt-1">
                  مدفوع: {formatCurrency(contract.paidValue)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            </div>
            <div>
              <span className="text-xs font-medium text-text-sub block mb-1">المدة</span>
              <span className="text-lg font-bold text-text-strong block">{contract.duration} يوم</span>
              {contract.emergencyduration && (
                <span className="text-sm text-orange-600 font-medium block mt-1">
                  طوارئ: {contract.emergencyduration} يوم
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
            </div>
            <div>
              <span className="text-xs font-medium text-text-sub block mb-1">تاريخ البدء</span>
              <span className="text-lg font-bold text-text-strong block">
                {new Date(contract.startdate).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {contract.version && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              </div>
              <div>
                <span className="text-xs font-medium text-text-sub block mb-1">الإصدار</span>
                <span className="text-lg font-bold text-text-strong block">{contract.version}</span>
              </div>
            </div>
          )}
        </div>

        {/* Client and Freelancer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {contract.clientData && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative w-14 h-14 flex-shrink-0">
                {contract.clientData.profilePicture?.url ? (
                  <img
                    src={contract.clientData.profilePicture.url}
                    alt={contract.clientData.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                    {contract.clientData.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600">العميل</span>
                </div>
                <p className="text-base font-semibold text-text-strong">{contract.clientData.name}</p>
                {contract.clientData.phone && (
                  <p className="text-sm text-text-sub font-english">{contract.clientData.phone}</p>
                )}
              </div>
            </div>
          )}

          {contract.freelancerData && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative w-14 h-14 flex-shrink-0">
                {contract.freelancerData.profilePicture?.url ? (
                  <img
                    src={contract.freelancerData.profilePicture.url}
                    alt={contract.freelancerData.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                    {contract.freelancerData.name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-purple-600">المستقل</span>
                </div>
                <p className="text-base font-semibold text-text-strong">{contract.freelancerData.name}</p>
                {contract.freelancerData.phone && (
                  <p className="text-sm text-text-sub font-english">{contract.freelancerData.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Approval Status */}
        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-600">موافقة العميل:</span>
            {contract.clientapproval ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-purple-600">موافقة المستقل:</span>
            {contract.freelancerapproval ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        {contract.termsAndConditions && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-text-strong mb-3">الشروط والأحكام</h3>
            <p className="text-sm text-text-sub leading-relaxed whitespace-pre-wrap">
              {contract.termsAndConditions}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-border">
        <Tabs
          tabs={[
            {
              id: 'financial',
              label: 'البيانات المالية',
              content: (
                <div className="p-6">
                  <div>
              {financialLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader />
                </div>
              ) : financialData ? (
                <div className="space-y-6">
                  {/* Financial Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-text-strong mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      الملخص المالي
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">القيمة الإجمالية</span>
                        </div>
                        <span className="text-lg font-bold text-text-strong">
                          {formatCurrency(financialData.financialSummary.totalValue)}{' '}
                          {financialData.financialSummary.currency}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">المدفوع</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(financialData.financialSummary.paidValue)}{' '}
                          {financialData.financialSummary.currency}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium text-orange-600">المتبقي</span>
                        </div>
                        <span className="text-lg font-bold text-text-strong">
                          {formatCurrency(financialData.financialSummary.remainingBalance)}{' '}
                          {financialData.financialSummary.currency}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" style={{ color: 'var(--c-warning)' }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--c-warning)' }}>
                            قيد الانتظار
                          </span>
                        </div>
                        <span className="text-lg font-bold" style={{ color: 'var(--c-warning)' }}>
                          {formatCurrency(financialData.financialSummary.pendingBalance)}{' '}
                          {financialData.financialSummary.currency}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-white rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-medium text-indigo-600">إجمالي الإيداع</span>
                        </div>
                        <span className="text-base font-semibold text-text-strong">
                          {formatCurrency(financialData.financialSummary.totalDeposited)}{' '}
                          {financialData.financialSummary.currency}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">إجمالي الإفراج</span>
                        </div>
                        <span className="text-base font-semibold text-green-600">
                          {formatCurrency(financialData.financialSummary.totalReleased)}{' '}
                          {financialData.financialSummary.currency}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium text-red-600">إجمالي الاسترداد</span>
                        </div>
                        <span className="text-base font-semibold text-text-strong">
                          {formatCurrency(financialData.financialSummary.totalRefunded)}{' '}
                          {financialData.financialSummary.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Wallet */}
                  {financialData.escrowWallet && (
                    <div className="bg-white rounded-lg p-6 border border-border">
                      <h3 className="text-xl font-bold text-text-strong mb-4 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-primary" />
                        محفظة الضمان
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-medium text-indigo-600">معرف المحفظة</span>
                          </div>
                          <span className="text-sm font-semibold text-text-strong font-english">
                            {financialData.escrowWallet.id.slice(0, 8)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4" style={{ color: 'var(--c-warning)' }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--c-warning)' }}>
                              الرصيد المعلق
                            </span>
                          </div>
                          <span className="text-base font-bold" style={{ color: 'var(--c-warning)' }}>
                            {formatCurrency(financialData.escrowWallet.pendingBalance)}{' '}
                            {financialData.escrowWallet.currency}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-600">الرصيد المفرج عنه</span>
                          </div>
                          <span className="text-base font-bold text-green-600">
                            {formatCurrency(financialData.escrowWallet.releasedBalance)}{' '}
                            {financialData.escrowWallet.currency}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-primary">الحالة</span>
                          </div>
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border"
                            style={{
                              backgroundColor:
                                financialData.escrowWallet.status === 'PENDING'
                                  ? 'var(--c-badge-warning-bg)'
                                  : financialData.escrowWallet.status === 'ACTIVE'
                                  ? 'var(--c-badge-success-bg)'
                                  : 'var(--c-badge-gray-bg)',
                              color:
                                financialData.escrowWallet.status === 'PENDING'
                                  ? 'var(--c-badge-warning-text)'
                                  : financialData.escrowWallet.status === 'ACTIVE'
                                  ? 'var(--c-badge-success-text)'
                                  : 'var(--c-badge-gray-text)',
                              borderColor:
                                financialData.escrowWallet.status === 'PENDING'
                                  ? 'var(--c-badge-warning-border)'
                                  : financialData.escrowWallet.status === 'ACTIVE'
                                  ? 'var(--c-badge-success-border)'
                                  : 'var(--c-badge-gray-border)',
                            }}>
                            {financialData.escrowWallet.status === 'PENDING'
                              ? 'قيد الانتظار'
                              : financialData.escrowWallet.status === 'ACTIVE'
                              ? 'نشط'
                              : financialData.escrowWallet.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transactions */}
                  <div>
                    <h3 className="text-xl font-bold text-text-strong mb-4 flex items-center gap-2">
                      <TrendingDown className="w-6 h-6 text-primary" />
                      المعاملات ({financialData.transactions?.length || 0})
                    </h3>
                    {financialData.transactions && financialData.transactions.length > 0 ? (
                      <div className="space-y-4">
                        {financialData.transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-text-strong mb-1">
                                  معاملة <span className="font-english text-sm">#{transaction.id.slice(0, 8)}</span>
                                </h4>
                                <p className="text-xs text-text-sub">
                                  تاريخ الإنشاء:{' '}
                                  {new Date(transaction.createdAt).toLocaleDateString('ar-SA', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              {getTransactionStatusBadge(transaction.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <DollarSign className="w-3.5 h-3.5 text-green-600" />
                                  <span className="text-text-sub font-medium">المبلغ</span>
                                </div>
                                <span className="font-semibold text-text-strong">
                                  {formatCurrency(transaction.amount)} {transaction.currency}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-text-sub font-medium">النوع</span>
                                </div>
                                <span className="font-semibold text-text-strong">{transaction.type}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                                  <span className="text-text-sub font-medium">الحالة</span>
                                </div>
                                <span className="font-semibold text-text-strong">{transaction.status}</span>
                              </div>
                              {transaction.updatedAt && (
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Calendar className="w-3.5 h-3.5 text-orange-600" />
                                    <span className="text-text-sub font-medium">آخر تحديث</span>
                                  </div>
                                  <span className="font-semibold text-text-strong">
                                    {new Date(transaction.updatedAt).toLocaleDateString('ar-SA', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-lg border border-border">
                        <p className="text-text-sub">لا توجد معاملات للعقد</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-text-sub">لا توجد بيانات مالية للعقد</p>
                </div>
              )}
                  </div>
                </div>
              ),
            },
            {
              id: 'history',
              label: 'السجل',
              content: (
                <div className="p-6">
                  <div>
              {historyLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader />
                </div>
              ) : historyData && historyData.length > 0 ? (
                <div className="space-y-4">
                  {historyData.map((historyContract) => (
                    <div
                      key={historyContract.id}
                      className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-text-strong mb-1">
                            عقد <span className="font-english text-sm">#{historyContract.id.slice(0, 8)}</span>
                          </h4>
                          <p className="text-xs text-text-sub">
                            تاريخ الإنشاء:{' '}
                            {new Date(historyContract.createdAt).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(historyContract.status)}
                          {historyContract.version && (
                            <span className="text-xs text-text-sub">الإصدار: {historyContract.version}</span>
                          )}
                        </div>
                      </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <DollarSign className="w-3.5 h-3.5 text-green-600" />
                                  <span className="text-text-sub font-medium">القيمة</span>
                                </div>
                                <span className="font-semibold text-text-strong">{formatCurrency(historyContract.value)}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-text-sub font-medium">المدة</span>
                                </div>
                                <span className="font-semibold text-text-strong">{historyContract.duration} يوم</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <User className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-text-sub font-medium">موافقة العميل</span>
                                </div>
                                {historyContract.clientapproval ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 inline" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-400 inline" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Users className="w-3.5 h-3.5 text-purple-600" />
                                  <span className="text-text-sub font-medium">موافقة المستقل</span>
                                </div>
                                {historyContract.freelancerapproval ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 inline" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-400 inline" />
                                )}
                              </div>
                            </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-text-sub">لا يوجد سجل للعقد</p>
                </div>
              )}
                  </div>
                </div>
              ),
            },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
