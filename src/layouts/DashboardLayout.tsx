import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile/tablet header */}
      <header className="lg:hidden fixed top-0 start-0 end-0 h-14 z-30 flex items-center gap-3 px-4 bg-white border-b border-gray-200 shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ms-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          aria-label={t('sidebar.menu') || 'القائمة'}
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-semibold text-gray-900">{t('sidebar.appName')}</span>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
