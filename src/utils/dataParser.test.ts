import test from 'node:test';
import assert from 'node:assert/strict';
import { detectColumns, parseRawData, DEFAULT_SCHOOL_SETTINGS } from './dataParser';

test('detectColumns correctly identifies standard and alternate column variations', () => {
  const headers = ['Student Name', "Father's Name", 'Admission Number', 'Mathematics', 'Science', 'English'];
  const mapping = detectColumns(headers);

  assert.equal(mapping.nameCol, 'Student Name');
  assert.equal(mapping.fatherCol, "Father's Name");
  assert.equal(mapping.admissionCol, 'Admission Number');
  assert.deepEqual(mapping.subjectCols, ['Mathematics', 'Science', 'English']);
});

test('detectColumns handles alternative header names like Name, Father, Adm No', () => {
  const headers = ['Name', 'Father', 'Adm No', 'Physics', 'Chemistry'];
  const mapping = detectColumns(headers);

  assert.equal(mapping.nameCol, 'Name');
  assert.equal(mapping.fatherCol, 'Father');
  assert.equal(mapping.admissionCol, 'Adm No');
  assert.deepEqual(mapping.subjectCols, ['Physics', 'Chemistry']);
});

test('parseRawData validates missing student names and non-numeric marks', () => {
  const mockRows = [
    {
      'Student Name': 'Alice Smith',
      'Father Name': 'Bob Smith',
      'Admission Number': 'ADM-101',
      Math: '95',
      Science: '88',
    },
    {
      'Student Name': '', // Missing name
      'Father Name': 'John Doe',
      'Admission Number': 'ADM-102',
      Math: '70',
      Science: '65',
    },
    {
      'Student Name': 'Charlie Brown',
      'Father Name': 'Dan Brown',
      'Admission Number': 'ADM-103',
      Math: 'AB', // Non-numeric mark
      Science: '50',
    },
  ];

  const result = parseRawData(mockRows, DEFAULT_SCHOOL_SETTINGS);

  assert.equal(result.totalRows, 3);
  assert.equal(result.validCount, 1); // Only Alice is completely valid without errors
  assert.equal(result.errorCount, 2); // 1 missing name, 1 non-numeric mark

  const missingNameIssue = result.issues.find(i => i.field === 'Student Name');
  assert.ok(missingNameIssue, 'Should flag missing student name');
  assert.equal(missingNameIssue?.severity, 'error');

  const invalidMarkIssue = result.issues.find(i => i.message.includes('non-numeric mark'));
  assert.ok(invalidMarkIssue, 'Should flag non-numeric mark');
  assert.equal(invalidMarkIssue?.severity, 'error');
});

test('parseRawData generates fallback admission ID if missing and raises warning', () => {
  const mockRows = [
    {
      'Student Name': 'David Warner',
      'Father Name': 'Steve Warner',
      'Admission Number': '',
      Math: '80',
      Science: '85',
    },
  ];

  const result = parseRawData(mockRows, DEFAULT_SCHOOL_SETTINGS);
  assert.equal(result.records.length, 1);
  assert.ok(result.records[0].admissionNo.startsWith('ADM-'));
  const warn = result.issues.find(i => i.severity === 'warning' && i.field === 'Admission Number');
  assert.ok(warn);
});
