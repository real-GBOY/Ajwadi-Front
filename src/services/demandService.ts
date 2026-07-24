/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface VerificationDemand {
  id: string;
  name: string;
  phone: string;
  mode: 'freelancer' | 'client';
  isCurrentlyUnderReview: boolean;
  isVerifiedAsFreelancer: boolean;
  isVerifiedAsClient: boolean;
  profilePictureFile?: {
    id: string;
    url: string;
    fileName: string;
  } | null;
  createdAt: string;
}

export interface TagAttachmentDemand {
  id: string;
  userId: string;
  tagId: string;
  fileUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  userData?: {
    id: string;
    name: string;
    phone: string;
  };
  tagData?: {
    id: string;
    name: string;
    badgeUrl: string;
  };
}

export interface VerificationDemandListResponse {
  data: VerificationDemand[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TagAttachmentDemandListResponse {
  data: TagAttachmentDemand[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CountResponse {
  count: number;
}

export interface UpdateTagAttachmentStatusRequest {
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
}

export const demandService = {
  verification: {
    list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      mode?: 'freelancer' | 'client';
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }): Promise<VerificationDemandListResponse> => {
      const response = await apiClient.get(endPoints.demands.verification.getAll, {
        params: filters,
      });

      const backendData = response.data;
      const dataArray = backendData.data || [];
      const pagination = backendData.pagination || {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      return {
        data: dataArray,
        pagination: {
          currentPage: Number(pagination.currentPage || 1),
          itemsPerPage: Number(pagination.itemsPerPage || 10),
          totalItems: Number(pagination.totalItems || 0),
          totalPages: Number(pagination.totalPages || 0),
          hasNextPage: Boolean(pagination.hasNextPage),
          hasPreviousPage: Boolean(pagination.hasPreviousPage),
        },
      };
    },

    getCount: async (filters?: {
      search?: string;
      mode?: 'freelancer' | 'client';
    }): Promise<number> => {
      const response = await apiClient.get(endPoints.demands.verification.getCount, {
        params: filters,
      });
      const data = response.data?.data || response.data;
      return Number(data?.count || 0);
    },
  },

  tagAttachments: {
    list: async (filters?: {
      page?: number;
      limit?: number;
      tagId?: string;
      userId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }): Promise<TagAttachmentDemandListResponse> => {
      const response = await apiClient.get(endPoints.demands.tagAttachments.getAll, {
        params: filters,
      });

      const backendData = response.data;
      const dataArray = backendData.data || [];
      const pagination = backendData.pagination || {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      return {
        data: dataArray,
        pagination: {
          currentPage: Number(pagination.currentPage || 1),
          itemsPerPage: Number(pagination.itemsPerPage || 10),
          totalItems: Number(pagination.totalItems || 0),
          totalPages: Number(pagination.totalPages || 0),
          hasNextPage: Boolean(pagination.hasNextPage),
          hasPreviousPage: Boolean(pagination.hasPreviousPage),
        },
      };
    },

    getCount: async (filters?: {
      tagId?: string;
      userId?: string;
    }): Promise<number> => {
      const response = await apiClient.get(endPoints.demands.tagAttachments.getCount, {
        params: filters,
      });
      const data = response.data?.data || response.data;
      return Number(data?.count || 0);
    },

    accept: async (id: string | number): Promise<TagAttachmentDemand> => {
      const response = await apiClient.patch(endPoints.demands.tagAttachments.updateStatus(id), {
        status: 'accepted',
      });
      return response.data?.data || response.data;
    },

    reject: async (
      id: string | number,
      payload: { rejectionReason: string }
    ): Promise<TagAttachmentDemand> => {
      const response = await apiClient.patch(endPoints.demands.tagAttachments.updateStatus(id), {
        status: 'rejected',
        rejectionReason: payload.rejectionReason,
      });
      return response.data?.data || response.data;
    },
  },
};

export default demandService;
