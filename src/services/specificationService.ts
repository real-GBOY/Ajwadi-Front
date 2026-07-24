/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

// Types
export interface Specification {
   id: string | number;
   name: string;
   icon?: string;
   createdAt?: string;
   updatedAt?: string;
}

export interface SpecificationListResponse {
   data: Specification[];
   pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
   };
}

export interface CreateSpecificationRequest {
   name: string;
   icon?: string;
}

// Transform function
const transformSpecification = (item: any): Specification => ({
   id: item.id,
   name: item.name,
   icon: item.icon,
   createdAt: item.createdAt,
   updatedAt: item.updatedAt,
});

// Service functions
export const specificationService = {
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
   }): Promise<SpecificationListResponse> => {
      const response = await apiClient.get(endPoints.specifications.getAll, {
         params: filters,
      });

      // API response structure: { success, message, data: [...], pagination: {...} }
      const backendData = response.data;
      const pagination = backendData.pagination || {
         page: 1,
         limit: 10,
         totalItems: 0,
         totalPages: 1,
         hasNextPage: false,
         hasPreviousPage: false,
      };

      return {
         data: (backendData.data || []).map(transformSpecification),
         pagination: {
            page: Number(pagination.page || 1),
            limit: Number(pagination.limit || 10),
            totalItems: Number(pagination.totalItems || 0),
            totalPages: Number(pagination.totalPages || 1),
            hasNextPage: pagination.hasNextPage || false,
            hasPreviousPage: pagination.hasPreviousPage || false,
         },
      };
   },

   getById: async (id: string | number): Promise<Specification> => {
      const response = await apiClient.get(endPoints.specifications.getById(id));
      // API might return { success, message, data: {...} } or just the data object
      const data = response.data.data || response.data;
      return transformSpecification(data);
   },

   create: async (payload: CreateSpecificationRequest): Promise<Specification> => {
      const apiPayload = {
         name: payload.name,
         icon: payload.icon,
      };

      const response = await apiClient.post(
         endPoints.specifications.create,
         apiPayload
      );
      // API might return { success, message, data: {...} } or just the data object
      const data = response.data.data || response.data;
      return transformSpecification(data);
   },

   update: async (
      id: string | number,
      payload: Partial<CreateSpecificationRequest>
   ): Promise<Specification> => {
      const apiPayload: any = {};
      if (payload.name !== undefined) {
         apiPayload.name = payload.name;
      }
      if (payload.icon !== undefined) {
         apiPayload.icon = payload.icon;
      }

      const response = await apiClient.put(
         endPoints.specifications.update(id),
         apiPayload
      );
      // API might return { success, message, data: {...} } or just the data object
      const data = response.data.data || response.data;
      return transformSpecification(data);
   },

   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.specifications.delete(id));
   },
};
