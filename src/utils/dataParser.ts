import * as XLSX from 'xlsx';
import { ParseResult, SchoolSettings, StudentRecord, SubjectMark, ValidationIssue } from '../types';
import { calculateStudentTotals, calculateSubjectStatus, computeRanks } from './gradeCalculator';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'SPRINGDALE INTERNATIONAL ACADEMY',
  tagline: 'Excellence in Academics & Character Building',
  address: '124 Academic Enclave, Knowledge Park, New Delhi - 110001',
  affiliationNo: 'CBSE / AFF / 2025 / 98412',
  academicSession: '2025 - 2026',
  termOrExamName: 'Annual Cumulative Assessment (Term - II)',
  classSection: 'Class X - Section A',
  passingPercentage: 40,
  defaultMaxMarks: 100,
  gradingScale: [
    { grade: 'A+', minPercentage: 90, description: 'Outstanding', color: '#16a34a' },
    { grade: 'A', minPercentage: 80, description: 'Excellent', color: '#2563eb' },
    { grade: 'B', minPercentage: 70, description: 'Very Good', color: '#0891b2' },
    { grade: 'C', minPercentage: 60, description: 'Good', color: '#d97706' },
    { grade: 'D', minPercentage: 50, description: 'Satisfactory', color: '#ea580c' },
    { grade: 'E', minPercentage: 40, description: 'Pass', color: '#854d0e' },
    { grade: 'F', minPercentage: 0, description: 'Needs Improvement', color: '#dc2626' },
  ],
};

interface ColumnMapping {
  nameCol?: string;
  fatherCol?: string;
  admissionCol?: string;
  rollCol?: string;
  classCol?: string;
  attendanceCol?: string;
  subjectCols: string[];
}

export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    subjectCols: [],
  };

  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const h of headers) {
    const c = clean(h);
    if (!c) continue;

    if (!mapping.nameCol && (/^(studentname|name|student|candidatename|fullname)$/.test(c) || c.includes('studentname'))) {
      mapping.nameCol = h;
    } else if (!mapping.fatherCol && (/^(fathername|fathersname|father|guardianname|parentname|guardian)$/.test(c) || c.includes('father'))) {
      mapping.fatherCol = h;
    } else if (!mapping.admissionCol && (/^(admissionno|admissionnumber|admno|admissionid|admnumber|studentregno|registrationno|regno)$/.test(c) || c.includes('admno') || c.includes('admission'))) {
      mapping.admissionCol = h;
    } else if (!mapping.rollCol && (/^(rollno|rollnumber|roll|rollnum)$/.test(c) || c.includes('rollno'))) {
      mapping.rollCol = h;
    } else if (!mapping.classCol && (/^(class|grade|classsection|section|standard)$/.test(c))) {
      mapping.classCol = h;
    } else if (!mapping.attendanceCol && (/^(attendance|attendancedays|attendancepct|attendancepercent)$/.test(c) || c.includes('attendance'))) {
      mapping.attendanceCol = h;
    } else {
      // Any remaining column is treated as a subject!
      // Filter out obvious summary columns like 'Total', 'Percentage', 'Rank', 'Grade' if they pre-exist
      if (!/^(total|totaltotal|totalmarks|percentage|pct|overallgrade|grade|rank|status|result|passfail|remarks)$/.test(c)) {
        mapping.subjectCols.push(h);
      }
    }
  }

  // Fallbacks if columns weren't matched strictly
  if (!mapping.nameCol) {
    const found = headers.find(h => /name/i.test(h) && !/father|parent|guardian/i.test(h));
    if (found) {
      mapping.nameCol = found;
      mapping.subjectCols = mapping.subjectCols.filter(c => c !== found);
    }
  }

  if (!mapping.admissionCol) {
    const found = headers.find(h => /adm|id|reg/i.test(h));
    if (found) {
      mapping.admissionCol = found;
      mapping.subjectCols = mapping.subjectCols.filter(c => c !== found);
    }
  }

  if (!mapping.fatherCol) {
    const found = headers.find(h => /father|parent|guardian/i.test(h));
    if (found) {
      mapping.fatherCol = found;
      mapping.subjectCols = mapping.subjectCols.filter(c => c !== found);
    }
  }

  return mapping;
}

