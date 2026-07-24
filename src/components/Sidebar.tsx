import {
  LayoutDashboard,
  User,
  LogOut,
  Users,
  Database,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  AlertCircle,
  DollarSign,
  FolderKanban,
  Bell,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetVerificationDemandsCount, useGetTagAttachmentDemandsCount } from '@/hooks/demands/useDemands';
import { useGetExperienceDemandsCount } from '@/hooks/experienceDemands/useExperienceDemands';
import { useGetComplaintsCount } from '@/hooks/complaints/useComplaints';
import { useListReports } from '@/hooks/reports/useReports';
import apiClient from '@/config/axios';
import endpoints from '@/config/endPoints';
import socketService from '@/services/socketService';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isAppDataOpen, setIsAppDataOpen] = useState(false);
  const [isDemandsOpen, setIsDemandsOpen] = useState(false);
  const [isComplainOpen, setIsComplainOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  // Fetch demand counts
  const { data: verificationCount = 0 } = useGetVerificationDemandsCount();
  const { data: tagAttachmentCount = 0 } = useGetTagAttachmentDemandsCount();
  const { data: experienceDemandsCount = 0 } = useGetExperienceDemandsCount({ isUnderReview: true });
  const totalDemandsCount = verificationCount + tagAttachmentCount + experienceDemandsCount;

  // Complain counts: عام (public reports) + مشاريع (project complaints)
  const { data: complaintsCountData } = useGetComplaintsCount();
  const projectComplaintsCount = complaintsCountData?.data?.count ?? 0;
  const { data: publicReportsData } = useListReports(
    { page: 1, limit: 1, projectId: 'null' },
    { enabled: true }
  );
  const publicReportsCount = publicReportsData?.pagination?.total ?? 0;
  const totalComplainCount = publicReportsCount + projectComplaintsCount;
  
  // Route mapping for sidebar items
  const routeMap: Record<string, string> = {
    dashboard: '/dashboard',
    clients: '/users/clients',
    freelancers: '/users/freelancers',
    employees: '/users/employees',
    skills: '/app-data/skills',
    specification: '/app-data/specification',
    privacyPolicy: '/app-data/privacy-policy',
    tags: '/app-data/tags',
    identity: '/demands/identity',
    // "demands" tags page
    demands: '/demands/tags',
    experience: '/demands/experience',
    public: '/complain/public',
    projects: '/complain/projects',
    transactions: '/finance/transactions',
    withdrawDemand: '/finance/withdraw-demand',
    taxedTransaction: '/finance/taxed-transaction',
    topupTransaction: '/finance/topup-transaction',
    project: '/projects/project',
    contracts: '/projects/contracts',
    pushNotifications: '/notifications/push',
  };

  const handleLogout = async () => {
    try {
      // Try to notify backend (ignore errors)
      await apiClient.post(endpoints.auth.logout).catch((error) => {
        console.error('Logout API call failed (ignored):', error);
      });
    } finally {
      // Clear auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('employee');

      // Disconnect chat socket
      try {
        socketService.disconnect();
      } catch (error) {
        console.error('Error disconnecting socket (ignored):', error);
      }

      // Navigate to login
      navigate('/login');
    }
  };

  const handleItemClick = (itemId: string) => {
    if (itemId === 'logout') {
      handleLogout();
      return;
    }

    const route = routeMap[itemId];
    if (route) {
      navigate(route);
      onClose?.();
    }
  };

  const isActive = (itemId: string) => {
    const route = routeMap[itemId];
    if (!route) return false;
    
    // For exact match
    if (location.pathname === route) return true;
    
    // For nested routes (e.g., /users/employees should highlight employees)
    // This handles cases where the route might be a parent path
    return location.pathname.startsWith(route + '/') || location.pathname === route;
  };

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { id: 'pushNotifications', label: t('sidebar.pushNotifications', 'الإشعارات الفورية'), icon: Bell },
  ];

  const usersItems = [
    { id: 'clients', label: t('sidebar.clients') },
    { id: 'freelancers', label: t('sidebar.freelancers') },
    { id: 'employees', label: t('sidebar.employees') },
  ];

  const appDataItems = [
    { id: 'skills', label: t('sidebar.skills') },
    { id: 'specification', label: t('sidebar.specification') },
    { id: 'privacyPolicy', label: t('sidebar.privacyPolicy') },
    { id: 'tags', label: t('sidebar.tags') },
  ];

  const demandsItems = [
    { id: 'identity', label: t('sidebar.identity'), count: verificationCount },
    { id: 'demands', label: t('sidebar.demandsItem'), count: tagAttachmentCount },
    { id: 'experience', label: t('sidebar.experience'), count: experienceDemandsCount },
  ];

  const complainItems = [
    { id: 'public', label: t('sidebar.public'), count: publicReportsCount },
    { id: 'projects', label: t('sidebar.projects'), count: projectComplaintsCount },
  ];

  const financeItems = [
    { id: 'transactions', label: t('sidebar.transactions') },
    { id: 'withdrawDemand', label: t('sidebar.withdrawDemand') },
    { id: 'taxedTransaction', label: t('sidebar.taxedTransaction') },
    { id: 'topupTransaction', label: t('sidebar.topupTransaction') },
  ];

  const projectsItems = [
    { id: 'project', label: t('sidebar.project') },
    { id: 'contracts', label: t('sidebar.contracts') },
  ];

  // Auto-open dropdowns when their items are active
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/users/')) setIsUsersOpen(true);
    if (path.startsWith('/app-data/')) setIsAppDataOpen(true);
    if (path.startsWith('/demands/')) setIsDemandsOpen(true);
    if (path.startsWith('/complain/')) setIsComplainOpen(true);
    if (path.startsWith('/finance/')) setIsFinanceOpen(true);
    if (path.startsWith('/projects/')) setIsProjectsOpen(true);
  }, [location.pathname]);

  // Close drawer on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Backdrop for mobile/tablet drawer */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200 ease-out"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      <aside
        className={`
          w-64 shrink-0 bg-gray-50 border-l border-gray-200 h-screen flex flex-col
          fixed inset-y-0 start-0 z-50 lg:relative lg:z-auto
          transition-transform duration-200 ease-out
          lg:translate-x-0
          max-lg:transform
          ${isOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 truncate">{t('sidebar.appName')}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shrink-0"
            aria-label={t('sidebar.close') || 'إغلاق'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const itemActive = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                itemActive
                  ? 'bg-white text-gray-900 border-r-2 border-emerald-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-right">{item.label}</span>
            </button>
          );
        })}

        {/* Users Dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setIsUsersOpen(!isUsersOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="flex-1 text-right">{t('sidebar.users')}</span>
            {isUsersOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {isUsersOpen && (
            <div className="mr-8 mt-1">
              {usersItems.map((item) => {
                const itemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      itemActive
                        ? 'bg-white text-gray-900 border-r-2 border-emerald-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-1 text-right">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* App Data Dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setIsAppDataOpen(!isAppDataOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Database className="w-5 h-5" />
            <span className="flex-1 text-right">{t('sidebar.appData')}</span>
            {isAppDataOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {isAppDataOpen && (
            <div className="mr-8 mt-1">
              {appDataItems.map((item) => {
                const itemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      itemActive
                        ? 'bg-white text-gray-900 border-r-2 border-emerald-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-1 text-right">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Demands Dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setIsDemandsOpen(!isDemandsOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="flex-1 text-right">{t('sidebar.demands')}</span>
            {totalDemandsCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold text-white bg-primary rounded-full">
                {totalDemandsCount > 99 ? '99+' : totalDemandsCount}
              </span>
            )}
            {isDemandsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {isDemandsOpen && (
            <div className="mr-8 mt-1">
              {demandsItems.map((item) => {
                const itemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      itemActive
                        ? 'bg-white text-gray-900 border-r-2 border-primary'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-1 text-right min-w-0 truncate">{item.label}</span>
                    {'count' in item && item.count !== undefined && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full shrink-0">
                        {typeof item.count === 'number' && item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Complain Dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setIsComplainOpen(!isComplainOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1 text-right">{t('sidebar.complain')}</span>
            {totalComplainCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold text-white bg-primary rounded-full shrink-0">
                {totalComplainCount > 99 ? '99+' : totalComplainCount}
              </span>
            )}
            {isComplainOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {isComplainOpen && (
            <div className="mr-8 mt-1">
              {complainItems.map((item) => {
                const itemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      itemActive
                        ? 'bg-white text-gray-900 border-r-2 border-emerald-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-1 text-right min-w-0 truncate">{item.label}</span>
                    {'count' in item && item.count !== undefined && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full shrink-0">
                        {typeof item.count === 'number' && item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Finance Dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setIsFinanceOpen(!isFinanceOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span className="flex-1 text-right">{t('sidebar.finance')}</span>
            {isFinanceOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {isFinanceOpen && (
            <div className="mr-8 mt-1">
              {financeItems.map((item) => {
                const itemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      itemActive
                        ? 'bg-white text-gray-900 border-r-2 border-emerald-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-1 text-right">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects Dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FolderKanban className="w-5 h-5" />
            <span className="flex-1 text-right">{t('sidebar.projectsMenu')}</span>
            {isProjectsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {isProjectsOpen && (
            <div className="mr-8 mt-1">
              {projectsItems.map((item) => {
                const itemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      itemActive
                        ? 'bg-white text-gray-900 border-r-2 border-emerald-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-1 text-right">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-2">
        <button
          onClick={() => {
            handleItemClick('logout');
            onClose?.();
          }}
          className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('sidebar.logOut')}</span>
        </button>
      </div>
      </aside>
    </>
  );
}
