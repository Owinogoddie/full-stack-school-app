import React from 'react';
import jsPDF from 'jspdf';
import { FeeStructure } from './FeeStructureList';


interface ExportToPdfButtonProps {
  feeStructures: FeeStructure[];
}

const ExportToPdfButton: React.FC<ExportToPdfButtonProps> = ({ feeStructures }) => {
  const exportToPdf = () => {
    const pdf = new jsPDF();
    let yOffset = 10;

    feeStructures.forEach((structure, index) => {
      if (index > 0) {
        pdf.addPage();
        yOffset = 10;
      }

      pdf.setFontSize(16);
      pdf.text(structure.feeType.name, 10, yOffset);
      yOffset += 10;

      pdf.setFontSize(12);
      pdf.text(`Base Amount: ${structure.baseAmount.toLocaleString()}`, 10, yOffset);
      yOffset += 7;
      pdf.text(`Term: ${structure.term}`, 10, yOffset);
      yOffset += 7;
      pdf.text(`Special Programme: ${structure.specialProgramme || 'N/A'}`, 10, yOffset);
      yOffset += 10;

      pdf.text('Grades & Classes:', 10, yOffset);
      yOffset += 7;
      structure.gradeClasses.forEach((gc) => {
        pdf.text(`- ${gc.gradeName}: ${gc.classes.map((c) => c.name).join(', ')}`, 15, yOffset);
        yOffset += 7;
      });

      yOffset += 3;
      pdf.text(`Student Categories: ${structure.studentCategories.join(', ') || 'All Categories'}`, 10, yOffset);
      yOffset += 7;
      pdf.text(`Last updated: ${new Date(structure.effectiveDate).toLocaleDateString()}`, 10, yOffset);
      yOffset += 7;
      pdf.text(`Version: ${structure.version}`, 10, yOffset);
    });

    pdf.save('fee_structures.pdf');
  };

  return (
    <button
      onClick={exportToPdf}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-6 transition duration-300 ease-in-out"
    >
      Export to PDF
    </button>
  );
};

export default ExportToPdfButton;