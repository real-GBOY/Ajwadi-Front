/** @format */

import jsPDF from 'jspdf';

export interface CertificateData {
  userName: string;
  experienceName?: string; // Name/title of the experience
  sealImage?: string; // Base64 or URL for seal image
  signatureImage?: string; // Base64 or URL for signature image
  issueDate?: string; // Optional issue date
  organizationName?: string; // Organization name for footer
  signerName?: string; // Signer name for footer
}

/**
 * Convert pixels to mm (assuming 96 DPI: 1px = 0.264583mm)
 */
const pxToMm = (px: number): number => px * 0.264583;

/**
 * Generate a pixel-perfect experience certificate PDF
 * Based on the provided HTML/CSS design
 */
export function generateExperienceCertificate(data: CertificateData): jsPDF {
  // Create PDF with dimensions matching the design (800px x 600px ≈ 211.67mm x 158.75mm)
  // Using A4 landscape (297mm x 210mm) and centering the certificate
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 210], // A4 landscape
  });

  const pageWidth = 297; // A4 landscape width
  const pageHeight = 210; // A4 landscape height

  // Certificate dimensions in mm (from 800px x 600px)
  const certWidth = pxToMm(800); // ≈ 211.67mm
  const certHeight = pxToMm(600); // ≈ 158.75mm

  // Center the certificate on the page
  const certX = (pageWidth - certWidth) / 2;
  const certY = (pageHeight - certHeight) / 2;

  // Colors from CSS
  const bgColor = [97, 133, 151]; // #618597
  const white = [255, 255, 255];
  const textColor = [51, 51, 51]; // #333
  const borderColor = [225, 229, 240]; // #E1E5F0

  // Helper function to draw filled rectangle
  const drawRect = (x: number, y: number, w: number, h: number, color: number[]) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, w, h, 'F');
  };

  // Helper function to draw border rectangle
  const drawBorder = (x: number, y: number, w: number, h: number, color: number[], lineWidth: number = 1) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(lineWidth);
    doc.rect(x, y, w, h);
  };

  // Helper function to draw text
  const drawText = (
    text: string,
    x: number,
    y: number,
    options: {
      fontSize?: number;
      color?: number[];
      align?: 'left' | 'center' | 'right';
      font?: 'normal' | 'bold' | 'italic' | 'bolditalic';
      fontFamily?: 'helvetica' | 'times' | 'courier';
    } = {}
  ) => {
    const {
      fontSize = 12,
      color = textColor,
      align = 'left',
      font = 'normal',
      fontFamily = 'helvetica',
    } = options;
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(fontSize);
    doc.setFont(fontFamily, font);
    doc.text(text, x, y, { align });
  };

  // Helper function to draw underline
  const drawUnderline = (x: number, y: number, width: number, color: number[] = textColor) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + width, y);
  };

  // 1. Background - #618597
  drawRect(certX, certY, certWidth, certHeight, bgColor);

  // 2. Outer border - 794px x 594px, white 2px border
  const outerBorderWidth = pxToMm(794);
  const outerBorderHeight = pxToMm(594);
  const outerBorderX = certX + (certWidth - outerBorderWidth) / 2;
  const outerBorderY = certY + (certHeight - outerBorderHeight) / 2;
  drawBorder(outerBorderX, outerBorderY, outerBorderWidth, outerBorderHeight, white, 2);

  // 3. Inner border - 730px x 530px, white 2px border
  const innerBorderWidth = pxToMm(730);
  const innerBorderHeight = pxToMm(530);
  const innerBorderX = certX + (certWidth - innerBorderWidth) / 2;
  const innerBorderY = certY + (certHeight - innerBorderHeight) / 2;
  drawBorder(innerBorderX, innerBorderY, innerBorderWidth, innerBorderHeight, white, 2);

  // 4. Certificate border - 720px x 520px, white background, 1px border #E1E5F0
  const certBorderWidth = pxToMm(720);
  const certBorderHeight = pxToMm(520);
  const certBorderX = certX + (certWidth - certBorderWidth) / 2;
  const certBorderY = certY + (certHeight - certBorderHeight) / 2;

  // White background for certificate
  drawRect(certBorderX, certBorderY, certBorderWidth, certBorderHeight, white);
  drawBorder(certBorderX, certBorderY, certBorderWidth, certBorderHeight, borderColor, 1);

  // Certificate content area
  const contentPadding = pxToMm(20);
  const contentX = certBorderX + contentPadding;
  const contentY = certBorderY + contentPadding;
  const contentWidth = certBorderWidth - contentPadding * 2;

  // 5. Title - "Experience Certificate" (cursive style, 48px)
  const titleY = contentY + pxToMm(40);
  drawText('Experience Certificate', contentX + contentWidth / 2, titleY, {
    fontSize: pxToMm(48),
    color: textColor,
    align: 'center',
    font: 'italic',
    fontFamily: 'times',
  });

  // 6. Certificate block area (centered, 650px wide)
  const blockWidth = pxToMm(650);
  const blockX = contentX + (contentWidth - blockWidth) / 2;
  const blockStartY = contentY + pxToMm(50);

  // 7. Name - Underlined, bold, 30px, centered
  const nameY = blockStartY + pxToMm(30);
  const nameWidth = pxToMm(520); // 8/12 of 650px (col-xs-8)
  const nameX = blockX + (blockWidth - nameWidth) / 2;
  
  drawText(data.userName, nameX + nameWidth / 2, nameY, {
    fontSize: pxToMm(30),
    color: textColor,
    align: 'center',
    font: 'bold',
    fontFamily: 'helvetica',
  });
  
  // Draw underline under name
  const underlineWidth = nameWidth * 0.8; // Slightly shorter than text
  const underlineX = nameX + (nameWidth - underlineWidth) / 2;
  drawUnderline(underlineX, nameY + pxToMm(5), underlineWidth);

  // 8. "has earned" text (cursive, 20px)
  const earnedY = nameY + pxToMm(25);
  drawText('has earned', nameX + nameWidth / 2, earnedY, {
    fontSize: pxToMm(20),
    color: textColor,
    align: 'center',
    font: 'italic',
    fontFamily: 'times',
  });

  // 9. Experience details (bold sans, 15px) - if experienceName is provided
  if (data.experienceName) {
    const detailsY = earnedY + pxToMm(15);
    drawText(data.experienceName, nameX + nameWidth / 2, detailsY, {
      fontSize: pxToMm(15),
      color: textColor,
      align: 'center',
      font: 'bold',
      fontFamily: 'helvetica',
    });
  }

  // 10. "while completing the training course entitled" (cursive, 20px)
  const courseIntroY = (data.experienceName ? earnedY + pxToMm(35) : earnedY + pxToMm(20));
  drawText('while completing the training course entitled', nameX + nameWidth / 2, courseIntroY, {
    fontSize: pxToMm(20),
    color: textColor,
    align: 'center',
    font: 'italic',
    fontFamily: 'times',
  });

  // 11. Experience name/title (bold sans, 15px, underlined)
  const courseTitleY = courseIntroY + pxToMm(20);
  const courseTitleText = data.experienceName || 'Experience Certificate';
  drawText(courseTitleText, nameX + nameWidth / 2, courseTitleY, {
    fontSize: pxToMm(15),
    color: textColor,
    align: 'center',
    font: 'bold',
    fontFamily: 'helvetica',
  });
  
  // Draw underline under course title
  const courseUnderlineWidth = nameWidth * 0.9;
  const courseUnderlineX = nameX + (nameWidth - courseUnderlineWidth) / 2;
  drawUnderline(courseUnderlineX, courseTitleY + pxToMm(5), courseUnderlineWidth);

  // 12. Footer (650px wide, 100px high, positioned at bottom)
  const footerWidth = pxToMm(650);
  const footerHeight = pxToMm(100);
  const footerX = contentX + (contentWidth - footerWidth) / 2;
  const footerY = certBorderY + certBorderHeight - footerHeight - pxToMm(85);

  // Footer columns (4-4-4 layout)
  const colWidth = footerWidth / 3;

  // Left column: Organization name, underline space, signer name
  const leftColX = footerX;
  const leftColY = footerY;
  
  if (data.organizationName) {
    drawText(data.organizationName, leftColX + colWidth / 2, leftColY, {
      fontSize: pxToMm(12),
      color: textColor,
      align: 'center',
      fontFamily: 'helvetica',
    });
  }
  
  // Underline space (40px height)
  const underlineSpaceY = leftColY + pxToMm(15);
  drawUnderline(leftColX + colWidth * 0.1, underlineSpaceY, colWidth * 0.8);
  
  if (data.signerName) {
    drawText(data.signerName, leftColX + colWidth / 2, underlineSpaceY + pxToMm(20), {
      fontSize: pxToMm(12),
      color: textColor,
      align: 'center',
      font: 'bold',
      fontFamily: 'helvetica',
    });
  }

  // Middle column: Empty (for seal/signature placement)
  const middleColX = footerX + colWidth;
  const sealSignatureY = footerY + pxToMm(10);
  const sealSignatureSize = pxToMm(30);

  // Seal (left side of middle, or use left column if no organization)
  const sealX = data.organizationName ? middleColX + colWidth * 0.1 : leftColX + colWidth * 0.1;
  const sealY = sealSignatureY;

  if (data.sealImage) {
    try {
      if (data.sealImage.startsWith('data:')) {
        doc.addImage(data.sealImage, 'PNG', sealX, sealY, sealSignatureSize, sealSignatureSize);
      } else {
        // Placeholder if URL (would need to fetch first)
        drawRect(sealX, sealY, sealSignatureSize, sealSignatureSize, [200, 200, 200]);
        drawText('Seal', sealX + sealSignatureSize / 2, sealY + sealSignatureSize / 2, {
          fontSize: pxToMm(10),
          color: textColor,
          align: 'center',
        });
      }
    } catch (error) {
      console.error('Error adding seal image:', error);
      drawRect(sealX, sealY, sealSignatureSize, sealSignatureSize, [200, 200, 200]);
    }
  }

  // Signature (right side of middle, or use right column)
  const signatureX = data.organizationName 
    ? middleColX + colWidth * 0.6 
    : footerX + colWidth * 2 + colWidth * 0.1;
  const signatureY = sealSignatureY;
  const signatureHeight = sealSignatureSize * 0.5;

  if (data.signatureImage) {
    try {
      if (data.signatureImage.startsWith('data:')) {
        doc.addImage(data.signatureImage, 'PNG', signatureX, signatureY, sealSignatureSize, signatureHeight);
      } else {
        drawRect(signatureX, signatureY, sealSignatureSize, signatureHeight, [200, 200, 200]);
        drawText('Signature', signatureX + sealSignatureSize / 2, signatureY + signatureHeight / 2, {
          fontSize: pxToMm(10),
          color: textColor,
          align: 'center',
        });
      }
    } catch (error) {
      console.error('Error adding signature image:', error);
      drawRect(signatureX, signatureY, sealSignatureSize, signatureHeight, [200, 200, 200]);
    }
  }

  // Right column: Date Completed, underline space, date
  const rightColX = footerX + colWidth * 2;
  const rightColY = footerY;
  
  drawText('Date Completed', rightColX + colWidth / 2, rightColY, {
    fontSize: pxToMm(12),
    color: textColor,
    align: 'center',
    fontFamily: 'helvetica',
  });
  
  // Underline space
  const dateUnderlineY = rightColY + pxToMm(15);
  drawUnderline(rightColX + colWidth * 0.1, dateUnderlineY, colWidth * 0.8);
  
  if (data.issueDate) {
    drawText(data.issueDate, rightColX + colWidth / 2, dateUnderlineY + pxToMm(20), {
      fontSize: pxToMm(12),
      color: textColor,
      align: 'center',
      font: 'bold',
      fontFamily: 'helvetica',
    });
  }

  return doc;
}

/**
 * Generate certificate PDF and return as Blob
 */
export async function generateCertificateBlob(data: CertificateData): Promise<Blob> {
  const doc = generateExperienceCertificate(data);
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

/**
 * Generate certificate PDF and return as File
 */
export async function generateCertificateFile(
  data: CertificateData,
  fileName: string = 'experience-certificate.pdf'
): Promise<File> {
  const blob = await generateCertificateBlob(data);
  return new File([blob], fileName, { type: 'application/pdf' });
}
