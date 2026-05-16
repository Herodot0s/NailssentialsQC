import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Exports a DOM element to a PDF file.
 * @param elementId The ID of the HTML element to export.
 * @param filename The name of the resulting PDF file.
 */
export const exportComponentToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Hide buttons or elements that shouldn't be in the PDF
    const actionButtons = element.querySelectorAll('.pdf-exclude');
    actionButtons.forEach((btn) => ((btn as HTMLElement).style.visibility = 'hidden'));

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Restore buttons
    actionButtons.forEach((btn) => ((btn as HTMLElement).style.visibility = 'visible'));

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if content overflows
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
