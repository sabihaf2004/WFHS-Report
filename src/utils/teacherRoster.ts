import { SchoolSettings, StudentRecord, SubjectMark } from '../types';
import { calculateStudentTotals, calculateSubjectStatus, computeRanks } from './gradeCalculator';

export interface PresetClassInfo {
  id: string;
  name: string;
  section: string;
  subjects: { name: string; maxMarks: number }[];
  students: {
    studentName: string;
    fatherName: string;
    admissionNo: string;
    rollNo: string;
  }[];
}

export const PRESET_CLASSES: PresetClassInfo[] = [
  {
    id: 'class-10-a',
    name: 'Class 10',
    section: 'Section A',
    subjects: [
      { name: 'English', maxMarks: 100 },
      { name: 'Mathematics', maxMarks: 100 },
      { name: 'Science', maxMarks: 100 },
      { name: 'Social Studies', maxMarks: 100 },
      { name: 'Computer Applications', maxMarks: 100 },
    ],
    students: [
      { studentName: 'Aarav Sharma', fatherName: 'Rajesh Sharma', admissionNo: 'ADM-10A-01', rollNo: '1' },
      { studentName: 'Ananya Verma', fatherName: 'Sunil Verma', admissionNo: 'ADM-10A-02', rollNo: '2' },
      { studentName: 'Ethan Walker', fatherName: 'James Walker', admissionNo: 'ADM-10A-03', rollNo: '3' },
      { studentName: 'Lucas Chen', fatherName: 'Wei Chen', admissionNo: 'ADM-10A-04', rollNo: '4' },
      { studentName: 'Noah Miller', fatherName: 'Robert Miller', admissionNo: 'ADM-10A-05', rollNo: '5' },
      { studentName: 'Priya Patel', fatherName: 'Mukesh Patel', admissionNo: 'ADM-10A-06', rollNo: '6' },
      { studentName: 'Sophia Rodriguez', fatherName: 'Carlos Rodriguez', admissionNo: 'ADM-10A-07', rollNo: '7' },
      { studentName: 'Zara Khan', fatherName: 'Imran Khan', admissionNo: 'ADM-10A-08', rollNo: '8' },
    ],
  },
  {
    id: 'class-9-b',
    name: 'Class 9',
    section: 'Section B',
    subjects: [
      { name: 'English', maxMarks: 100 },
      { name: 'Mathematics', maxMarks: 100 },
      { name: 'General Science', maxMarks: 100 },
      { name: 'History & Civics', maxMarks: 100 },
      { name: 'Geography', maxMarks: 100 },
    ],
    students: [
      { studentName: 'Alexander Hayes', fatherName: 'David Hayes', admissionNo: 'ADM-9B-01', rollNo: '1' },
      { studentName: 'Diya Sengupta', fatherName: 'Subir Sengupta', admissionNo: 'ADM-9B-02', rollNo: '2' },
      { studentName: 'Leo Martinez', fatherName: 'Antonio Martinez', admissionNo: 'ADM-9B-03', rollNo: '3' },
      { studentName: 'Maya Tanaka', fatherName: 'Kenji Tanaka', admissionNo: 'ADM-9B-04', rollNo: '4' },
      { studentName: 'Rohan Gupta', fatherName: 'Alok Gupta', admissionNo: 'ADM-9B-05', rollNo: '5' },
      { studentName: 'Zoe Williams', fatherName: 'Mark Williams', admissionNo: 'ADM-9B-06', rollNo: '6' },
    ],
  },
];

const STORAGE_KEY_PREFIX = 'scholarcard_teacher_roster_';

/**
 * Initializes student records for a preset class with blank or existing marks
 */
export function initializeRosterFromPreset(
  preset: PresetClassInfo,
  settings: SchoolSettings
): StudentRecord[] {
  const records: StudentRecord[] = preset.students.map((std, idx) => {
    const subjects: SubjectMark[] = preset.subjects.map(sub => {
      const { status, grade } = calculateSubjectStatus(0, sub.maxMarks, settings.passingPercentage);
      return {
        subject: sub.name,
        marksObtained: 0,
        maxMarks: sub.maxMarks,
        grade,
        status,
      };
    });

    const totals = calculateStudentTotals(subjects, settings.passingPercentage, settings.gradingScale);

    return {
      id: `preset-${preset.id}-${std.admissionNo}`,
      admissionNo: std.admissionNo,
      studentName: std.studentName,
      fatherName: std.fatherName,
      rollNo: std.rollNo,
      classSection: `${preset.name} - ${preset.section}`,
      attendance: '95%',
      subjects,
      totalObtained: totals.totalObtained,
      totalMax: totals.totalMax,
      percentage: totals.percentage,
      overallGrade: totals.overallGrade,
      status: totals.status,
      isValid: true,
      validationErrors: [],
      validationWarnings: [],
    };
  });

  return computeRanks(records);
}

/**
 * Saves teacher-entered marks to localStorage
 */
export function saveTeacherRoster(classId: string, students: StudentRecord[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${classId}`, JSON.stringify(students));
    }
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

/**
 * Loads saved teacher-entered marks from localStorage or falls back to preset
 */
export function loadTeacherRoster(
  classId: string,
  settings: SchoolSettings
): { students: StudentRecord[]; isSaved: boolean } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${classId}`);
      if (saved) {
        const parsed = JSON.parse(saved) as StudentRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { students: computeRanks(parsed), isSaved: true };
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load from localStorage:', err);
  }

  const preset = PRESET_CLASSES.find(c => c.id === classId) || PRESET_CLASSES[0];
  return { students: initializeRosterFromPreset(preset, settings), isSaved: false };
}
