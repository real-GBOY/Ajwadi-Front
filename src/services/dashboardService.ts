/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface DashboardOverview {
  freelancers: { total: number; change: string };
  clients: { total: number; change: string };
  projects: { total: number; change: string };
  revenue: { total: number; change: string };
}

export interface DashboardActiveProjects {
  current: { active: number; change: string };
  timeSeries: Array<{ date: string; active: number; completed: number }>;
}

export interface FreelancerByCountry {
  country: string;
  count: number;
  percentage: string;
}

export interface ProjectByField {
  field: string;
  fieldId?: string;
  count: number;
  percentage: string;
}

export const dashboardService = {
  getOverview: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardOverview> => {
    const response = await apiClient.get(endPoints.dashboard.overview, {
      params,
    });
    const data = response.data?.data || response.data;
    return {
      freelancers: data?.freelancers ?? { total: 0, change: '0' },
      clients: data?.clients ?? { total: 0, change: '0' },
      projects: data?.projects ?? { total: 0, change: '0' },
      revenue: data?.revenue ?? { total: 0, change: '0' },
    };
  },

  getActiveProjects: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardActiveProjects> => {
    const response = await apiClient.get(endPoints.dashboard.activeProjects, {
      params,
    });
    const data = response.data?.data || response.data;
    const rawSeries =
      Array.isArray(data?.timeSeries)
        ? data.timeSeries
        : Array.isArray(data?.time_series)
          ? data.time_series
          : [];
    const timeSeries = rawSeries.map(
      (point: Record<string, unknown>) => ({
        date:
          String(point.date ?? point.day ?? point.label ?? '') ||
          new Date().toISOString().slice(0, 10),
        active: Number(point.active ?? point.active_count ?? point.activeCount ?? 0) || 0,
        completed:
          Number(point.completed ?? point.completed_count ?? point.completedCount ?? 0) || 0,
      }),
    );
    const current = data?.current ?? data?.summary ?? {};
    return {
      current: {
        active: Number(current.active ?? current.active_count ?? 0) || 0,
        change: String(current.change ?? current.change_percent ?? '0'),
      },
      timeSeries,
    };
  },

  getFreelancersByCountry: async (): Promise<FreelancerByCountry[]> => {
    const response = await apiClient.get(endPoints.dashboard.freelancersByCountry);
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getProjectsByField: async (): Promise<ProjectByField[]> => {
    const response = await apiClient.get(endPoints.dashboard.projectsByField);
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};
