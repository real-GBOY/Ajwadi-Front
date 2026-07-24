/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

// Types - Based on API DTO from tags-api.http
export interface Tag {
   id: string | number;
   name: string;
   badgeUrl: string;
   status?: 'pending' | 'accepted' | 'rejected';
   cancellationReason?: string;
   createdAt?: string;
   updatedAt?: string;
}

export interface TagListResponse {
   data: Tag[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
   };
}

export interface CreateTagRequest {
   name: string;
   badgeUrl?: Array<{
      fileId: string;
      token: string;
      purpose: string;
   }>;
}

// Transform function - API returns: { id, name, badgeUrl, status, cancellationReason, createdAt, updatedAt }
const transformTag = (item: any): Tag => ({
   id: item.id,
   name: item.name,
   badgeUrl: item.badgeUrl || '',
   status: item.status,
   cancellationReason: item.cancellationReason || '',
   createdAt: item.createdAt,
   updatedAt: item.updatedAt,
});

// Service functions
export const tagService = {
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
   }): Promise<TagListResponse> => {
      const response = await apiClient.get(endPoints.tags.getAll, {
         params: filters,
      });

      // API response structure: { success, message, data: { data: [], pagination: {} } }
      const backendData = response.data?.data || response.data;
      const paginationData = backendData?.pagination || response.data?.pagination || {
         currentPage: 1,
         totalPages: 1,
         totalItems: 0,
         itemsPerPage: 10,
      };

      return {
         data: (backendData?.data || backendData || []).map(transformTag),
         pagination: {
            page: Number(paginationData.currentPage || paginationData.page || 1),
            limit: Number(paginationData.itemsPerPage || paginationData.limit || 10),
            total: Number(paginationData.totalItems || paginationData.total || 0),
            total_pages: Number(paginationData.totalPages || Math.ceil(
               (paginationData.totalItems || paginationData.total || 0) / (paginationData.itemsPerPage || paginationData.limit || 10)
            )),
         },
      };
   },

   getById: async (id: string | number): Promise<Tag> => {
      const response = await apiClient.get(endPoints.tags.getById(id));
      const data = response.data?.data || response.data;
      return transformTag(data);
   },

   // POST - Create - API expects: { name: string, badgeUrl?: array }
   create: async (payload: CreateTagRequest): Promise<Tag> => {
      const apiPayload: any = {
         name: payload.name,
      };
      if (payload.badgeUrl && payload.badgeUrl.length > 0) {
         apiPayload.badgeUrl = payload.badgeUrl;
      }

      const response = await apiClient.post(endPoints.tags.create, apiPayload);
      const data = response.data?.data || response.data;
      return transformTag(data);
   },

   // PUT/PATCH - Update - API expects: { name?: string, badgeUrl?: array }
   update: async (
      id: string | number,
      payload: Partial<CreateTagRequest>
   ): Promise<Tag> => {
      const apiPayload: any = {};
      if (payload.name !== undefined) {
         apiPayload.name = payload.name;
      }
      if (payload.badgeUrl !== undefined) {
         apiPayload.badgeUrl = payload.badgeUrl;
      }

      const response = await apiClient.put(endPoints.tags.update(id), apiPayload);
      const data = response.data?.data || response.data;
      return transformTag(data);
   },

   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.tags.delete(id));
   },
};
