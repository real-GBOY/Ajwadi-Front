/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';
import { experienceDemandService } from './experienceDemandService';
import type { FilePurpose } from './s3Service';
import axios from 'axios';
import i18n from '@/config/i18n';

export interface GenerateAndUploadCertificateParams {
  userName: string;
  experienceName?: string;
  experienceDemandId: string;
  sealImage?: string; // Base64 or URL
  signatureImage?: string; // Base64 or URL
  issueDate?: string;
  organizationName?: string;
  signerName?: string;
}

/**
 * Generate experience certificate PDF from DOM element and upload to S3, then attach to experience demand
 */
export async function generateAndUploadCertificate(
  params: GenerateAndUploadCertificateParams
): Promise<{ fileId: string; url: string }> {
  try {
    // Find the certificate element in the DOM - use the wrapper to get the full certificate
    const certificateWrapper = document.querySelector('.certificate-wrapper') as HTMLElement;
    if (!certificateWrapper) {
      throw new Error('Certificate element not found in DOM. Please ensure the certificate modal is open.');
    }

    // Wait for fonts to load (especially Google Fonts)
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    
    // Wait a bit more to ensure all images are loaded
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Calculate optimal scale to fit on A4 landscape (297mm x 210mm)
    // A4 landscape in pixels at 96 DPI: ~1123px x 794px
    // Leave small margins: ~1100px x 770px usable area
    const elementWidth = certificateWrapper.offsetWidth || certificateWrapper.scrollWidth;
    const elementHeight = certificateWrapper.offsetHeight || certificateWrapper.scrollHeight;
    
    const maxWidth = 1100; // pixels
    const maxHeight = 770; // pixels
    
    const scaleX = maxWidth / elementWidth;
    const scaleY = maxHeight / elementHeight;
    const optimalScale = Math.min(scaleX, scaleY, 2); // Cap at 2x for quality

    // Generate PDF from the DOM element using html2pdf
    const html2pdf = (await import('html2pdf.js')).default;
    const fileName = `experience-certificate-${params.experienceDemandId}-${Date.now()}.pdf`;
    
    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.95 },
      html2canvas: { 
        scale: optimalScale,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        width: elementWidth,
        height: elementHeight,
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: [297, 210] as [number, number], 
        orientation: 'landscape' as const,
        compress: true,
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        avoid: ['.certificate-wrapper', '.certificate-container', '.certificate-content'],
      },
    };

    // Generate PDF blob - this should fit on one page
    const pdfBlob = await html2pdf()
      .set(opt)
      .from(certificateWrapper)
      .outputPdf('blob');
    
    // Create File object from Blob
    const certificateFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // Step 1: Get upload URL from backend
    try {
      // Ensure fileName has .pdf extension
      const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      
      const uploadUrlResponse = await apiClient.post(endPoints.s3.getUploadUrl, {
        fileName: finalFileName,
        fileType: 'document',
        filePurpose: 'certificate' as FilePurpose,
      });

      // Handle different response structures
      const responseData = uploadUrlResponse.data?.data || uploadUrlResponse.data;
      if (!responseData) {
        throw new Error('Invalid response structure from upload URL endpoint');
      }

      const { uploadUrl, file: fileData } = responseData;

      if (!uploadUrl || !fileData) {
        throw new Error('Missing uploadUrl or file data in response');
      }

      // Step 2: Upload the file to S3
      await axios.put(uploadUrl, certificateFile, {
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      // Step 3: Update experience demand with the certificate file
      await experienceDemandService.update(params.experienceDemandId, {
        ExFile: fileData.id,
      });

      // Return file ID and URL
      return {
        fileId: fileData.id,
        url: fileData.url,
      };
    } catch (uploadError) {
      // Enhanced error logging for S3 upload
      if (axios.isAxiosError(uploadError) && uploadError.response) {
        console.error('S3 Upload Error Response:', {
          status: uploadError.response.status,
          statusText: uploadError.response.statusText,
          data: uploadError.response.data,
          request: {
            url: uploadError.config?.url,
            method: uploadError.config?.method,
            data: uploadError.config?.data,
          },
        });
        throw new Error(
          (uploadError.response.data as { message?: string })?.message || 
          `${i18n.t('apiErrors.uploadLinkFailed', 'فشل في الحصول على رابط الرفع: ')}${uploadError.response.status} ${uploadError.response.statusText}`
        );
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('Error generating and uploading certificate:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(i18n.t('apiErrors.certGenFailed', 'فشل في إنشاء وتحميل الشهادة'));
  }
}
