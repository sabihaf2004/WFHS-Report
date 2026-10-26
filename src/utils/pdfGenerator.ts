import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchoolSettings, StudentRecord } from '../types';
import { DEFAULT_SCHOOL_SETTINGS } from './dataParser';

/**
 * Draws an academic shield/crest if no custom logo image was uploaded
 */
function drawSchoolCrest(doc: jsPDF, x: number, y: number, size: number) {
  doc.saveGraphicsState();
  
  // Background shield
  doc.setFillColor(30, 58, 138); // Navy blue #1e3a8a
  doc.roundedRect(x, y, size, size, 3, 3, 'F');
  
  // Gold inner outline
  doc.setDrawColor(217, 119, 6); // Amber #d97706
  doc.setLineWidth(0.6);
  doc.roundedRect(x + 1.5, y + 1.5, size - 3, size - 3, 2, 2, 'S');

  // Academic star & laurels icon representation
  doc.setFillColor(254, 240, 138); // Yellow gold
  doc.circle(x + size / 2, y + size / 2 - 2, 3, 'F');

  // Book base shape
  doc.setFillColor(255, 255, 255);
  doc.rect(x + size / 2 - 4.5, y + size / 2 + 2, 9, 3, 'F');

  doc.restoreGraphicsState();
}

export function generateStudentPdf(
  student: StudentRecord,
  settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  // 1. Double Borders
  doc.setDrawColor(30, 58, 138); // Primary navy
  doc.setLineWidth(1.0);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');

  doc.setDrawColor(217, 119, 6); // Gold accent border
  doc.setLineWidth(0.3);
  doc.rect(margin + 1.8, margin + 1.8, pageWidth - (margin + 1.8) * 2, pageHeight - (margin + 1.8) * 2, 'S');

  // Decorative corner brackets
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  const cornerSize = 4;
  // Top-left
  doc.line(margin + 2.5, margin + 2.5, margin + 2.5 + cornerSize, margin + 2.5);
  doc.line(margin + 2.5, margin + 2.5, margin + 2.5, margin + 2.5 + cornerSize);
  // Top-right
  doc.line(pageWidth - margin - 2.5, margin + 2.5, pageWidth - margin - 2.5 - cornerSize, margin + 2.5);
  doc.line(pageWidth - margin - 2.5, margin + 2.5, pageWidth - margin - 2.5, margin + 2.5 + cornerSize);
  // Bottom-left
  doc.line(margin + 2.5, pageHeight - margin - 2.5, margin + 2.5 + cornerSize, pageHeight - margin - 2.5);
  doc.line(margin + 2.5, pageHeight - margin - 2.5, margin + 2.5, pageHeight - margin - 2.5 - cornerSize);
  // Bottom-right
  doc.line(pageWidth - margin - 2.5, pageHeight - margin - 2.5, pageWidth - margin - 2.5 - cornerSize, pageHeight - margin - 2.5);
  doc.line(pageWidth - margin - 2.5, pageHeight - margin - 2.5, pageWidth - margin - 2.5, pageHeight - margin - 2.5 - cornerSize);

  // 2. School Header
  let headerTop = 16;
  const logoSize = 18;
  const logoX = margin + 6;

  if (settings.logoDataUrl) {
    try {
      doc.addImage(settings.logoDataUrl, 'PNG', logoX, headerTop, logoSize, logoSize);
    } catch {
      drawSchoolCrest(doc, logoX, headerTop, logoSize);
    }
  } else {
    drawSchoolCrest(doc, logoX, headerTop, logoSize);
  }

  // School Titles
  const textCenterX = pageWidth / 2 + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 58, 138);
  doc.text(settings.schoolName.toUpperCase(), textCenterX, headerTop + 5, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(settings.tagline, textCenterX, headerTop + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${settings.address}  |  Affiliation No: ${settings.affiliationNo}`, textCenterX, headerTop + 14.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text(`ACADEMIC SESSION: ${settings.academicSession}`, textCenterX, headerTop + 19, { align: 'center' });

  // 3. Report Card Title Banner
  const bannerY = headerTop + 24;
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin + 5, bannerY, pageWidth - (margin + 5) * 2, 7.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`OFFICIAL STUDENT REPORT CARD  -  ${settings.termOrExamName.toUpperCase()}`, pageWidth / 2, bannerY + 5.2, { align: 'center' });

  // 4. Student Details Box
  const infoY = bannerY + 11;
  const infoWidth = pageWidth - (margin + 5) * 2;
  const infoHeight = 24;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 5, infoY, infoWidth, infoHeight, 1.5, 1.5, 'FD');

  const col1X = margin + 9;
  const col2X = margin + 74;
  const col3X = margin + 138;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT NAME:', col1X, infoY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(student.studentName, col1X, infoY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("FATHER'S / GUARDIAN NAME:", col2X, infoY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(student.fatherName, col2X, infoY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ADMISSION NO:', col3X, infoY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138);
  doc.text(student.admissionNo, col3X, infoY + 10.5);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 8, infoY + 13, margin + infoWidth + 2, infoY + 13);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CLASS & SECTION:', col1X, infoY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(student.classSection || settings.classSection, col1X + 28, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ROLL NUMBER:', col2X, infoY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(student.rollNo || '-', col2X + 23, infoY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ATTENDANCE:', col3X, infoY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(student.attendance || '95%', col3X + 23, infoY + 18);

  // 5. Marks Table via autoTable
  const tableData = student.subjects.map((sub, index) => {
    const remark =
      sub.status === 'Fail'
        ? 'Scope for improvement'
        : sub.marksObtained >= 90
        ? 'Outstanding conceptual clarity'
        : sub.marksObtained >= 80
        ? 'Very good application'
        : sub.marksObtained >= 60
        ? 'Satisfactory understanding'
        : 'Needs focused practice';

    return [
      String(index + 1),
      sub.subject,
      String(sub.maxMarks),
      String(sub.marksObtained),
      `${((sub.marksObtained / (sub.maxMarks || 100)) * 100).toFixed(1)}%`,
      sub.grade,
      sub.status.toUpperCase(),
      remark,
    ];
  });

  autoTable(doc, {
    startY: infoY + infoHeight + 4,
    margin: { left: margin + 5, right: margin + 5 },
    head: [['S.No', 'Subject Name', 'Max Marks', 'Marks Obtained', 'Percentage', 'Grade', 'Result', 'Remarks']],
    body: tableData,
    foot: [
      [
        '',
        'GRAND TOTAL & SUMMARY',
        String(student.totalMax),
        String(student.totalObtained),
        `${student.percentage.toFixed(2)}%`,
        student.overallGrade,
        student.status,
        student.status === 'PASS' ? 'Promoted with Distinction' : 'Requires Re-assessment',
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 2.8,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 3,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.4,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', fontStyle: 'bold', cellWidth: 42 },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      7: { halign: 'left', cellWidth: 38 },
    },
    didParseCell: (data) => {
      // Highlight failed subjects in marks table
      if (data.section === 'body') {
        const rawRow = data.row.raw as any;
        const statusVal = Array.isArray(rawRow) ? rawRow[6] : undefined;
        if (statusVal === 'FAIL') {
          if (data.column.index === 3 || data.column.index === 5 || data.column.index === 6) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fillColor = [254, 242, 242];
          }
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // 6. Summary Metric Badges (Result, Grade, Rank)
  const metricBoxY = finalY + 4;
  const metricBoxHeight = 16;
  const cardWidth = (pageWidth - (margin + 5) * 2 - 8) / 3;

  // Box 1: Status
  const statusColor: [number, number, number] =
    student.status === 'PASS'
      ? [22, 163, 74] // Green
      : student.status === 'NEEDS IMPROVEMENT'
      ? [217, 119, 6] // Orange
      : [220, 38, 38]; // Red

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin + 5, metricBoxY, cardWidth, metricBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('OVERALL RESULT STATUS', margin + 5 + cardWidth / 2, metricBoxY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(student.status, margin + 5 + cardWidth / 2, metricBoxY + 12, { align: 'center' });

  // Box 2: Percentage & Grade
  const box2X = margin + 5 + cardWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.roundedRect(box2X, metricBoxY, cardWidth, metricBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PERCENTAGE & GRADE', box2X + cardWidth / 2, metricBoxY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`${student.percentage.toFixed(1)}% (Grade ${student.overallGrade})`, box2X + cardWidth / 2, metricBoxY + 12, { align: 'center' });

  // Box 3: Academic Rank
  const box3X = box2X + cardWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.6);
  doc.roundedRect(box3X, metricBoxY, cardWidth, metricBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CLASS MERIT POSITION', box3X + cardWidth / 2, metricBoxY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text(student.rank ? `Rank #${student.rank}` : 'Evaluated', box3X + cardWidth / 2, metricBoxY + 12, { align: 'center' });

  // 7. Grading Scale Legend
  const legendY = metricBoxY + metricBoxHeight + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('GRADING SCALE KEY:', margin + 6, legendY + 3.5);

  const legendText = settings.gradingScale
    .map(g => `${g.grade}: ≥${g.minPercentage}% (${g.description})`)
    .join('  |  ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(legendText, margin + 36, legendY + 3.5);

  // 8. Signatures Section
  const sigY = pageHeight - margin - 28;
  const sigColWidth = (pageWidth - (margin + 6) * 2) / 3;

  // Dotted lines for signatures
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  
  // Sig 1: Class Teacher
  const sig1X = margin + 10;
  doc.line(sig1X, sigY + 14, sig1X + 44, sigY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CLASS TEACHER', sig1X + 22, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Signature & Date', sig1X + 22, sigY + 21.5, { align: 'center' });

  // Sig 2: Exam In-Charge
  const sig2X = margin + 6 + sigColWidth + 6;
  doc.line(sig2X, sigY + 14, sig2X + 44, sigY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('EXAM CONTROLLER', sig2X + 22, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified & Verified', sig2X + 22, sigY + 21.5, { align: 'center' });

  // Sig 3: Principal / Head of School
  const sig3X = margin + 6 + sigColWidth * 2 + 6;
  doc.line(sig3X, sigY + 14, sig3X + 44, sigY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('PRINCIPAL', sig3X + 22, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Official Seal & Signature', sig3X + 22, sigY + 21.5, { align: 'center' });

  // Seal circle outline
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.circle(sig3X + 22, sigY + 7, 6, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICIAL SEAL', sig3X + 22, sigY + 7.5, { align: 'center' });

  // Bottom Footer info
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on: ${today}  |  Document ID: ${student.admissionNo}-${student.rollNo || '0'}  |  Valid only with authorized signature and school seal`, pageWidth / 2, pageHeight - margin - 2.5, { align: 'center' });

  return doc;
}

export function downloadStudentPdf(
  student: StudentRecord,
  settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS
): void {
  const doc = generateStudentPdf(student, settings);
  const cleanName = student.studentName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${student.admissionNo}_${cleanName}_ReportCard.pdf`;
  doc.save(fileName);
}

export function getStudentPdfBlob(
  student: StudentRecord,
  settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS
): Blob {
  const doc = generateStudentPdf(student, settings);
  return doc.output('blob');
}

export function getStudentPdfDataUri(
  student: StudentRecord,
  settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS
): string {
  const doc = generateStudentPdf(student, settings);
  return doc.output('datauristring');
}

export function getStudentPdfArrayBuffer(
  student: StudentRecord,
  settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS
): ArrayBuffer {
  const doc = generateStudentPdf(student, settings);
  return doc.output('arraybuffer');
}
