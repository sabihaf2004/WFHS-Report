import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Archive,
  Save,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  ListOrdered,
  Download,
  AlertTriangle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SchoolSettings, StudentRecord, SubjectMark } from '../../types';
import {
  PRESET_CLASSES,
  PresetClassInfo,
  loadTeacherRoster,
  saveTeacherRoster,
  initializeRosterFromPreset,
} from '../../utils/teacherRoster';
import { calculateStudentTotals, calculateSubjectStatus, computeRanks } from '../../utils/gradeCalculator';

interface TeacherPortalProps {
  settings: SchoolSettings;
  onPreviewStudent: (student: StudentRecord) => void;
  onBatchExport: (students: StudentRecord[]) => void;
  onSyncToMain: (students: StudentRecord[]) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  settings,
  onPreviewStudent,
  onBatchExport,
  onSyncToMain,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('class-10-a');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [activeStudentIndex, setActiveStudentIndex] = useState<number>(0);
  const [entryMode, setEntryMode] = useState<'card' | 'stack' | 'overview'>('card');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isSavedIndicator, setIsSavedIndicator] = useState<boolean>(true);
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);

  // New Student Form
  const [newStudentName, setNewStudentName] = useState('');
  const [newFatherName, setNewFatherName] = useState('');
  const [newAdmissionNo, setNewAdmissionNo] = useState('');

  const currentClassPreset = PRESET_CLASSES.find(c => c.id === selectedClassId) || PRESET_CLASSES[0];

  // Load initial preset / saved marks on mount or class switch
  useEffect(() => {
    const { students: loadedStudents } = loadTeacherRoster(selectedClassId, settings);
    setStudents(loadedStudents);
    setActiveStudentIndex(0);
    if (loadedStudents[0]?.subjects[0]) {
      setSelectedSubject(loadedStudents[0].subjects[0].subject);
    }
    setLastSavedTime('Loaded');
  }, [selectedClassId, settings]);

  // Auto-save whenever students change
  const updateStudentsAndPersist = (updated: StudentRecord[]) => {
    const reRanked = computeRanks(updated);
    setStudents(reRanked);
    saveTeacherRoster(selectedClassId, reRanked);
    onSyncToMain(reRanked);

    setIsSavedIndicator(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(`Saved at ${now}`);
  };

  // Modify mark for a specific student and subject
  const handleMarkChange = (studentId: string, subjectName: string, val: string) => {
    const num = parseFloat(val);
    const updated = students.map(std => {
      if (std.id !== studentId) return std;

      const updatedSubjects = std.subjects.map(sub => {
        if (sub.subject !== subjectName) return sub;

        const max = sub.maxMarks || settings.defaultMaxMarks || 100;
        const validMark = isNaN(num) ? 0 : Math.max(0, Math.min(num, max));
        const { status, grade } = calculateSubjectStatus(validMark, max, settings.passingPercentage);

        return {
          ...sub,
          marksObtained: validMark,
          status,
          grade,
        };
      });

      const totals = calculateStudentTotals(updatedSubjects, settings.passingPercentage, settings.gradingScale);

      return {
        ...std,
        subjects: updatedSubjects,
        totalObtained: totals.totalObtained,
        totalMax: totals.totalMax,
        percentage: totals.percentage,
        overallGrade: totals.overallGrade,
        status: totals.status,
      };
    });

    updateStudentsAndPersist(updated);
  };

  // Quick preset score buttons (+5, -5, max, etc.)
  const adjustMark = (studentId: string, subjectName: string, delta: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const sub = student.subjects.find(s => s.subject === subjectName);
    if (!sub) return;

    const current = sub.marksObtained;
    const max = sub.maxMarks || 100;
    const nextVal = Math.max(0, Math.min(current + delta, max));
    handleMarkChange(studentId, subjectName, String(nextVal));
  };

  const currentStudent = students[activeStudentIndex];

  // Reset to default class preset
  const handleResetToPreset = () => {
    if (confirm('Reset this class back to the default preset roster? Any entered marks will be reset to 0.')) {
      const fresh = initializeRosterFromPreset(currentClassPreset, settings);
      updateStudentsAndPersist(fresh);
      setActiveStudentIndex(0);
    }
  };

  // Add a new student to preset class
  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newAdmissionNo.trim()) return;

    const subjects: SubjectMark[] = currentClassPreset.subjects.map(sub => {
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

    const newRecord: StudentRecord = {
      id: `preset-${selectedClassId}-${newAdmissionNo.trim()}`,
      admissionNo: newAdmissionNo.trim(),
      studentName: newStudentName.trim(),
      fatherName: newFatherName.trim() || 'N/A',
      rollNo: String(students.length + 1),
      classSection: `${currentClassPreset.name} - ${currentClassPreset.section}`,
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

    updateStudentsAndPersist([...students, newRecord]);
    setNewStudentName('');
    setNewFatherName('');
    setNewAdmissionNo('');
    setShowAddStudentModal(false);
    setActiveStudentIndex(students.length); // jump to newly added student
  };

  // Export current teacher marksheet to Excel
  const handleExportToExcel = () => {
    const rows = students.map(s => {
      const row: Record<string, any> = {
        'Student Name': s.studentName,
        "Father's Name": s.fatherName,
        'Admission Number': s.admissionNo,
        'Roll No': s.rollNo,
        'Class': s.classSection,
        'Attendance': s.attendance,
      };
      s.subjects.forEach(sub => {
        row[sub.subject] = sub.marksObtained;
      });
      row['Total Marks'] = s.totalObtained;
      row['Percentage'] = `${s.percentage}%`;
      row['Grade'] = s.overallGrade;
      row['Result'] = s.status;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentClassPreset.name);
    XLSX.writeFile(wb, `${currentClassPreset.name}_${currentClassPreset.section}_Marksheet.xlsx`);
  };

  // Fill sample passing marks for quick testing
  const handleQuickFillPassingMarks = () => {
    const updated = students.map((std, idx) => {
      const updatedSubjects = std.subjects.map((sub, sIdx) => {
        const base = 70 + ((idx * 3 + sIdx * 5) % 28);
        const { status, grade } = calculateSubjectStatus(base, sub.maxMarks, settings.passingPercentage);
        return {
          ...sub,
          marksObtained: base,
          status,
          grade,
        };
      });
      const totals = calculateStudentTotals(updatedSubjects, settings.passingPercentage, settings.gradingScale);
      return {
        ...std,
        subjects: updatedSubjects,
        totalObtained: totals.totalObtained,
        totalMax: totals.totalMax,
        percentage: totals.percentage,
        overallGrade: totals.overallGrade,
        status: totals.status,
      };
    });
    updateStudentsAndPersist(updated);
  };

  const gradedCount = students.filter(s => s.totalObtained > 0).length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Top Mobile Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Class & Exam Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Teacher Mobile Portal</span>
            </div>

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select preset class"
            >
              {PRESET_CLASSES.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section} ({cls.students.length} Students)
                </option>
              ))}
            </select>

            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lastSavedTime}</span>
            </span>
          </div>

          {/* Quick Roster Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
              title="Add another student to this roster"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>

            <button
              onClick={handleQuickFillPassingMarks}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
              title="Auto-fill sample marks for rapid testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Auto-fill Marks</span>
              <span className="sm:hidden">Fill</span>
            </button>

            <button
              onClick={handleResetToPreset}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Reset class to default empty marks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Optimized for Mobile Touch) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mt-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setEntryMode('card')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              entryMode === 'card'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Student Card</span>
          </button>

          <button
            onClick={() => setEntryMode('stack')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              entryMode === 'stack'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stack by Subject</span>
          </button>

          <button
            onClick={() => setEntryMode('overview')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              entryMode === 'overview'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Class Overview ({gradedCount}/{students.length})</span>
          </button>
        </div>
      </div>

      {/* MODE 1: STUDENT CARD FLOW (TOUCH-OPTIMIZED FOR SMARTPHONES) */}
      {entryMode === 'card' && currentStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-150">
          {/* Student Header Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs text-amber-300 font-extrabold flex items-center justify-center text-lg border border-white/20">
                #{currentStudent.rollNo || activeStudentIndex + 1}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  {currentStudent.studentName}
                </h3>
                <p className="text-xs text-blue-200">
                  Adm: <span className="font-mono font-semibold">{currentStudent.admissionNo}</span> • Father: {currentStudent.fatherName}
                </p>
              </div>
            </div>

            {/* Live Status Pill */}
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                currentStudent.status === 'PASS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : currentStudent.totalObtained === 0
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {currentStudent.totalObtained === 0 ? 'NOT GRADED' : currentStudent.status}
              </span>
              <div className="text-xs text-slate-300 mt-1 font-mono font-semibold">
                {currentStudent.percentage.toFixed(1)}% ({currentStudent.overallGrade})
              </div>
            </div>
          </div>

          {/* Student Navigation Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveStudentIndex(prev => Math.max(0, prev - 1))}
              disabled={activeStudentIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-slate-800 font-bold">
              Student {activeStudentIndex + 1} of {students.length}
            </span>

            <button
              onClick={() => setActiveStudentIndex(prev => Math.min(students.length - 1, prev + 1))}
              disabled={activeStudentIndex === students.length - 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Subject Marks Entry List (Large Touch Targets for Phone) */}
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
              <span>Subject</span>
              <span>Marks (Max 100)</span>
            </div>

            {currentStudent.subjects.map((sub, sIdx) => {
              return (
                <div
                  key={sIdx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                >
                  {/* Subject Name & Grade */}
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="font-bold text-slate-900 text-sm">
                      {sub.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      sub.status === 'Pass' && sub.marksObtained > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.marksObtained === 0
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sub.grade}
                    </span>
                  </div>

                  {/* Touch Stepper & Direct Numpad Input */}
                  <div className="flex items-center justify-end gap-2">
                    {/* -5 Stepper */}
                    <button
                      type="button"
                      onClick={() => adjustMark(currentStudent.id, sub.subject, -5)}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition-colors shadow-xs"
                      title="Minus 5 marks"
                    >
                      -5
                    </button>

                    {/* Numeric Input */}
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={sub.maxMarks}
                        step="any"
                        value={sub.marksObtained === 0 ? '' : sub.marksObtained}
                        onChange={(e) => handleMarkChange(currentStudent.id, sub.subject, e.target.value)}
                        placeholder="0"
                        className="w-20 sm:w-24 h-10 px-2 text-center text-base sm:text-lg font-black bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                        aria-label={`Enter marks for ${sub.subject}`}
                      />
                      <span className="absolute -top-2 right-2 text-[9px] font-bold text-slate-400 bg-white px-1">
                        /{sub.maxMarks}
                      </span>
                    </div>

                    {/* +5 Stepper */}
                    <button
                      type="button"
                      onClick={() => adjustMark(currentStudent.id, sub.subject, 5)}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition-colors shadow-xs"
                      title="Add 5 marks"
                    >
                      +5
                    </button>

                    {/* Quick Score Chips */}
                    <div className="hidden sm:flex items-center gap-1 ml-1">
                      {[100, 90, 80, 50].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleMarkChange(currentStudent.id, sub.subject, String(val))}
                          className="px-2 py-1 text-[11px] font-bold rounded bg-slate-200 hover:bg-blue-100 hover:text-blue-700 text-slate-700 transition-colors"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Score Bar & Preview Action */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center justify-around sm:justify-start gap-4 text-xs font-bold text-slate-700">
              <div>
                Total: <span className="text-blue-900 text-sm font-black">{currentStudent.totalObtained}</span> / {currentStudent.totalMax}
              </div>
              <div>
                Percentage: <span className="text-blue-900 text-sm font-black">{currentStudent.percentage.toFixed(1)}%</span>
              </div>
              <div>
                Rank: <span className="text-amber-800 text-sm font-black">#{currentStudent.rank || '-'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPreviewStudent(currentStudent)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Report Card</span>
              </button>

              {activeStudentIndex < students.length - 1 && (
                <button
                  onClick={() => setActiveStudentIndex(prev => prev + 1)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Next Student</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: STACK GRADING BY SUBJECT (RAPID MARK ENTRY FOR A SINGLE EXAM PAPER) */}
      {entryMode === 'stack' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 animate-in fade-in duration-150 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rapid Stack Grading by Subject</h3>
              <p className="text-xs text-slate-500">
                Grade the whole stack of test papers for a chosen subject in one continuous flow.
              </p>
            </div>

            {/* Subject Selector Pill Bar */}
            <div className="flex flex-wrap items-center gap-1.5">
              {currentClassPreset.subjects.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSubject(sub.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSubject === sub.name
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Student Stack List */}
          <div className="space-y-2">
            {students.map((student, idx) => {
              const subMark = student.subjects.find(s => s.subject === selectedSubject);
              const markVal = subMark ? subMark.marksObtained : 0;

              return (
                <div
                  key={student.id}
                  className="p-3 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      #{student.rollNo || idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {student.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {student.admissionNo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={markVal === 0 ? '' : markVal}
                      onChange={(e) => handleMarkChange(student.id, selectedSubject, e.target.value)}
                      placeholder="0"
                      className="w-20 h-10 px-2 text-center text-base font-black bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                      aria-label={`Enter ${selectedSubject} mark for ${student.studentName}`}
                    />
                    <span className={`w-10 text-center py-1 rounded text-xs font-bold ${
                      subMark?.status === 'Pass' && markVal > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : markVal === 0
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {subMark?.grade || '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: CLASS OVERVIEW & GENERATE ALL REPORT CARDS */}
      {entryMode === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Action Header Card */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ready for Instant PDF Generation</span>
              </div>
              <h3 className="text-xl font-bold">
                {currentClassPreset.name} - {currentClassPreset.section}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {gradedCount} of {students.length} students have entered marks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportToExcel}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1.5"
                title="Download spreadsheet of current marks"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() => onBatchExport(students)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                <span>Generate All PDFs (.ZIP)</span>
              </button>
            </div>
          </div>

          {/* Roster Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{student.studentName}</span>
                      {student.rank && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                          #{student.rank}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {student.admissionNo} • Roll #{student.rollNo}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    student.status === 'PASS' && student.totalObtained > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : student.totalObtained === 0
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {student.totalObtained === 0 ? 'Draft' : student.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <span>Score: <strong>{student.totalObtained}/{student.totalMax}</strong> ({student.percentage.toFixed(1)}%)</span>
                  <span>Grade: <strong className="text-blue-700">{student.overallGrade}</strong></span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onPreviewStudent(student)}
                    className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Card</span>
                  </button>
                  <button
                    onClick={() => {
                      const idx = students.findIndex(s => s.id === student.id);
                      if (idx !== -1) {
                        setActiveStudentIndex(idx);
                        setEntryMode('card');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Edit Marks
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Add Student to Preset Roster</h4>
            <form onSubmit={handleAddNewStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Liam Taylor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Father&apos;s Name</label>
                <input
                  type="text"
                  value={newFatherName}
                  onChange={(e) => setNewFatherName(e.target.value)}
                  placeholder="e.g. Richard Taylor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Admission Number *</label>
                <input
                  type="text"
                  required
                  value={newAdmissionNo}
                  onChange={(e) => setNewAdmissionNo(e.target.value)}
                  placeholder="e.g. ADM-10A-09"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
