import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">{t('sidebar.settings')}</h1>
      <div className="bg-white rounded-lg p-6">
        <p className="text-gray-600">{t('pages.settings.underDevelopment', 'صفحة الإعدادات - قيد التطوير')}</p>
      </div>
    </div>
  );
}