export function parseRawData(
  rawData: Array<Record<string, any>>,
  settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS
): ParseResult {
  if (!rawData || rawData.length === 0) {
    return {
      records: [],
      issues: [
        {
          rowNumber: 0,
          studentName: '',
          admissionNo: '',
          field: 'file',
          message: 'The uploaded file contains no data rows.',
          severity: 'error',
        },
      ],
      subjectNames: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
    };
  }

  const headers = Object.keys(rawData[0] || {});
  const mapping = detectColumns(headers);
  const issues: ValidationIssue[] = [];
  const records: StudentRecord[] = [];

  if (!mapping.nameCol) {
    issues.push({
      rowNumber: 1,
      studentName: 'N/A',
      admissionNo: 'N/A',
      field: 'Student Name',
      message: 'Could not automatically identify a "Student Name" column in the header.',
      severity: 'error',
    });
  }

  if (!mapping.admissionCol) {
    issues.push({
      rowNumber: 1,
      studentName: 'N/A',
      admissionNo: 'N/A',
      field: 'Admission Number',
      message: 'Could not automatically identify an "Admission Number" or "Adm No" column in the header.',
      severity: 'warning',
    });
  }

  if (mapping.subjectCols.length === 0) {
    issues.push({
      rowNumber: 1,
      studentName: 'N/A',
      admissionNo: 'N/A',
      field: 'Subjects',
      message: 'No subject columns found (e.g. Math, Science, English, etc.).',
      severity: 'error',
    });
  }

  const seenAdmissionNos = new Set<string>();

  rawData.forEach((row, idx) => {
    const rowNumber = idx + 2; // Accounting for 1-based index and header
    const studentErrors: string[] = [];
    const studentWarnings: string[] = [];

    const rawName = mapping.nameCol ? row[mapping.nameCol] : undefined;
    const studentName = (rawName !== undefined && rawName !== null ? String(rawName).trim() : '');

    const rawFather = mapping.fatherCol ? row[mapping.fatherCol] : undefined;
    const fatherName = (rawFather !== undefined && rawFather !== null ? String(rawFather).trim() : '');

    const rawAdmission = mapping.admissionCol ? row[mapping.admissionCol] : undefined;
    let admissionNo = (rawAdmission !== undefined && rawAdmission !== null ? String(rawAdmission).trim() : '');

    const rawRoll = mapping.rollCol ? row[mapping.rollCol] : undefined;
    const rollNo = (rawRoll !== undefined && rawRoll !== null ? String(rawRoll).trim() : String(idx + 1));

    const rawClass = mapping.classCol ? row[mapping.classCol] : undefined;
    const classSection = (rawClass !== undefined && rawClass !== null ? String(rawClass).trim() : settings.classSection);

    const rawAttendance = mapping.attendanceCol ? row[mapping.attendanceCol] : undefined;
    const attendance = (rawAttendance !== undefined && rawAttendance !== null ? String(rawAttendance).trim() : undefined);

    // Validate Student Name
    if (!studentName) {
      const msg = 'Missing student name.';
      studentErrors.push(msg);
      issues.push({
        rowNumber,
        studentName: 'Unknown',
        admissionNo: admissionNo || `ROW-${rowNumber}`,
        field: 'Student Name',
        message: msg,
        severity: 'error',
      });
    }

    // Validate Admission Number
    if (!admissionNo) {
      admissionNo = `ADM-${1000 + idx}`;
      const msg = `Admission number was missing; generated fallback ID "${admissionNo}".`;
      studentWarnings.push(msg);
      issues.push({
        rowNumber,
        studentName: studentName || 'Unknown',
        admissionNo,
        field: 'Admission Number',
        message: msg,
        severity: 'warning',
      });
    } else {
      if (seenAdmissionNos.has(admissionNo)) {
        const msg = `Duplicate admission number detected: "${admissionNo}".`;
        studentWarnings.push(msg);
        issues.push({
          rowNumber,
          studentName: studentName || 'Unknown',
          admissionNo,
          field: 'Admission Number',
          message: msg,
          severity: 'warning',
        });
      }
      seenAdmissionNos.add(admissionNo);
    }

    // Validate Father's Name
    if (!fatherName) {
      const msg = "Father's name is missing.";
      studentWarnings.push(msg);
      issues.push({
        rowNumber,
        studentName: studentName || 'Unknown',
        admissionNo,
        field: "Father's Name",
        message: msg,
        severity: 'warning',
      });
    }

    // Parse Subject Marks
    const subjects: SubjectMark[] = [];
    const maxMarks = settings.defaultMaxMarks || 100;

    for (const subCol of mapping.subjectCols) {
      const rawVal = row[subCol];
      let numMarks = 0;
      let hasError = false;
      let errorMsg: string | undefined;

      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        hasError = true;
        errorMsg = `Missing mark for ${subCol} (treated as 0).`;
        numMarks = 0;
        studentWarnings.push(errorMsg);
        issues.push({
          rowNumber,
          studentName: studentName || 'Unknown',
          admissionNo,
          field: subCol,
          message: errorMsg,
          severity: 'warning',
        });
      } else {
        const strVal = String(rawVal).trim();
        const parsed = Number(strVal);

        if (isNaN(parsed)) {
          hasError = true;
          errorMsg = `Invalid non-numeric mark "${strVal}" for ${subCol} (treated as 0).`;
          numMarks = 0;
          studentErrors.push(errorMsg);
          issues.push({
            rowNumber,
            studentName: studentName || 'Unknown',
            admissionNo,
            field: subCol,
            message: errorMsg,
            severity: 'error',
          });
        } else if (parsed < 0) {
          hasError = true;
          errorMsg = `Negative marks (${parsed}) entered for ${subCol}.`;
          numMarks = 0;
          studentErrors.push(errorMsg);
          issues.push({
            rowNumber,
            studentName: studentName || 'Unknown',
            admissionNo,
            field: subCol,
            message: errorMsg,
            severity: 'error',
          });
        } else if (parsed > maxMarks) {
          hasError = true;
          errorMsg = `Marks obtained (${parsed}) exceeds max marks (${maxMarks}) in ${subCol}.`;
          numMarks = maxMarks;
          studentWarnings.push(errorMsg);
          issues.push({
            rowNumber,
            studentName: studentName || 'Unknown',
            admissionNo,
            field: subCol,
            message: errorMsg,
            severity: 'warning',
          });
        } else {
          numMarks = Number(parsed.toFixed(1));
        }
      }

      const { status, grade } = calculateSubjectStatus(numMarks, maxMarks, settings.passingPercentage);

      subjects.push({
        subject: subCol,
        marksObtained: numMarks,
        maxMarks,
        grade,
        status,
        rawInput: rawVal,
        error: errorMsg,
      });
    }

    const totals = calculateStudentTotals(subjects, settings.passingPercentage, settings.gradingScale);
    const isValid = studentErrors.length === 0 && subjects.length > 0;

    records.push({
      id: `std-${idx + 1}-${admissionNo}`,
      admissionNo,
      studentName: studentName || 'Unknown Student',
      fatherName: fatherName || 'N/A',
      rollNo,
      classSection,
      attendance,
      subjects,
      totalObtained: totals.totalObtained,
      totalMax: totals.totalMax,
      percentage: totals.percentage,
      overallGrade: totals.overallGrade,
      status: totals.status,
      isValid,
      validationErrors: studentErrors,
      validationWarnings: studentWarnings,
    });
  });

  // Calculate dense rankings
  const rankedRecords = computeRanks(records);

  const validCount = rankedRecords.filter(r => r.isValid).length;
  const errorCount = rankedRecords.filter(r => !r.isValid).length;

  return {
    records: rankedRecords,
    issues,
    subjectNames: mapping.subjectCols,
    totalRows: rawData.length,
    validCount,
    errorCount,
  };
}

export function parseFileBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS
): ParseResult {
  const isCsv = fileName.toLowerCase().endsWith('.csv');
  let workbook: XLSX.WorkBook;

  if (isCsv) {
    const text = new TextDecoder('utf-8').decode(buffer);
    workbook = XLSX.read(text, { type: 'string' });
  } else {
    workbook = XLSX.read(buffer, { type: 'array' });
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return {
      records: [],
      issues: [
        {
          rowNumber: 0,
          studentName: '',
          admissionNo: '',
          field: 'file',
          message: 'The file contains no readable worksheets.',
          severity: 'error',
        },
      ],
      subjectNames: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
    };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  return parseRawData(rawRows, settings);
}
