import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeRosterFromPreset, PRESET_CLASSES } from './teacherRoster';
import { DEFAULT_SCHOOL_SETTINGS } from './dataParser';
import { calculateStudentTotals, calculateSubjectStatus, computeRanks } from './gradeCalculator';

test('initializeRosterFromPreset initializes students from preset class', () => {
  const preset = PRESET_CLASSES[0];
  const roster = initializeRosterFromPreset(preset, DEFAULT_SCHOOL_SETTINGS);

  assert.equal(roster.length, preset.students.length);
  assert.equal(roster[0].studentName, preset.students[0].studentName);
  assert.equal(roster[0].admissionNo, preset.students[0].admissionNo);
  assert.equal(roster[0].subjects.length, preset.subjects.length);
  assert.equal(roster[0].subjects[0].subject, preset.subjects[0].name);
});

test('updating marks recalculates totals, percentage and status accurately', () => {
  const preset = PRESET_CLASSES[0];
  const roster = initializeRosterFromPreset(preset, DEFAULT_SCHOOL_SETTINGS);
  const student = roster[0];

  // Set marks for student
  student.subjects = student.subjects.map((sub, i) => {
    const mark = 85 + i * 2; // 85, 87, 89, 91, 93
    const { status, grade } = calculateSubjectStatus(mark, sub.maxMarks, 40);
    return {
      ...sub,
      marksObtained: mark,
      status,
      grade,
    };
  });

  const totals = calculateStudentTotals(student.subjects, 40, DEFAULT_SCHOOL_SETTINGS.gradingScale);
  assert.equal(totals.totalObtained, 85 + 87 + 89 + 91 + 93);
  assert.equal(totals.percentage, 89.0);
  assert.equal(totals.overallGrade, 'A');
  assert.equal(totals.status, 'PASS');
});
