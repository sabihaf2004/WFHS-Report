import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGrade,
  calculateSubjectStatus,
  calculateStudentTotals,
  computeRanks,
  DEFAULT_GRADING_SCALE,
} from './gradeCalculator';
import { SubjectMark } from '../types';

test('calculateGrade returns correct grades on boundary conditions', () => {
  assert.equal(calculateGrade(95).grade, 'A+');
  assert.equal(calculateGrade(90).grade, 'A+');
  assert.equal(calculateGrade(89.9).grade, 'A');
  assert.equal(calculateGrade(80).grade, 'A');
  assert.equal(calculateGrade(75).grade, 'B');
  assert.equal(calculateGrade(65).grade, 'C');
  assert.equal(calculateGrade(55).grade, 'D');
  assert.equal(calculateGrade(45).grade, 'E');
  assert.equal(calculateGrade(40).grade, 'E');
  assert.equal(calculateGrade(39.9).grade, 'F');
  assert.equal(calculateGrade(0).grade, 'F');
});

test('calculateSubjectStatus identifies pass and fail correctly', () => {
  const passing = calculateSubjectStatus(65, 100, 40);
  assert.equal(passing.status, 'Pass');
  assert.equal(passing.grade, 'C');

  const failing = calculateSubjectStatus(35, 100, 40);
  assert.equal(failing.status, 'Fail');
  assert.equal(failing.grade, 'F');

  const customPassing = calculateSubjectStatus(45, 100, 50);
  assert.equal(customPassing.status, 'Fail');
});

test('calculateStudentTotals calculates aggregate sum and percentage', () => {
  const subjects: SubjectMark[] = [
    { subject: 'Math', marksObtained: 90, maxMarks: 100, grade: 'A+', status: 'Pass' },
    { subject: 'Science', marksObtained: 80, maxMarks: 100, grade: 'A', status: 'Pass' },
    { subject: 'English', marksObtained: 85, maxMarks: 100, grade: 'A', status: 'Pass' },
    { subject: 'Social Studies', marksObtained: 75, maxMarks: 100, grade: 'B', status: 'Pass' },
  ];

  const totals = calculateStudentTotals(subjects, 40, DEFAULT_GRADING_SCALE);
  assert.equal(totals.totalObtained, 330);
  assert.equal(totals.totalMax, 400);
  assert.equal(totals.percentage, 82.5);
  assert.equal(totals.overallGrade, 'A');
  assert.equal(totals.status, 'PASS');
});

test('calculateStudentTotals marks status as NEEDS IMPROVEMENT if one subject failed even if total percentage > 40', () => {
  const subjects: SubjectMark[] = [
    { subject: 'Math', marksObtained: 90, maxMarks: 100, grade: 'A+', status: 'Pass' },
    { subject: 'Science', marksObtained: 30, maxMarks: 100, grade: 'F', status: 'Fail' },
    { subject: 'English', marksObtained: 70, maxMarks: 100, grade: 'B', status: 'Pass' },
  ];

  const totals = calculateStudentTotals(subjects, 40, DEFAULT_GRADING_SCALE);
  assert.equal(totals.totalObtained, 190);
  assert.equal(totals.status, 'NEEDS IMPROVEMENT');
});

test('computeRanks assigns dense rank with equal percentage handling', () => {
  const students = [
    { id: '1', percentage: 92, isValid: true },
    { id: '2', percentage: 85, isValid: true },
    { id: '3', percentage: 85, isValid: true },
    { id: '4', percentage: 70, isValid: true },
    { id: '5', percentage: 0, isValid: false },
  ];

  const ranked = computeRanks(students);
  assert.equal(ranked.find(s => s.id === '1')?.rank, 1);
  assert.equal(ranked.find(s => s.id === '2')?.rank, 2);
  assert.equal(ranked.find(s => s.id === '3')?.rank, 2);
  assert.equal(ranked.find(s => s.id === '4')?.rank, 4);
  assert.equal(ranked.find(s => s.id === '5')?.rank, undefined);
});
