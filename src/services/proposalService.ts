/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface Proposal {
  id: string;
  projectId: string;
  userId: string;
  description: string;
  budget: number | string;
  duration: number;
  status: string;
  FavoriteProposal?: boolean;
  filesData?: Array<{
    id: string;
    url: string;
    fileName: string;
    fileType: string;
  }>;
  projectData?: {
    id: string;
    title: string;
    description: string;
    specificationId: string;
    createdById: string;
    maxBudget: number | string;
    minBudget: number | string;
    duration: number;
    status: string;
    reviewedStatus?: string;
    createdAt: string;
    updatedAt: string;
  };
  freelancerData?: {
    id: string;
    name: string;
    phone: string;
    jobTitle?: string;
    profilePictureData?: {
      id: string;
      url: string;
      fileName: string;
    };
    avgRating?: number | string;
    totalReviews?: number;
    isVerifiedAsFreelancer?: boolean;
    available?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const proposalService = {
  getByUserId: async (userId: string | number): Promise<Proposal[]> => {
    const response = await apiClient.get(endPoints.proposals.getByUserId(userId));
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  getByProjectId: async (projectId: string | number): Promise<Proposal[]> => {
    const response = await apiClient.get(endPoints.proposals.getByProjectId(projectId));
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },
};

export default proposalService;
