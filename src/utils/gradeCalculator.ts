import { GradeThreshold, SubjectMark } from '../types';

export const DEFAULT_GRADING_SCALE: GradeThreshold[] = [
  { grade: 'A+', minPercentage: 90, description: 'Outstanding', color: '#16a34a' },
  { grade: 'A', minPercentage: 80, description: 'Excellent', color: '#2563eb' },
  { grade: 'B', minPercentage: 70, description: 'Very Good', color: '#0891b2' },
  { grade: 'C', minPercentage: 60, description: 'Good', color: '#d97706' },
  { grade: 'D', minPercentage: 50, description: 'Satisfactory', color: '#ea580c' },
  { grade: 'E', minPercentage: 40, description: 'Pass', color: '#854d0e' },
  { grade: 'F', minPercentage: 0, description: 'Needs Improvement', color: '#dc2626' },
];

export function calculateGrade(
  percentage: number,
  scale: GradeThreshold[] = DEFAULT_GRADING_SCALE
): { grade: string; description: string; color: string } {
  // Sort descending by minPercentage
  const sorted = [...scale].sort((a, b) => b.minPercentage - a.minPercentage);
  for (const threshold of sorted) {
    if (percentage >= threshold.minPercentage) {
      return {
        grade: threshold.grade,
        description: threshold.description,
        color: threshold.color,
      };
    }
  }
  return { grade: 'F', description: 'Needs Improvement', color: '#dc2626' };
}

export function calculateSubjectStatus(
  marksObtained: number,
  maxMarks: number,
  passingPercentage: number = 40
): { status: 'Pass' | 'Fail'; grade: string } {
  if (maxMarks <= 0) {
    return { status: 'Fail', grade: 'F' };
  }
  const pct = (marksObtained / maxMarks) * 100;
  const gradeInfo = calculateGrade(pct);
  const status = pct >= passingPercentage ? 'Pass' : 'Fail';
  return { status, grade: gradeInfo.grade };
}

export function calculateStudentTotals(
  subjects: SubjectMark[],
  passingPercentage: number = 40,
  scale: GradeThreshold[] = DEFAULT_GRADING_SCALE
): {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  status: 'PASS' | 'FAIL' | 'NEEDS IMPROVEMENT';
} {
  let totalObtained = 0;
  let totalMax = 0;
  let hasFailedSubject = false;

  for (const sub of subjects) {
    totalObtained += Number.isFinite(sub.marksObtained) ? sub.marksObtained : 0;
    totalMax += Number.isFinite(sub.maxMarks) && sub.maxMarks > 0 ? sub.maxMarks : 100;
    if (sub.status === 'Fail') {
      hasFailedSubject = true;
    }
  }

  const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
  const gradeInfo = calculateGrade(percentage, scale);

  let status: 'PASS' | 'FAIL' | 'NEEDS IMPROVEMENT' = 'PASS';
  if (percentage < passingPercentage) {
    status = 'FAIL';
  } else if (hasFailedSubject) {
    status = 'NEEDS IMPROVEMENT';
  }

  return {
    totalObtained: Number(totalObtained.toFixed(2)),
    totalMax,
    percentage,
    overallGrade: gradeInfo.grade,
    status,
  };
}

export function computeRanks<T extends { percentage: number; isValid: boolean }>(
  records: T[]
): (T & { rank?: number })[] {
  // Sort valid records by percentage descending
  const sortedValid = records
    .filter(r => r.isValid)
    .sort((a, b) => b.percentage - a.percentage);

  // Assign dense ranks with tied percentages sharing the same rank
  let currentRank = 1;
  const rankMap = new Map<number, number>();

  sortedValid.forEach((record, index) => {
    if (index > 0 && record.percentage === sortedValid[index - 1].percentage) {
      rankMap.set(record.percentage, rankMap.get(sortedValid[index - 1].percentage)!);
    } else {
      rankMap.set(record.percentage, currentRank);
    }
    currentRank++;
  });

  return records.map(record => {
    if (!record.isValid) {
      return { ...record, rank: undefined };
    }
    return {
      ...record,
      rank: rankMap.get(record.percentage),
    };
  });
}
