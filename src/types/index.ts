export interface SubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  status: 'Pass' | 'Fail';
  remarks?: string;
  rawInput?: any;
  error?: string;
}

export interface StudentRecord {
  id: string; // generated unique id
  admissionNo: string;
  studentName: string;
  fatherName: string;
  rollNo?: string;
  classSection?: string;
  attendance?: string;
  subjects: SubjectMark[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  status: 'PASS' | 'FAIL' | 'NEEDS IMPROVEMENT';
  rank?: number;
  isValid: boolean;
  validationErrors: string[];
  validationWarnings: string[];
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  address: string;
  affiliationNo: string;
  academicSession: string;
  termOrExamName: string;
  classSection: string;
  passingPercentage: number;
  defaultMaxMarks: number;
  logoDataUrl?: string;
  gradingScale: GradeThreshold[];
}

export interface GradeThreshold {
  grade: string;
  minPercentage: number;
  description: string;
  color: string;
}

export interface ValidationIssue {
  rowNumber: number;
  studentName: string;
  admissionNo: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ParseResult {
  records: StudentRecord[];
  issues: ValidationIssue[];
  subjectNames: string[];
  totalRows: number;
  validCount: number;
  errorCount: number;
}
