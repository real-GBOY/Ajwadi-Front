import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetUserById, useVerifyAsClient, useUnverifyAsClient } from '../hooks/users/useUsers';
import {
  useGetUserIdentity,
  useGetUserProposals,
  useGetUserContracts,
  useGetUserProjects,
} from '../hooks/userDetails/useUserDetails';
import { ArrowRight, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import Loader from '../designSystem/Loader';
import { Tabs } from '../designSystem/ui/tabs';
import { useFindOrCreateConversation } from '../hooks/chat/useChat';
import { getCurrentUserId } from '../utils/getCurrentUserId';
import ChatModal from '../components/ChatModal';
import SuccessModal from '../designSystem/SuccessModal';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: user, isLoading, refetch } = useGetUserById(id || null);
  const [activeTab, setActiveTab] = useState('identity');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const findOrCreateConversation = useFindOrCreateConversation();

  const verifyAsClientMutation = useVerifyAsClient();
  const unverifyAsClientMutation = useUnverifyAsClient();

  // Fetch tab data
  const { data: identityData, isLoading: identityLoading } = useGetUserIdentity(id || null);
  const { data: proposalsData, isLoading: proposalsLoading } = useGetUserProposals(id || null);
  const { data: contractsData, isLoading: contractsLoading } = useGetUserContracts(
    id || null,
    'client'
  );
  const { data: projectsData, isLoading: projectsLoading } = useGetUserProjects(id || null);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-border p-6">
          <p className="text-text-sub">{t('detailPages.clientNotFound', 'العميل غير موجود')}</p>
        </div>
      </div>
    );
  }

  const profilePictureUrl = user.profilePictureData?.url;
  const initials = user.name?.charAt(0).toUpperCase() || 'U';

  const handleStartChat = () => {
    if (!id || !user || findOrCreateConversation.isPending) return;
    
    const currentUserIdValue = getCurrentUserId();
    
    if (!currentUserIdValue) {
      console.error('Current user ID not found. Cannot create conversation.');
      alert(t('apiErrors.unauthorized', 'خطأ: لم يتم العثور على معرف المستخدم الحالي. يرجى تسجيل الدخول مرة أخرى.'));
      return;
    }
    
    // If conversation already exists, just open the modal
    if (conversationId) {
      setIsChatModalOpen(true);
      return;
    }
    
    const conversationName = `${t('detailPages.chatWith', 'محادثة مع ')}${user.name}`;
    const participantIds = [currentUserIdValue, id];

    findOrCreateConversation.mutate(
      {
        participantIds,
        currentUserId: currentUserIdValue,
        name: conversationName,
        metadata: {
          type: 'direct',
          clientId: id,
          supportType: 'customer_support',
        },
      },
      {
        onSuccess: (data) => {
          setConversationId(data.id);
          setIsChatModalOpen(true);
        },
        onError: (error: unknown) => {
          console.error('Failed to create conversation:', error);
          const apiError = error as { response?: { data?: { message?: string } }; message?: string };
          const errorMessage =
            apiError?.response?.data?.message || apiError?.message || t('detailPages.unknownError', 'حدث خطأ غير معروف');
          alert(`${t('common.errorSend', 'خطأ في إنشاء المحادثة: ')}${errorMessage}`);
        },
      }
    );
  };

  const handleToggleClientVerification = async () => {
    if (!id) return;
    try {
      if (user.isVerifiedAsClient) {
        await unverifyAsClientMutation.mutateAsync(id);
        setSuccessMessage(t('detailPages.unverifyClientSuccess', 'تم إلغاء التحقق كعميل بنجاح'));
      } else {
        await verifyAsClientMutation.mutateAsync(id);
        setSuccessMessage(t('detailPages.verifyClientSuccess', 'تم التحقق كعميل بنجاح'));
      }
      refetch();
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error toggling client verification:', error);
    }
  };

  const tabs = [
    {
      id: 'identity',
      label: t('detailPages.identity', 'الهوية'),
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-strong mb-4">{t('detailPages.identityInfo', 'معلومات الهوية')}</h3>
            {identityLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : identityData ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-sub mb-1 block">
                    {t('detailPages.verificationStatus', 'حالة التحقق')}
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      identityData.isVerified
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                    {identityData.isVerified ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 me-1" /> {t('detailPages.verified', 'محقق')}
                      </>
                    ) : (
                      t('detailPages.unverified', 'غير محقق')
                    )}
                  </span>
                </div>
                {identityData.verifiedBy && (
                  <div>
                    <label className="text-sm font-medium text-text-sub mb-1 block">
                      {t('detailPages.verifiedBy', 'تم التحقق بواسطة')}
                    </label>
                    <p className="text-sm text-text-strong">{identityData.verifiedBy}</p>
                  </div>
                )}
                {identityData.files && identityData.files.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-text-sub mb-2 block">
                      {t('detailPages.identityPhotos', 'صور الهوية')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {identityData.files.map((file, index) => (
                        <img
                          key={index}
                          src={file.url}
                          alt={`Identity document ${index + 1}`}
                          className="w-full h-auto rounded-lg border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-text-sub mb-1 block">
                    {t('detailPages.createdAtPlain', 'تاريخ الإنشاء')}
                  </label>
                  <p className="text-sm text-text-strong">
                    {new Date(identityData.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-sub mb-1 block">
                    {t('detailPages.phoneVerification', 'تحقق الهاتف')}
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      user.phoneVerification
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                    {user.phoneVerification ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 me-1" /> {t('detailPages.verified', 'محقق')}
                      </>
                    ) : (
                      t('detailPages.unverified', 'غير محقق')
                    )}
                  </span>
                </div>
                <p className="text-sm text-text-sub">{t('detailPages.noIdentity', 'لا توجد معلومات هوية متاحة')}</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'projects',
      label: t('detailPages.projects', 'المشاريع'),
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-strong mb-4">{t('detailPages.projects', 'المشاريع')}</h3>
            {projectsLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : projectsData?.data && projectsData.data.length > 0 ? (
              <div className="space-y-4">
                {projectsData.data.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-base font-semibold text-text-strong">{project.title}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {t(`detailPages.${project.status}`, project.status)}
                      </span>
                    </div>
                    <p className="text-sm text-text-sub mb-2 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-text-sub">
                      <span>
                        {t('detailPages.budget', 'الميزانية')}: {project.minBudget} - {project.maxBudget}
                      </span>
                      <span>{t('detailPages.duration', 'المدة')}: {project.duration} {t('detailPages.days', 'يوم')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-sub">{t('detailPages.noProjects', 'لا توجد مشاريع حالياً')}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'proposals',
      label: t('detailPages.proposals', 'العروض'),
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-strong mb-4">{t('detailPages.proposals', 'العروض')}</h3>
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
                          {proposal.projectData?.title || `${t('detailPages.proposalForProject', 'عرض للمشروع: ')}${proposal.projectId}`}
                        </h4>
                        {proposal.projectData && (
                          <p className="text-xs text-text-sub mb-2 line-clamp-1">
                            {proposal.projectData.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          proposal.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : proposal.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {proposal.status === 'accepted'
                          ? t('detailPages.accepted', 'مقبول')
                          : proposal.status === 'rejected'
                          ? t('detailPages.rejected', 'مرفوض')
                          : t('detailPages.pending', 'قيد الانتظار')}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-text-strong mb-1">{t('detailPages.proposalDesc', 'وصف العرض:')}</p>
                      <p className="text-sm text-text-sub">{proposal.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-text-sub block mb-1">{t('detailPages.proposalBudget', 'ميزانية العرض')}</span>
                        <span className="text-sm font-medium text-text-strong">
                          {typeof proposal.budget === 'string'
                            ? parseFloat(proposal.budget).toFixed(2)
                            : proposal.budget.toFixed(2)}{' '}
                          {t('detailPages.sar', 'ريال')}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-text-sub block mb-1">{t('detailPages.executionDuration', 'مدة التنفيذ')}</span>
                        <span className="text-sm font-medium text-text-strong">
                          {proposal.duration} {t('detailPages.days', 'يوم')}
                        </span>
                      </div>
                    </div>
                    {proposal.projectData && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs font-medium text-text-sub mb-2">{t('detailPages.projectInfo', 'معلومات المشروع:')}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-text-sub">{t('detailPages.budgetRange', 'نطاق الميزانية: ')}</span>
                            <span className="text-text-strong">
                              {typeof proposal.projectData.minBudget === 'string'
                                ? parseFloat(proposal.projectData.minBudget).toFixed(2)
                                : proposal.projectData.minBudget.toFixed(2)}{' '}
                              -{' '}
                              {typeof proposal.projectData.maxBudget === 'string'
                                ? parseFloat(proposal.projectData.maxBudget).toFixed(2)
                                : proposal.projectData.maxBudget.toFixed(2)}{' '}
                              {t('detailPages.sar', 'ريال')}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-sub">{t('detailPages.projectDuration', 'مدة المشروع: ')}</span>
                            <span className="text-text-strong">
                              {proposal.projectData.duration} {t('detailPages.days', 'يوم')}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-sub">{t('detailPages.projectStatus', 'حالة المشروع: ')}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                proposal.projectData.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : proposal.projectData.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                              {t(`detailPages.${proposal.projectData.status}`, proposal.projectData.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-text-sub">
                      {t('detailPages.createdAt', 'تاريخ الإنشاء: ')}{' '}
                      {new Date(proposal.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-sub">{t('detailPages.noProposals', 'لا توجد عروض حالياً')}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'contracts',
      label: t('detailPages.contracts', 'العقود'),
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-strong mb-4">{t('detailPages.contracts', 'العقود')}</h3>
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
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-base font-semibold text-text-strong">
                        {t('detailPages.contractNum', 'عقد #')}{contract.id.slice(0, 8)}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          contract.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : contract.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {t(`detailPages.${contract.status}`, contract.status)}
                      </span>
                    </div>
                    <p className="text-sm text-text-sub mb-2 line-clamp-2">
                      {contract.termsAndConditions}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-sub">
                      <span>{t('detailPages.value', 'القيمة')}: {contract.value}</span>
                      <span>{t('detailPages.duration', 'المدة')}: {contract.duration} {t('detailPages.days', 'يوم')}</span>
                      {contract.freelancerData && (
                        <span>{t('detailPages.freelancer', 'المستقل')}: {contract.freelancerData.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-sub">{t('detailPages.noContracts', 'لا توجد عقود حالياً')}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'tags',
      label: t('detailPages.tags', 'العلامات'),
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-strong mb-4">{t('detailPages.tags', 'العلامات')}</h3>
            {user.tagsData && user.tagsData.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.tagsData.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-border">
                    {tag.badgeUrl && (
                      <img
                        src={tag.badgeUrl}
                        alt={tag.name}
                        className="w-6 h-6 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-sm text-text-strong">{tag.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-sub">{t('detailPages.noTags', 'لا توجد علامات')}</p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/users/clients')}
        className="mb-6 flex items-center gap-2 text-text-sub hover:text-text-strong transition-colors">
        <ArrowRight className="w-5 h-5" />
        <span>{t('detailPages.backToClients', 'العودة إلى قائمة العملاء')}</span>
      </button>

      {/* Header with Personal Data */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-2xl ${
                profilePictureUrl ? 'hidden' : 'flex'
              }`}
              style={{ display: profilePictureUrl ? 'none' : 'flex' }}>
              {initials}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-semibold text-text-strong mb-2">{user.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-sub">{t('detailPages.phone', 'رقم الجوال:')}</span>
                    <span className="text-sm font-english text-text-strong">{user.phone}</span>
                  </div>
                  {user.country && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-sub">{t('detailPages.country', 'البلد:')}</span>
                      <span className="text-sm text-text-strong">{user.country}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleClientVerification}
                  disabled={
                    verifyAsClientMutation.isPending || unverifyAsClientMutation.isPending
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    user.isVerifiedAsClient
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {user.isVerifiedAsClient ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>{t('detailPages.unverifyAsClient', 'إلغاء التحقق كعميل')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('detailPages.verifyAsClient', 'التحقق كعميل')}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleStartChat}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{t('detailPages.startChat', 'بدء المحادثة')}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  user.isVerifiedAsClient
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                {user.isVerifiedAsClient ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 me-1" /> {t('detailPages.clientVerified', 'محقق كعميل')}
                  </>
                ) : (
                  t('detailPages.unverified', 'غير محقق')
                )}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  user.isSuspended
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                {user.isSuspended ? t('detailPages.suspended', 'معلق') : t('detailPages.active', 'نشط')}
              </span>
              {user.phoneVerification && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  <CheckCircle className="w-3.5 h-3.5 me-1" /> {t('detailPages.phoneVerified', 'الهاتف محقق')}
                </span>
              )}
            </div>

            {user.overview && (
              <div className="mt-4">
                <p className="text-sm text-text-strong">{user.overview}</p>
              </div>
            )}

            {user.address && (
              <div className="mt-2">
                <span className="text-sm text-text-sub">{t('detailPages.address', 'العنوان: ')}</span>
                <span className="text-sm text-text-strong">{user.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-border p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        conversationId={conversationId}
        conversationName={`${t('detailPages.chatWith', 'محادثة مع ')}${user.name}`}
        participantName={user.name}
        participantId={id}
      />

      {/* Success Modal (PATCH actions) */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
        details={t('detailPages.userVerifySuccess', 'تم تنفيذ العملية عبر واجهة التحقق للمستخدم.')}
      />
    </div>
  );
}
