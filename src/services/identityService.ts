/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface IdentityFile {
  id: string;
  url: string;
  fileName: string;
  fileExtension: string;
  fileType: string;
  filePurpose: string;
  mimeType: string | null;
  fileSize: number | null;
  metadata: unknown;
}

export interface Identity {
  id: string;
  userId: string;
  isVerified: boolean;
  verifiedBy: string | null;
  images: string[];
  files?: IdentityFile[];
  createdAt: string;
  updatedAt: string;
}

export const identityService = {
  getByUserId: async (userId: string | number): Promise<Identity | null> => {
    try {
      const response = await apiClient.get(endPoints.users.getIdentity(userId));
      const data = response.data?.data || response.data;
      return {
        id: data.id,
        userId: data.userId,
        isVerified: data.isVerified,
        verifiedBy: data.verifiedBy,
        images: data.images || [],
        files: Array.isArray(data.files)
          ? data.files.map((file: any) => ({
              id: file.id,
              url: file.url,
              fileName: file.fileName,
              fileExtension: file.fileExtension,
              fileType: file.fileType,
              filePurpose: file.filePurpose,
              mimeType: file.mimeType ?? null,
              fileSize: file.fileSize ?? null,
              metadata: file.metadata ?? null,
            }))
          : undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export default identityService;
