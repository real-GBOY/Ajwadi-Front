/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface Complaint {
  id: string;
  userId: string;
  freelancerId: string;
  status: 'pending' | 'resolved';
  reason?: string;
  resonsummary?: string;
  read: boolean;
  readAt?: string | null;
  pinned: boolean;
  pinnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    profilePicture?: string;
  };
  freelancer?: {
    id: string;
    name: string;
    phone: string;
    profilePicture?: string;
  };
}

export interface ComplaintListResponse {
  success: boolean;
  message: string;
  data: Complaint[];
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface ComplaintResponse {
  success: boolean;
  message: string;
  data: Complaint;
}

export interface ComplaintCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

export interface CreateComplaintRequest {
  freelancerId: string;
  reason?: string;
  resonsummary?: string;
  userId?: string;
}

export interface UpdateComplaintRequest {
  status?: 'pending' | 'resolved';
  read?: boolean;
  pinned?: boolean;
  reason?: string;
  resonsummary?: string;
}

export interface ListComplaintsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'resolved';
  userId?: string;
  freelancerId?: string;
  read?: boolean;
  pinned?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

export interface ComplaintCountParams {
  status?: 'pending' | 'resolved';
  userId?: string;
  freelancerId?: string;
  read?: boolean;
  pinned?: boolean;
}

class ComplaintService {
  /**
   * Get all complaints with optional filters and pagination
   */
  async getAll(params?: ListComplaintsParams): Promise<ComplaintListResponse> {
    const response = await apiClient.get<ComplaintListResponse>(endPoints.complains.getAll, {
      params,
    });
    return response.data;
  }

  /**
   * Get a complaint by ID
   */
  async getById(id: string | number): Promise<ComplaintResponse> {
    const response = await apiClient.get<ComplaintResponse>(endPoints.complains.getById(id));
    return response.data;
  }

  /**
   * Create a new complaint
   */
  async create(data: CreateComplaintRequest): Promise<ComplaintResponse> {
    const response = await apiClient.post<ComplaintResponse>(endPoints.complains.create, data);
    return response.data;
  }

  /**
   * Update a complaint
   */
  async update(id: string | number, data: UpdateComplaintRequest): Promise<ComplaintResponse> {
    const response = await apiClient.put<ComplaintResponse>(endPoints.complains.update(id), data);
    return response.data;
  }

  /**
   * Delete a complaint
   */
  async delete(id: string | number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      endPoints.complains.delete(id)
    );
    return response.data;
  }

  /**
   * Mark complaint as read
   */
  async markAsRead(id: string | number): Promise<ComplaintResponse> {
    const response = await apiClient.patch<ComplaintResponse>(endPoints.complains.markAsRead(id));
    return response.data;
  }

  /**
   * Mark complaint as unread
   */
  async markAsUnread(id: string | number): Promise<ComplaintResponse> {
    const response = await apiClient.patch<ComplaintResponse>(endPoints.complains.markAsUnread(id));
    return response.data;
  }

  /**
   * Pin a complaint
   */
  async pin(id: string | number): Promise<ComplaintResponse> {
    const response = await apiClient.patch<ComplaintResponse>(endPoints.complains.pin(id));
    return response.data;
  }

  /**
   * Unpin a complaint
   */
  async unpin(id: string | number): Promise<ComplaintResponse> {
    const response = await apiClient.patch<ComplaintResponse>(endPoints.complains.unpin(id));
    return response.data;
  }

  /**
   * Resolve a complaint
   */
  async resolve(id: string | number): Promise<ComplaintResponse> {
    const response = await apiClient.patch<ComplaintResponse>(endPoints.complains.resolve(id));
    return response.data;
  }

  /**
   * Get complaints count with optional filters
   */
  async getCount(params?: ComplaintCountParams): Promise<ComplaintCountResponse> {
    const response = await apiClient.get<ComplaintCountResponse>(endPoints.complains.getCount, {
      params,
    });
    return response.data;
  }
}

export default new ComplaintService();
