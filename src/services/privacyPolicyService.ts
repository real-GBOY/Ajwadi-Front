/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

// Types - Based on API DTO from privacy-policy-api.http
export interface PrivacyPolicy {
   id: string | number;
   title: string;
   content: string;
   language: 'en' | 'ar' | 'fr' | 'es';
   createdAt?: string;
   updatedAt?: string;
}

export interface PrivacyPolicyListResponse {
   data: PrivacyPolicy[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
   };
}

export interface CreatePrivacyPolicyRequest {
   title: string;
   content: string;
   language?: 'en' | 'ar' | 'fr' | 'es';
}

// Transform function - API returns: { id, title, content, language, createdAt, updatedAt }
const transformPrivacyPolicy = (item: any): PrivacyPolicy => ({
   id: item.id,
   title: item.title,
   content: item.content,
   language: item.language || 'en',
   createdAt: item.createdAt,
   updatedAt: item.updatedAt,
});

// Service functions
export const privacyPolicyService = {
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
   }): Promise<PrivacyPolicyListResponse> => {
      const response = await apiClient.get(endPoints.privacyPolicy.getAll, {
         params: filters,
      });

      const backendData = response.data;
      const pagination = backendData.pagination || {
         page: 1,
         limit: 10,
         total: 0,
      };

      return {
         data: (backendData.data || []).map(transformPrivacyPolicy),
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            total_pages: Math.ceil(
               (pagination.total || 0) / (pagination.limit || 10)
            ),
         },
      };
   },

   getById: async (id: string | number): Promise<PrivacyPolicy> => {
      const response = await apiClient.get(endPoints.privacyPolicy.getById(id));
      const data = response.data?.data || response.data;
      return transformPrivacyPolicy(data);
   },

   // POST - Create - API expects: { title: string, content: string, language?: "en" | "ar" | "fr" | "es" }
   create: async (
      payload: CreatePrivacyPolicyRequest
   ): Promise<PrivacyPolicy> => {
      const apiPayload: any = {
         title: payload.title,
         content: payload.content,
      };
      if (payload.language) {
         apiPayload.language = payload.language;
      }

      const response = await apiClient.post(
         endPoints.privacyPolicy.create,
         apiPayload
      );
      const data = response.data?.data || response.data;
      return transformPrivacyPolicy(data);
   },

   // PUT/PATCH - Update - API expects: { title?: string, content?: string, language?: string }
   update: async (
      id: string | number,
      payload: Partial<CreatePrivacyPolicyRequest>
   ): Promise<PrivacyPolicy> => {
      const apiPayload: any = {};
      if (payload.title !== undefined) {
         apiPayload.title = payload.title;
      }
      if (payload.content !== undefined) {
         apiPayload.content = payload.content;
      }
      if (payload.language !== undefined) {
         apiPayload.language = payload.language;
      }

      const response = await apiClient.put(
         endPoints.privacyPolicy.update(id),
         apiPayload
      );
      const data = response.data?.data || response.data;
      return transformPrivacyPolicy(data);
   },

   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.privacyPolicy.delete(id));
   },
};
