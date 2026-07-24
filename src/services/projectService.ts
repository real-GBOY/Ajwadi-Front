/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface Project {
  id: string;
  title: string;
  description: string;
  specificationId: string;
  maxBudget: number;
  minBudget: number;
  duration: number;
  status: string;
  createdById: string;
  executedBy?: string;
  createdAt: string;
  updatedAt: string;
  specification?: {
    id: string;
    name: string;
    icon: string;
  };
}

export interface ProjectListResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}

export const projectService = {
  getAll: async (
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }
  ): Promise<ProjectListResponse> => {
    const response = await apiClient.get(endPoints.projects.getAll, {
      params: filters,
    });

    const backendData = response.data;
    const dataArray = backendData.data || [];
    const pagination = backendData.pagination || {
      page: 1,
      limit: 10,
      total: 0,
    };

    return {
      data: dataArray,
      pagination: {
        page: Number(pagination.page || 1),
        limit: Number(pagination.limit || 10),
        total: Number(pagination.total || 0),
        totalPages: pagination.totalPages
          ? Number(pagination.totalPages)
          : Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      },
    };
  },

  getById: async (id: string | number): Promise<Project> => {
    const response = await apiClient.get(endPoints.projects.getById(id));
    const backendData = response.data;
    return backendData.data || backendData;
  },

  getByUserId: async (
    userId: string | number,
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }
  ): Promise<ProjectListResponse> => {
    const response = await apiClient.get(endPoints.projects.getByUserId(userId), {
      params: filters,
    });

    const backendData = response.data;
    const dataArray = backendData.data || [];
    const pagination = backendData.pagination || {
      page: 1,
      limit: 10,
      total: 0,
    };

    return {
      data: dataArray,
      pagination: {
        page: Number(pagination.page || 1),
        limit: Number(pagination.limit || 10),
        total: Number(pagination.total || 0),
        totalPages: pagination.totalPages
          ? Number(pagination.totalPages)
          : Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      },
    };
  },
};

export default projectService;
