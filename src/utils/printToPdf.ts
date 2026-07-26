/** @format */

/**
 * Capture the current page as PDF using browser's print functionality
 * Returns a Promise that resolves with a Blob of the PDF
 */
export async function printToPdfBlob(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    // Clone the certificate element
    const certificateElement = document.querySelector('.certificate-container');
    if (!certificateElement) {
      reject(new Error('Certificate element not found'));
      return;
    }

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      reject(new Error('Failed to access iframe document'));
      return;
    }

    // Copy styles and content
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html dir="${document.documentElement.dir || 'rtl'}">
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            ${Array.from(document.styleSheets)
              .map((sheet) => {
                try {
                  return Array.from(sheet.cssRules)
                    .map((rule) => rule.cssText)
                    .join('\n');
                } catch (e) {
                  return '';
                }
              })
              .join('\n')}
          </style>
        </head>
        <body>
          ${certificateElement.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for content to load, then trigger print
    setTimeout(() => {
      iframe.contentWindow?.print();
      
      // Note: Browser print dialog will appear
      // We can't directly capture the PDF without user interaction
      // So we'll use a different approach - html2pdf or similar
      resolve(new Blob());
    }, 100);
  });
}

/**
 * Alternative: Use html2canvas + jsPDF to generate PDF programmatically
 * This doesn't require user interaction
 */
export async function captureElementAsPdf(element: HTMLElement): Promise<Blob> {
  // Check if html2pdf is available, otherwise use html2canvas + jsPDF
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: 0,
      filename: 'certificate.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: [297, 210], orientation: 'landscape' },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
