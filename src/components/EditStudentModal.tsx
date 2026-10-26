import React, { useState } from 'react';
import { X, Save, UserCheck, AlertCircle } from 'lucide-react';
import { StudentRecord, SchoolSettings, SubjectMark } from '../types';
import { calculateStudentTotals, calculateSubjectStatus } from '../utils/gradeCalculator';

interface EditStudentModalProps {
  student: StudentRecord;
  settings: SchoolSettings;
  onSave: (updatedStudent: StudentRecord) => void;
  onClose: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  settings,
  onSave,
  onClose,
}) => {
  const [studentName, setStudentName] = useState(student.studentName);
  const [fatherName, setFatherName] = useState(student.fatherName);
  const [admissionNo, setAdmissionNo] = useState(student.admissionNo);
  const [rollNo, setRollNo] = useState(student.rollNo || '');
  const [attendance, setAttendance] = useState(student.attendance || '');
  const [subjects, setSubjects] = useState<SubjectMark[]>([...student.subjects]);
  const [error, setError] = useState<string | null>(null);

  const handleMarkChange = (index: number, val: string) => {
    const updated = [...subjects];
    const num = parseFloat(val);
    const maxMarks = updated[index].maxMarks || settings.defaultMaxMarks || 100;

    const validNum = isNaN(num) ? 0 : Math.max(0, Math.min(num, maxMarks));
    const { status, grade } = calculateSubjectStatus(validNum, maxMarks, settings.passingPercentage);

    updated[index] = {
      ...updated[index],
      marksObtained: validNum,
      grade,
      status,
      error: undefined,
    };
    setSubjects(updated);
  };

  const handleMaxMarkChange = (index: number, val: string) => {
    const updated = [...subjects];
    const num = parseFloat(val);
    const validMax = isNaN(num) || num <= 0 ? 100 : num;

    const { status, grade } = calculateSubjectStatus(updated[index].marksObtained, validMax, settings.passingPercentage);

    updated[index] = {
      ...updated[index],
      maxMarks: validMax,
      grade,
      status,
    };
    setSubjects(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Student name is required.');
      return;
    }
    if (!admissionNo.trim()) {
      setError('Admission number is required.');
      return;
    }

    const totals = calculateStudentTotals(subjects, settings.passingPercentage, settings.gradingScale);

    const updated: StudentRecord = {
      ...student,
      studentName: studentName.trim(),
      fatherName: fatherName.trim(),
      admissionNo: admissionNo.trim(),
      rollNo: rollNo.trim(),
      attendance: attendance.trim(),
      subjects,
      totalObtained: totals.totalObtained,
      totalMax: totals.totalMax,
      percentage: totals.percentage,
      overallGrade: totals.overallGrade,
      status: totals.status,
      isValid: true,
      validationErrors: [],
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Edit Student Record</h3>
              <p className="text-xs text-slate-400">Modify information and subject marks directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Father&apos;s Name
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission No *
              </label>
              <input
                type="text"
                required
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Attendance (Days or %)
            </label>
            <input
              type="text"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
              placeholder="e.g. 96%"
            />
          </div>

          {/* Subject Marks */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Subject Marks Breakdown
            </h4>
            <div className="space-y-2">
              {subjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <span className="font-semibold text-slate-800 flex-1 truncate">
                    {sub.subject}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="text-[11px] text-slate-500">Obt:</label>
                    <input
                      type="number"
                      step="any"
                      value={sub.marksObtained}
                      onChange={(e) => handleMarkChange(idx, e.target.value)}
                      className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      value={sub.maxMarks}
                      onChange={(e) => handleMaxMarkChange(idx, e.target.value)}
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded text-center text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <span className={`px-2 py-1 rounded font-bold text-[11px] ${
                      sub.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sub.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
