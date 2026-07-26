/** @format */

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface CertificateData {
  userName: string;
  sealImage?: string;
  signatureImage?: string;
  issueDate?: string;
  certificateNumber?: string;
  description?: string;
  achievements?: string[];
  organizationName?: string;
  organizationLogo?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData;
  onPrint?: () => void | Promise<void>;
  isGenerating?: boolean;
}

export default function CertificateModal({
  isOpen,
  onClose,
  data,
  onPrint,
  isGenerating = false,
}: CertificateModalProps) {
  const { t, i18n } = useTranslation();
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (onPrint) {
      await onPrint();
    } else {
      window.print();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('certificate.title', 'شهادة خبرة')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              {isGenerating ? t('certificate.generating', 'جاري الإنشاء...') : t('certificate.generatePdf', 'إنشاء PDF ورفع')}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
          <div
            ref={certificateRef}
            className="certificate-wrapper"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Certificate Container */}
            <div className="certificate-container">
              {/* Decorative Borders */}
              <div className="certificate-outer-border"></div>
              <div className="certificate-inner-border"></div>
              
              {/* Main Certificate Content */}
              <div className="certificate-content">
                {/* Header Section */}
                <div className="certificate-header">
                  <h1 className="certificate-title">{t('certificate.title', 'شهادة خبرة')}</h1>
                </div>

                {/* Body Section */}
                <div className="certificate-body">
                  {/* Name Section */}
                  <div className="certificate-name-section">
                    <div className="certificate-name-underline">
                      <span className="certificate-name-text">{data.userName}</span>
                    </div>
                  </div>

                  {/* Achievements Section */}
                  {data.achievements && data.achievements.length > 0 && (
                    <div className="certificate-achievements">
                      <p className="certificate-earned-text">{t('certificate.earned', 'قد حصل على')}</p>
                      <p className="certificate-achievements-text">
                        {data.achievements.map((ach, idx) => (
                          <span key={idx}>
                            {ach}
                            {idx < data.achievements!.length - 1 ? (i18n.language === 'ar' ? '، ' : ', ') : ''}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}

                  {/* Description Section */}
                  {data.description && (
                    <>
                      <div className="certificate-description-intro">
                        <p className="certificate-earned-text">{t('certificate.afterCompleting', 'بعد إتمام فترة الخبرة في')}</p>
                      </div>
                      <div className="certificate-description-underline">
                        <p className="certificate-description-text">{data.description}</p>
                      </div>
                    </>
                  )}

                  {/* Certificate Number */}
                  {data.certificateNumber && (
                    <div className="certificate-number">
                      <span className="certificate-number-text">{t('certificate.certNumber', 'رقم الشهادة')}: {data.certificateNumber}</span>
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div className="certificate-footer">
                  <div className="certificate-footer-left">
                    <p className="certificate-org-name">{data.organizationName || t('certificate.orgNameDefault', 'أجودي')}</p>
                    <div className="certificate-signature-line"></div>
                    {data.sealImage ? (
                      <div className="certificate-seal">
                        <img 
                          src={data.sealImage} 
                          alt={t('certificate.officialSeal', 'ختم')} 
                          className="certificate-seal-image"
                        />
                      </div>
                    ) : (
                      <p className="certificate-seal-text">{t('certificate.officialSeal', 'الختم الرسمي')}</p>
                    )}
                  </div>

                  <div className="certificate-footer-right">
                    <p className="certificate-date-label">{t('certificate.issueDate', 'تاريخ الإصدار')}</p>
                    <div className="certificate-signature-line"></div>
                    <p className="certificate-date-value">
                      {data.issueDate || new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {data.signatureImage && (
                      <div className="certificate-signature">
                        <img 
                          src={data.signatureImage} 
                          alt={t('certificate.officialSignature', 'توقيع')} 
                          className="certificate-signature-image"
                        />
                        <p className="certificate-signature-label">{t('certificate.officialSignature', 'التوقيع الرسمي')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Styles */}
          <style>{`
            @import url('https://fonts.googleapis.com/css?family=Open+Sans|Pinyon+Script|Rochester');

            .certificate-wrapper {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .certificate-container {
              position: relative;
              width: 100%;
              aspect-ratio: 4 / 3;
              background: linear-gradient(135deg, #618597 0%, #4a6b7a 100%);
              padding: 20px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-after: avoid;
              page-break-before: avoid;
            }

            .certificate-outer-border {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: calc(100% - 20px);
              height: calc(100% - 20px);
              border: 3px solid #ffffff;
              border-radius: 4px;
              box-sizing: border-box;
            }

            .certificate-inner-border {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: calc(100% - 60px);
              height: calc(100% - 60px);
              border: 2px solid #ffffff;
              border-radius: 2px;
              box-sizing: border-box;
            }

            .certificate-content {
              position: relative;
              width: calc(100% - 80px);
              height: calc(100% - 80px);
              background: #ffffff;
              margin: 40px auto;
              padding: 30px 40px;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              border: 1px solid #e1e5f0;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            /* Header */
            .certificate-header {
              text-align: center;
              margin-bottom: 20px;
              padding-top: 10px;
            }

            .certificate-title {
              font-family: 'Pinyon Script', cursive;
              font-size: clamp(36px, 5vw, 52px);
              font-weight: normal;
              color: #333;
              margin: 0;
              line-height: 1.2;
            }

            /* Body */
            .certificate-body {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 15px;
              padding: 10px 0;
            }

            /* Name Section */
            .certificate-name-section {
              text-align: center;
              margin: 15px 0;
            }

            .certificate-name-underline {
              border-bottom: 2px solid #777;
              padding-bottom: 8px;
              margin: 0 auto;
              display: inline-block;
              min-width: 60%;
            }

            .certificate-name-text {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(24px, 3.5vw, 32px);
              font-weight: bold;
              color: #333;
              display: block;
            }

            /* Achievements */
            .certificate-achievements {
              text-align: center;
              margin: 15px 0;
            }

            .certificate-earned-text {
              font-family: 'Pinyon Script', cursive;
              font-size: clamp(18px, 2.5vw, 22px);
              color: #555;
              margin: 8px 0;
              display: block;
            }

            .certificate-achievements-text {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(14px, 2vw, 16px);
              font-weight: bold;
              color: #333;
              margin: 8px 0;
              line-height: 1.6;
            }

            /* Description */
            .certificate-description-intro {
              text-align: center;
              margin: 10px 0;
            }

            .certificate-description-underline {
              text-align: center;
              border-bottom: 2px solid #777;
              padding-bottom: 8px;
              margin: 10px auto;
              min-width: 70%;
            }

            .certificate-description-text {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(14px, 2vw, 16px);
              font-weight: bold;
              color: #333;
              margin: 0;
              line-height: 1.6;
            }

            /* Certificate Number */
            .certificate-number {
              text-align: center;
              margin-top: 15px;
            }

            .certificate-number-text {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(11px, 1.5vw, 13px);
              color: #666;
            }

            /* Footer */
            .certificate-footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 20px;
              padding-top: 15px;
              gap: 20px;
            }

            .certificate-footer-left,
            .certificate-footer-right {
              flex: 1;
              text-align: center;
              min-width: 0;
            }

            .certificate-org-name {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(11px, 1.5vw, 13px);
              color: #555;
              margin: 0 0 8px 0;
            }

            .certificate-date-label {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(11px, 1.5vw, 13px);
              color: #555;
              margin: 0 0 8px 0;
            }

            .certificate-signature-line {
              height: 40px;
              border-bottom: 1px solid #777;
              margin: 5px 0 10px 0;
            }

            .certificate-date-value {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(11px, 1.5vw, 13px);
              font-weight: bold;
              color: #333;
              margin: 5px 0;
            }

            .certificate-seal {
              margin-top: 8px;
            }

            .certificate-seal-image {
              max-width: 60px;
              max-height: 60px;
              object-fit: contain;
              display: block;
              margin: 0 auto;
            }

            .certificate-seal-text {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(11px, 1.5vw, 13px);
              font-weight: bold;
              color: #333;
              margin: 8px 0 0 0;
            }

            .certificate-signature {
              margin-top: 10px;
            }

            .certificate-signature-image {
              max-width: 80px;
              max-height: 40px;
              object-fit: contain;
              display: block;
              margin: 0 auto 5px;
            }

            .certificate-signature-label {
              font-family: 'Open Sans', sans-serif;
              font-size: clamp(10px, 1.3vw, 12px);
              font-weight: bold;
              color: #333;
              margin: 5px 0 0 0;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
              .certificate-wrapper {
                padding: 10px;
              }

              .certificate-container {
                padding: 15px;
              }

              .certificate-content {
                width: calc(100% - 60px);
                height: calc(100% - 60px);
                margin: 30px auto;
                padding: 20px 25px;
              }

              .certificate-footer {
                flex-direction: column;
                gap: 15px;
                align-items: center;
              }

              .certificate-footer-left,
              .certificate-footer-right {
                width: 100%;
              }
            }

            /* Print Styles */
            @media print {
              body * {
                visibility: hidden;
              }

              .certificate-wrapper,
              .certificate-wrapper * {
                visibility: visible;
              }

              .certificate-wrapper {
                position: absolute;
                left: 0;
                top: 0;
                width: 297mm;
                height: 210mm;
                padding: 0;
                margin: 0;
              }

              .certificate-container {
                width: 100%;
                height: 100%;
                aspect-ratio: auto;
                padding: 15mm;
                border-radius: 0;
              }

              .certificate-content {
                width: calc(100% - 80px);
                height: calc(100% - 80px);
                margin: 40px auto;
                padding: 25mm 30mm;
              }

              @page {
                size: A4 landscape;
                margin: 0;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
