/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

// Types - Based on API DTO from skills-api.http
export interface Skill {
   id: string | number;
   name: string;
   specificationId: string | null;
   createdAt?: string;
   updatedAt?: string;
}

export interface SkillListResponse {
   data: Skill[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
   };
}

export interface CreateSkillRequest {
   name: string;
   specificationId?: string | null;
}

// Transform function - API returns: { id, name, specificationId, createdAt, updatedAt }
const transformSkill = (item: any): Skill => ({
   id: item.id,
   name: item.name,
   specificationId: item.specificationId ?? null,
   createdAt: item.createdAt,
   updatedAt: item.updatedAt,
});

// Service functions
export const skillService = {
   // GET - List
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
   }): Promise<SkillListResponse> => {
      const response = await apiClient.get(endPoints.skills.getAll, {
         params: filters,
      });

      const backendData = response.data;
      const pagination = backendData.pagination || {
         page: 1,
         limit: 10,
         total: 0,
      };

      return {
         data: (backendData.data || []).map(transformSkill),
         pagination: {
            page: Number(pagination.page || 1),
            limit: Number(pagination.limit || 10),
            total: Number(pagination.totalItems || pagination.total || 0),
            total_pages: Number(pagination.totalPages || Math.ceil(
               (pagination.totalItems || pagination.total || 0) / (pagination.limit || 10)
            )),
         },
      };
   },

   // GET - Get by ID
   getById: async (id: string | number): Promise<Skill> => {
      const response = await apiClient.get(endPoints.skills.getById(id));
      const data = response.data?.data || response.data;
      return transformSkill(data);
   },

   // POST - Create - API expects: { name: string, specificationId?: string | null }
   create: async (payload: CreateSkillRequest): Promise<Skill> => {
      const apiPayload: any = {
         name: payload.name,
      };
      if (payload.specificationId !== undefined) {
         apiPayload.specificationId = payload.specificationId;
      }

      const response = await apiClient.post(
         endPoints.skills.create,
         apiPayload
      );
      const data = response.data?.data || response.data;
      return transformSkill(data);
   },

   // PUT/PATCH - Update - API expects: { name?: string, specificationId?: string | null }
   update: async (
      id: string | number,
      payload: Partial<CreateSkillRequest>
   ): Promise<Skill> => {
      const apiPayload: any = {};
      if (payload.name !== undefined) {
         apiPayload.name = payload.name;
      }
      if (payload.specificationId !== undefined) {
         apiPayload.specificationId = payload.specificationId;
      }

      const response = await apiClient.put(
         endPoints.skills.update(id),
         apiPayload
      );
      const data = response.data?.data || response.data;
      return transformSkill(data);
   },

   // DELETE - Delete
   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.skills.delete(id));
   },
};
