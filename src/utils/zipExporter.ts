import JSZip from 'jszip';
import { SchoolSettings, StudentRecord } from '../types';
import { generateStudentPdf } from './pdfGenerator';

export interface BatchZipOptions {
  students: StudentRecord[];
  settings: SchoolSettings;
  onProgress?: (current: number, total: number, studentName: string) => void;
}

export async function exportReportCardsToZip({
  students,
  settings,
  onProgress,
}: BatchZipOptions): Promise<{ blob: Blob; fileName: string; count: number }> {
  const zip = new JSZip();
  const folder = zip.folder('Report_Cards') || zip;
  const validStudents = students.filter(s => s.isValid);

  const total = validStudents.length;
  if (total === 0) {
    throw new Error('No valid student records found to generate report cards.');
  }

  for (let i = 0; i < total; i++) {
    const student = validStudents[i];
    if (onProgress) {
      onProgress(i + 1, total, student.studentName);
    }

    const doc = generateStudentPdf(student, settings);
    const pdfArrayBuffer = doc.output('arraybuffer');

    const cleanName = student.studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${student.admissionNo}_${cleanName}_ReportCard.pdf`;

    folder.file(fileName, pdfArrayBuffer);

    // Yield back to main thread periodically so UI progress bar updates smoothly
    if (i % 3 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      // Internal zip compression progress if needed
    }
  );

  const sessionClean = settings.academicSession.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const zipFileName = `Student_Report_Cards_${sessionClean}_${dateStr}.zip`;

  return {
    blob: zipBlob,
    fileName: zipFileName,
    count: total,
  };
}

export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
