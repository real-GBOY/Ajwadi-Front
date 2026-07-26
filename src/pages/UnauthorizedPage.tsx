import { useTranslation } from 'react-i18next';

export default function UnauthorizedPage() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
      <p className="text-gray-600">{t('pages.errors.unauthorized', 'ليس لديك صلاحية للوصول إلى هذه الصفحة')}</p>
    </div>
  );
}
