/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

// Types - Based on API DTO from users-api.http
export interface User {
  id: string;
  name: string;
  phone: string;
  phoneVerification?: boolean;
  country?: string;
  address?: string;
  overview?: string;
  jobTitle?: string;
  mode: 'freelancer' | 'client';
  isVerifiedAsFreelancer?: boolean;
  isVerifiedAsClient?: boolean;
  isSuspended?: boolean;
  suspendedReason?: string | null;
  available?: boolean;
  avgRating?: number | string;
  totalReviews?: number;
  faceIdenbility?: boolean;
  specificationId?: string | null;
  profilePicture?: string | null;
  profilePictureData?: {
    id: string;
    url: string;
    fileName: string;
    fileType: string;
    filePurpose: string;
    mimeType: string;
    fileSize: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  skills?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  specification?: {
    id: string;
    name: string;
    icon: string;
  };
  skillsData?: Array<{
    id: string;
    name: string;
    specificationId: string | null;
  }>;
  tagsData?: Array<{
    id: string;
    name: string;
    badgeUrl: string;
  }>;
}

export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}

// Transform function
const transformUser = (item: any): User => ({
  id: item.id,
  name: item.name,
  phone: item.phone,
  phoneVerification: item.phoneVerification,
  country: item.country,
  address: item.address,
  overview: item.overview,
  jobTitle: item.jobTitle,
  mode: item.mode,
  isVerifiedAsFreelancer: item.isVerifiedAsFreelancer,
  isVerifiedAsClient: item.isVerifiedAsClient,
  isSuspended: item.isSuspended,
  suspendedReason: item.suspendedReason,
  available: item.available,
  avgRating: item.avgRating,
  totalReviews: item.totalReviews,
  faceIdenbility: item.faceIdenbility,
  specificationId: item.specificationId,
  profilePicture: item.profilePicture,
  profilePictureData: item.profilePictureData,
  skills: item.skills,
  tags: item.tags,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  specification: item.specification,
  skillsData: item.skillsData,
  tagsData: item.tagsData,
});

export const userService = {
  list: async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    mode?: 'freelancer' | 'client';
    isVerifiedAsFreelancer?: boolean;
    isVerifiedAsClient?: boolean;
    specification?: string;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'avgRating';
    sortOrder?: 'asc' | 'desc';
  }): Promise<UserListResponse> => {
    const response = await apiClient.get(endPoints.users.getAll, {
      params: filters,
    });

    // API response structure: { success, message, data: [...], pagination: {...} }
    const backendData = response.data;
    const dataArray = backendData.data || [];
    const pagination = backendData.pagination || {
      page: 1,
      limit: 10,
      total: 0,
    };

    return {
      data: dataArray.map(transformUser),
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

  getById: async (id: string | number): Promise<User> => {
    const response = await apiClient.get(endPoints.users.getById(id));
    const data = response.data?.data || response.data;
    return transformUser(data);
  },

  verifyAsFreelancer: async (id: string | number): Promise<User> => {
    const response = await apiClient.patch(endPoints.users.verifyFreelancer(id));
    const data = response.data?.data || response.data;
    return transformUser(data);
  },

  verifyAsClient: async (id: string | number): Promise<User> => {
    const response = await apiClient.patch(endPoints.users.verifyClient(id));
    const data = response.data?.data || response.data;
    return transformUser(data);
  },

  unverifyAsFreelancer: async (id: string | number): Promise<User> => {
    const response = await apiClient.patch(endPoints.users.unverifyFreelancer(id));
    const data = response.data?.data || response.data;
    return transformUser(data);
  },

  unverifyAsClient: async (id: string | number): Promise<User> => {
    const response = await apiClient.patch(endPoints.users.unverifyClient(id));
    const data = response.data?.data || response.data;
    return transformUser(data);
  },
};

export default userService;
