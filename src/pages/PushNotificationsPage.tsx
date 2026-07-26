/** @format */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput } from '../designSystem/ui/form-input';
import { FormSelect } from '../designSystem/ui/form-select';
import { FormTextarea } from '../designSystem/ui/form-textarea';
import pushNotificationService, {
  BroadcastRequest,
} from '../services/pushNotificationService';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function PushNotificationsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  // Broadcast Form - Only for clients and freelancers
  const [broadcastForm, setBroadcastForm] = useState<BroadcastRequest>({
    targetType: 'clients',
    userIds: [],
    employeeIds: [],
    type: '',
    title: '',
    body: '',
    sourceEventKey: '',
    payload: {},
    actions: [],
    targets: [],
  });
  const [broadcastUserIds, setBroadcastUserIds] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload: BroadcastRequest = {
        ...broadcastForm,
        userIds: broadcastUserIds ? broadcastUserIds.split(',').map((id) => id.trim()).filter(Boolean) : undefined,
        employeeIds: undefined, // Remove employeeIds - only clients and freelancers
      };
      const response = await pushNotificationService.broadcast(payload);
      setResult({
        success: true,
        message: `${t('notifications.sendSuccess', 'تم إرسال الإشعار بنجاح')} (${response.totalRecipients})`,
        data: response,
      });
      setBroadcastForm({
        targetType: 'clients',
        userIds: [],
        employeeIds: [],
        type: '',
        title: '',
        body: '',
        sourceEventKey: '',
        payload: {},
        actions: [],
        targets: [],
      });
      setBroadcastUserIds('');
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || t('notifications.sendFailed', 'فشل في إرسال الإشعار'),
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-text-strong">{t('notifications.title', 'إدارة الإشعارات الفورية')}</h1>
        <p className="text-text-sub mt-2">{t('notifications.subtitle', 'إرسال الإشعارات الفورية للعملاء والمستقلين')}</p>
      </div>

      {result && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
            {result.data && (
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-text-sub hover:text-text-strong">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">{t('notifications.sendSection', 'إرسال إشعار للعملاء والمستقلين')}</h3>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <FormSelect
            label={t('notifications.targetType', 'نوع الهدف')}
            value={broadcastForm.targetType}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, targetType: e.target.value as any })}
            options={[
              { value: 'clients', label: t('notifications.allClients', 'جميع العملاء') },
              { value: 'freelancers', label: t('notifications.allFreelancers', 'جميع المستقلين') },
              { value: 'specific', label: t('notifications.specificUsers', 'مستخدمون محددون') },
            ]}
            required
          />
          {broadcastForm.targetType === 'specific' && (
            <FormInput
              label={t('notifications.userIds', 'معرفات المستخدمين (مفصولة بفواصل)')}
              value={broadcastUserIds}
              onChange={(e) => setBroadcastUserIds(e.target.value)}
              placeholder="uuid-1, uuid-2, uuid-3"
              dir="ltr"
            />
          )}
          <FormInput
            label={t('notifications.notifType', 'نوع الإشعار')}
            value={broadcastForm.type}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
            required
            placeholder="announcement"
          />
          <FormInput
            label={t('notifications.notifTitle', 'العنوان')}
            value={broadcastForm.title}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
            required
            placeholder="New Feature Available"
          />
          <FormTextarea
            label={t('notifications.content', 'المحتوى')}
            value={broadcastForm.body}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
            required
            placeholder="We've just released a new feature!"
            rows={4}
          />
          <FormInput
            label={t('notifications.eventKey', 'مفتاح الحدث (اختياري)')}
            value={broadcastForm.sourceEventKey || ''}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, sourceEventKey: e.target.value })}
            placeholder="announcement:new-feature:2026-02-14"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>{t('notifications.sendBtn', 'إرسال الإشعار')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
