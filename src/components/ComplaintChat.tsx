import { useState, useEffect } from 'react';
import { Complaint } from '../services/complaintService';
import { useFindOrCreateConversation } from '../hooks/chat/useChat';
import { Loader2, MessageCircle } from 'lucide-react';
import Loader from '../designSystem/Loader';
import { getCurrentUserId } from '../utils/getCurrentUserId';
import ChatModal from './ChatModal';
import { useTranslation } from 'react-i18next';

interface ComplaintChatProps {
  complaint: Complaint;
  currentUserId?: string; // The authenticated user's ID (employee/admin)
}

export default function ComplaintChat({ complaint, currentUserId }: ComplaintChatProps) {
  const { t } = useTranslation();
  const [clientConversationId, setClientConversationId] = useState<string | null>(null);
  const [freelancerConversationId, setFreelancerConversationId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<'client' | 'freelancer' | null>(null);

  // Find or create conversations
  const findOrCreateConversation = useFindOrCreateConversation();

  // Handle starting conversation with client
  const handleStartClientConversation = () => {
    if (!complaint.userId || clientConversationId || findOrCreateConversation.isPending) return;
    
    const currentUserIdValue = getCurrentUserId() || currentUserId;
    
    if (!currentUserIdValue) {
      console.error('Current user ID not found. Cannot create conversation.');
      alert(t('complaintChat.userNotFound', 'خطأ: لم يتم العثور على معرف المستخدم الحالي. يرجى تسجيل الدخول مرة أخرى.'));
      return;
    }
    
    const conversationName = `${t('complaintChat.complaint', 'شكوى')} #${complaint.id.slice(0, 8)} - ${t('complaintChat.withClient', 'مع العميل')}`;
    const participantIds = [currentUserIdValue, complaint.userId];

    findOrCreateConversation.mutate(
      {
        participantIds,
        currentUserId: currentUserIdValue,
        name: conversationName,
        metadata: {
          complaintId: complaint.id,
          type: 'complaint',
          participantType: 'client',
          supportType: 'customer_support',
        },
      },
      {
        onSuccess: (data) => {
          setClientConversationId(data.id);
          setOpenModal('client');
        },
        onError: (error: unknown) => {
          console.error('Failed to create client conversation:', error);
          const anyError = error as { response?: { data?: { message?: string } }; message?: string };
          const errorMessage =
            anyError?.response?.data?.message || anyError?.message || t('complaintChat.unknownError', 'حدث خطأ غير معروف');
          alert(`${t('complaintChat.errorClient', 'خطأ في إنشاء المحادثة مع العميل:')} ${errorMessage}`);
        },
      }
    );
  };

  // Handle starting conversation with freelancer
  const handleStartFreelancerConversation = () => {
    if (!complaint.freelancerId || freelancerConversationId || findOrCreateConversation.isPending) return;
    
    const currentUserIdValue = getCurrentUserId() || currentUserId;
    
    if (!currentUserIdValue) {
      console.error('Current user ID not found. Cannot create conversation.');
      alert(t('complaintChat.userNotFound', 'خطأ: لم يتم العثور على معرف المستخدم الحالي. يرجى تسجيل الدخول مرة أخرى.'));
      return;
    }
    
    const conversationName = `${t('complaintChat.complaint', 'شكوى')} #${complaint.id.slice(0, 8)} - ${t('complaintChat.withFreelancer', 'مع المستقل')}`;
    const participantIds = [currentUserIdValue, complaint.freelancerId];

    findOrCreateConversation.mutate(
      {
        participantIds,
        currentUserId: currentUserIdValue,
        name: conversationName,
        metadata: {
          complaintId: complaint.id,
          type: 'complaint',
          participantType: 'freelancer',
          supportType: 'customer_support',
        },
      },
      {
        onSuccess: (data) => {
          setFreelancerConversationId(data.id);
          setOpenModal('freelancer');
        },
        onError: (error: unknown) => {
          console.error('Failed to create freelancer conversation:', error);
          const anyError = error as { response?: { data?: { message?: string } }; message?: string };
          const errorMessage =
            anyError?.response?.data?.message || anyError?.message || t('complaintChat.unknownError', 'حدث خطأ غير معروف');
          alert(`${t('complaintChat.errorFreelancer', 'خطأ في إنشاء المحادثة مع المستقل:')} ${errorMessage}`);
        },
      }
    );
  };

  // Set conversation IDs when mutations succeed
  useEffect(() => {
    if (findOrCreateConversation.isSuccess && findOrCreateConversation.data) {
      const metadata = findOrCreateConversation.data.metadata;
      if (metadata?.participantType === 'client') {
        setClientConversationId(findOrCreateConversation.data.id);
      } else if (metadata?.participantType === 'freelancer') {
        setFreelancerConversationId(findOrCreateConversation.data.id);
      }
    }
  }, [findOrCreateConversation.isSuccess, findOrCreateConversation.data]);

  const handleOpenChat = (type: 'client' | 'freelancer') => {
    if (type === 'client') {
      if (clientConversationId) {
        setOpenModal('client');
      } else {
        handleStartClientConversation();
      }
    } else {
      if (freelancerConversationId) {
        setOpenModal('freelancer');
      } else {
        handleStartFreelancerConversation();
      }
    }
  };

  // Show start conversation buttons if no conversations exist
  if (!clientConversationId && !freelancerConversationId) {
    return (
      <>
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-text-strong mb-2">{t('complaintChat.startChats', 'بدء محادثات حول الشكوى')}</h3>
              <p className="text-sm text-text-sub mb-4">
                {t('complaintChat.startSeparate', 'ابدأ محادثات منفصلة مع')} {complaint.user?.name || t('complaintChat.complainant', 'المشتكي')} {t('complaintChat.and', 'و')}{' '}
                {complaint.freelancer?.name || t('complaintChat.freelancer', 'المستقل')} {t('complaintChat.toDiscuss', 'لمناقشة هذه الشكوى')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              {complaint.userId && (
                <button
                  onClick={() => handleOpenChat('client')}
                  disabled={findOrCreateConversation.isPending}
                  className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--c-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--c-primary-dark)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--c-primary)';
                    }
                  }}>
                  {findOrCreateConversation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('complaintChat.starting', 'جاري البدء...')}</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      <span>{t('complaintChat.chatWithClient', 'محادثة مع العميل')}</span>
                    </>
                  )}
                </button>
              )}
              {complaint.freelancerId && (
                <button
                  onClick={() => handleOpenChat('freelancer')}
                  disabled={findOrCreateConversation.isPending}
                  className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--c-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--c-primary-dark)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--c-primary)';
                    }
                  }}>
                  {findOrCreateConversation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('complaintChat.starting', 'جاري البدء...')}</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      <span>{t('complaintChat.chatWithFreelancer', 'محادثة مع المستقل')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Modals */}
        <ChatModal
          isOpen={openModal === 'client'}
          onClose={() => setOpenModal(null)}
          conversationId={clientConversationId}
          conversationName={`${t('complaintChat.complaint', 'شكوى')} #${complaint.id.slice(0, 8)} - ${t('complaintChat.withClient', 'مع العميل')}`}
          participantName={complaint.user?.name || t('complaintChat.client', 'العميل')}
          participantId={complaint.userId}
        />
        <ChatModal
          isOpen={openModal === 'freelancer'}
          onClose={() => setOpenModal(null)}
          conversationId={freelancerConversationId}
          conversationName={`${t('complaintChat.complaint', 'شكوى')} #${complaint.id.slice(0, 8)} - ${t('complaintChat.withFreelancer', 'مع المستقل')}`}
          participantName={complaint.freelancer?.name || t('complaintChat.freelancer', 'المستقل')}
          participantId={complaint.freelancerId}
        />
      </>
    );
  }

  // Show loading while conversation is being created
  if (findOrCreateConversation.isPending && !clientConversationId && !freelancerConversationId) {
    return (
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {complaint.userId && clientConversationId && (
            <button
              onClick={() => handleOpenChat('client')}
              className="flex-1 px-6 py-3 rounded-lg border border-border bg-background hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--c-primary)',
                color: 'var(--c-primary)',
              }}>
              <MessageCircle className="w-5 h-5" />
              <span>{t('complaintChat.openWithClient', 'فتح محادثة مع العميل')}</span>
            </button>
          )}
          {complaint.freelancerId && freelancerConversationId && (
            <button
              onClick={() => handleOpenChat('freelancer')}
              className="flex-1 px-6 py-3 rounded-lg border border-border bg-background hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--c-primary)',
                color: 'var(--c-primary)',
              }}>
              <MessageCircle className="w-5 h-5" />
              <span>{t('complaintChat.openWithFreelancer', 'فتح محادثة مع المستقل')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Modals */}
      <ChatModal
        isOpen={openModal === 'client'}
        onClose={() => setOpenModal(null)}
        conversationId={clientConversationId}
        conversationName={`${t('complaintChat.complaint', 'شكوى')} #${complaint.id.slice(0, 8)} - ${t('complaintChat.withClient', 'مع العميل')}`}
        participantName={complaint.user?.name || t('complaintChat.client', 'العميل')}
        participantId={complaint.userId}
      />
      <ChatModal
        isOpen={openModal === 'freelancer'}
        onClose={() => setOpenModal(null)}
        conversationId={freelancerConversationId}
        conversationName={`${t('complaintChat.complaint', 'شكوى')} #${complaint.id.slice(0, 8)} - ${t('complaintChat.withFreelancer', 'مع المستقل')}`}
        participantName={complaint.freelancer?.name || t('complaintChat.freelancer', 'المستقل')}
        participantId={complaint.freelancerId}
      />
    </>
  );
}
