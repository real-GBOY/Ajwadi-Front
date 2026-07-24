import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import SkillsPage from '../pages/SkillsPage';
import SpecificationPage from '../pages/SpecificationPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TagsPage from '../pages/TagsPage';
import DemandsPage from '../pages/DemandsPage';
import TopupTransactionPage from '../pages/TopupTransactionPage';
import EmployeesPage from '../pages/EmployeesPage';
import ClientsPage from '../pages/ClientsPage';
import FreelancersPage from '../pages/FreelancersPage';
import ClientDetailPage from '../pages/ClientDetailPage';
import FreelancerDetailPage from '../pages/FreelancerDetailPage';
import IdentityPage from '../pages/IdentityPage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import ContractsPage from '../pages/ContractsPage';
import ContractDetailPage from '../pages/ContractDetailPage';
import ProjectsComplainPage from '../pages/ProjectsComplainPage';
import ComplaintDetailPage from '../pages/ComplaintDetailPage';
import ExperienceDemandsPage from '../pages/ExperienceDemandsPage';
import PushNotificationsPage from '../pages/PushNotificationsPage';
import TransactionsPage from '../pages/TransactionsPage';
import WithdrawDemandPage from '../pages/WithdrawDemandPage';
import PublicComplainPage from '../pages/PublicComplainPage';
import TaxedTransactionPage from '../pages/TaxedTransactionPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes - Require authentication */}
    
        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Users Routes */}
          <Route path="/users/clients" element={<ClientsPage />} />
          <Route path="/users/clients/:id" element={<ClientDetailPage />} />
          <Route path="/users/freelancers" element={<FreelancersPage />} />
          <Route path="/users/freelancers/:id" element={<FreelancerDetailPage />} />
          <Route path="/users/employees" element={<EmployeesPage />} />
          
          {/* App Data Routes */}
          <Route path="/app-data/skills" element={<SkillsPage />} />
          <Route path="/app-data/specification" element={<SpecificationPage />} />
          <Route path="/app-data/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/app-data/tags" element={<TagsPage />} />
          
          {/* Demands Routes */}
          <Route path="/demands/identity" element={<IdentityPage />} />
          <Route path="/demands/tags" element={<DemandsPage />} />
          <Route path="/demands/experience" element={<ExperienceDemandsPage />} />
          
          {/* Complain Routes */}
          <Route path="/complain/public" element={<PublicComplainPage />} />
          <Route path="/complain/projects" element={<ProjectsComplainPage />} />
          <Route path="/complain/projects/:id" element={<ComplaintDetailPage />} />
          
          {/* Finance Routes */}
          <Route path="/finance/transactions" element={<TransactionsPage />} />
          <Route path="/finance/withdraw-demand" element={<WithdrawDemandPage />} />
          <Route path="/finance/taxed-transaction" element={<TaxedTransactionPage />} />
          <Route path="/finance/topup-transaction" element={<TopupTransactionPage />} />
          
          {/* Projects Routes */}
          <Route path="/projects/project" element={<ProjectsPage />} />
          <Route path="/projects/project/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/contracts" element={<ContractsPage />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
          
          {/* Profile and Settings */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Push Notifications */}
          <Route path="/notifications/push" element={<PushNotificationsPage />} />
        </Route>

      {/* 404 Catch-all - must be last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
