/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';
import axios from 'axios';
import i18n from '@/config/i18n';

// Types
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';
export type FilePurpose = 'profile' | 'identity' | 'project' | 'projectfiles' | 'proposal' | 'message' | 'portfolio' | 'tag' | 'certificate' | 'other';

export interface UploadUrlRequest {
  fileName: string;
  fileType: FileType;
  filePurpose: FilePurpose;
}

export interface UploadUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    file: {
      id: string;
      fileName: string;
      fileType: string;
      filePurpose: string;
      url: string;
    };
    uploadToken: string;
  };
}

export interface UploadedFileInfo {
  fileId: string;
  token: string;
  purpose: string;
  fileName: string;
}

/**
 * Get file type from file extension
 */
const getFileTypeFromExtension = (fileName: string): FileType => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
    return 'image';
  }
  
  // Document types
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(extension)) {
    return 'document';
  }
  
  // Video types
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
    return 'video';
  }
  
  // Audio types
  if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(extension)) {
    return 'audio';
  }
  
  return 'other';
};

/**
 * Get upload URL from backend
 */
const getUploadUrl = async (request: UploadUrlRequest): Promise<UploadUrlResponse> => {
  const response = await apiClient.post<UploadUrlResponse>(
    endPoints.s3.getUploadUrl,
    request
  );
  return response.data;
};

/**
 * Upload file to S3 using signed URL
 */
const uploadFileToS3 = async (
  uploadUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': contentType,
    },
  });
};

/**
 * Main function to upload a file to S3
 * Follows the two-step process:
 * 1. Get signed upload URL from backend
 * 2. Upload file directly to S3
 * 
 * @param file - File object from file input
 * @param fileName - Original file name
 * @param filePurpose - Purpose of the file (e.g., 'tag', 'profile')
 * @param fileTypeHint - Optional file type hint (auto-detected if not provided)
 * @returns UploadedFileInfo with fileId, token, and purpose
 */
export const uploadFile = async (
  file: File,
  fileName: string,
  filePurpose: FilePurpose,
  fileTypeHint?: FileType
): Promise<UploadedFileInfo> => {
  try {
    // Step 1: Get upload URL from backend
    const fileType = fileTypeHint || getFileTypeFromExtension(fileName);
    
    const uploadUrlResponse = await getUploadUrl({
      fileName,
      fileType,
      filePurpose,
    });

    const { uploadUrl, file: fileData, uploadToken } = uploadUrlResponse.data;

    // Step 2: Upload file to S3
    await uploadFileToS3(uploadUrl, file, file.type || 'application/octet-stream');

    // Return file info for use in API requests
    return {
      fileId: fileData.id,
      token: uploadToken,
      purpose: filePurpose,
      fileName: fileData.fileName,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        throw new Error(i18n.t('apiErrors.unauthorized', 'غير مصرح - يرجى تسجيل الدخول'));
      }
      if (status === 400) {
        throw new Error(i18n.t('apiErrors.badRequest', 'طلب غير صحيح - يرجى التحقق من البيانات'));
      }
      if (status && status >= 500) {
        throw new Error(i18n.t('apiErrors.serverError', 'خطأ في الخادم - يرجى المحاولة لاحقاً'));
      }
      throw new Error(error.response?.data?.message || i18n.t('apiErrors.uploadFailed', 'فشل في رفع الملف'));
    }
    throw new Error(i18n.t('apiErrors.unexpectedUploadError', 'حدث خطأ غير متوقع أثناء رفع الملف'));
  }
};
