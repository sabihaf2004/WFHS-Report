import * as XLSX from 'xlsx';
import { SchoolSettings, StudentRecord } from '../types';
import { parseRawData, DEFAULT_SCHOOL_SETTINGS } from './dataParser';

export const SAMPLE_STUDENT_DATA = [
  {
    'Student Name': 'Aarav Sharma',
    "Father's Name": 'Rajesh Sharma',
    'Admission Number': 'ADM-2025-001',
    'Roll No': '101',
    'Class': 'Class X - A',
    'Attendance': '96%',
    'English': 92,
    'Mathematics': 98,
    'Science': 95,
    'Social Science': 89,
    'Computer Science': 99,
  },
  {
    'Student Name': 'Sophia Rodriguez',
    "Father's Name": 'Carlos Rodriguez',
    'Admission Number': 'ADM-2025-002',
    'Roll No': '102',
    'Class': 'Class X - A',
    'Attendance': '94%',
    'English': 88,
    'Mathematics': 85,
    'Science': 91,
    'Social Science': 84,
    'Computer Science': 92,
  },
  {
    'Student Name': 'Ethan Walker',
    "Father's Name": 'James Walker',
    'Admission Number': 'ADM-2025-003',
    'Roll No': '103',
    'Class': 'Class X - A',
    'Attendance': '91%',
    'English': 78,
    'Mathematics': 72,
    'Science': 80,
    'Social Science': 76,
    'Computer Science': 85,
  },
  {
    'Student Name': 'Priya Patel',
    "Father's Name": 'Mukesh Patel',
    'Admission Number': 'ADM-2025-004',
    'Roll No': '104',
    'Class': 'Class X - A',
    'Attendance': '98%',
    'English': 95,
    'Mathematics': 100,
    'Science': 97,
    'Social Science': 94,
    'Computer Science': 98,
  },
  {
    'Student Name': 'Lucas Chen',
    "Father's Name": 'Wei Chen',
    'Admission Number': 'ADM-2025-005',
    'Roll No': '105',
    'Class': 'Class X - A',
    'Attendance': '88%',
    'English': 64,
    'Mathematics': 58,
    'Science': 62,
    'Social Science': 68,
    'Computer Science': 70,
  },
  {
    'Student Name': 'Zara Khan',
    "Father's Name": 'Imran Khan',
    'Admission Number': 'ADM-2025-006',
    'Roll No': '106',
    'Class': 'Class X - A',
    'Attendance': '90%',
    'English': 82,
    'Mathematics': 76,
    'Science': 84,
    'Social Science': 79,
    'Computer Science': 88,
  },
  {
    'Student Name': 'Noah Miller',
    "Father's Name": 'Robert Miller',
    'Admission Number': 'ADM-2025-007',
    'Roll No': '107',
    'Class': 'Class X - A',
    'Attendance': '78%',
    'English': 52,
    'Mathematics': 38, // Failed math
    'Science': 54,
    'Social Science': 50,
    'Computer Science': 62,
  },
  {
    'Student Name': 'Ananya Verma',
    "Father's Name": 'Sunil Verma',
    'Admission Number': 'ADM-2025-008',
    'Roll No': '108',
    'Class': 'Class X - A',
    'Attendance': '95%',
    'English': 91,
    'Mathematics': 94,
    'Science': 90,
    'Social Science': 88,
    'Computer Science': 96,
  },
];

export function getSampleParsedData(settings: SchoolSettings = DEFAULT_SCHOOL_SETTINGS) {
  return parseRawData(SAMPLE_STUDENT_DATA, settings);
}

export function downloadSampleExcel(fileName: string = 'Student_Marks_Template.xlsx') {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_STUDENT_DATA);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Student Name
    { wch: 20 }, // Father's Name
    { wch: 18 }, // Admission Number
    { wch: 10 }, // Roll No
    { wch: 15 }, // Class
    { wch: 12 }, // Attendance
    { wch: 12 }, // English
    { wch: 14 }, // Mathematics
    { wch: 12 }, // Science
    { wch: 16 }, // Social Science
    { wch: 18 }, // Computer Science
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students Marks');

  XLSX.writeFile(wb, fileName);
}

export function downloadSampleCsv(fileName: string = 'Student_Marks_Template.csv') {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_STUDENT_DATA);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
