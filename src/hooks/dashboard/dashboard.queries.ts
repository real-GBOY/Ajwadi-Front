/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { dashboardService } from '@/services/dashboardService';

const dashboardKeys = reactQueryKeys.dashboard;

export const useDashboardOverview = (
  params?: { startDate?: string; endDate?: string },
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: dashboardKeys.overview(params ?? {}),
    queryFn: () => dashboardService.getOverview(params),
    enabled: options?.enabled !== false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

export const useDashboardActiveProjects = (
  params?: { startDate?: string; endDate?: string },
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: dashboardKeys.activeProjects(params ?? {}),
    queryFn: () => dashboardService.getActiveProjects(params),
    enabled: options?.enabled !== false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

export const useDashboardFreelancersByCountry = (
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: dashboardKeys.freelancersByCountry(),
    queryFn: () => dashboardService.getFreelancersByCountry(),
    enabled: options?.enabled !== false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

export const useDashboardProjectsByField = (
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: dashboardKeys.projectsByField(),
    queryFn: () => dashboardService.getProjectsByField(),
    enabled: options?.enabled !== false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
