/** @format */

import {
  useDashboardOverview,
  useDashboardActiveProjects,
  useDashboardFreelancersByCountry,
  useDashboardProjectsByField,
} from './dashboard.queries';

export const useDashboard = () => ({
  useDashboardOverview,
  useDashboardActiveProjects,
  useDashboardFreelancersByCountry,
  useDashboardProjectsByField,
});

export {
  useDashboardOverview,
  useDashboardActiveProjects,
  useDashboardFreelancersByCountry,
  useDashboardProjectsByField,
} from './dashboard.queries';
