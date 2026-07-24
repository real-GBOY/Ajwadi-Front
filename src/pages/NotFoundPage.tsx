import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">الصفحة غير موجودة</p>
      <Link to="/" className="text-emerald-600 hover:text-emerald-700">
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
