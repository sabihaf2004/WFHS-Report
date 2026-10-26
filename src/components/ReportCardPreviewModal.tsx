import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { StudentRecord, SchoolSettings } from '../types';
import { downloadStudentPdf } from '../utils/pdfGenerator';

interface ReportCardPreviewModalProps {
  student: StudentRecord;
  allStudents: StudentRecord[];
  settings: SchoolSettings;
  onClose: () => void;
  onSelectStudent: (student: StudentRecord) => void;
}

export const ReportCardPreviewModal: React.FC<ReportCardPreviewModalProps> = ({
  student,
  allStudents,
  settings,
  onClose,
  onSelectStudent,
}) => {
  const currentIndex = allStudents.findIndex(s => s.id === student.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allStudents.length - 1 && currentIndex !== -1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onSelectStudent(allStudents[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectStudent(allStudents[currentIndex + 1]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-300">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          {/* Student Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
              title="Previous Student"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={student.id}
              onChange={(e) => {
                const found = allStudents.find(s => s.id === e.target.value);
                if (found) onSelectStudent(found);
              }}
              className="bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px] sm:max-w-xs truncate"
            >
              {allStudents.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {idx + 1}. {s.studentName} ({s.admissionNo})
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
              title="Next Student"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="hidden sm:inline text-xs text-slate-400 font-mono ml-2">
              {currentIndex + 1} of {allStudents.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadStudentPdf(student, settings)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Canvas (Paper Simulation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-200/70">
          {/* Printable A4 Paper Container */}
          <div
            id="printable-report-card"
            className="w-full max-w-[760px] bg-white text-slate-900 shadow-xl rounded-sm p-6 sm:p-8 border-4 border-double border-blue-900 relative transition-all"
            style={{ minHeight: '920px' }}
          >
            {/* Corner Decorative Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600"></div>

            {/* School Header Section */}
            <div className="flex items-center gap-4 border-b pb-4 mb-4 border-slate-200">
              {/* Crest / Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex items-center justify-center shadow-md p-1.5 border border-amber-500/40">
                {settings.logoDataUrl ? (
                  <img
                    src={settings.logoDataUrl}
                    alt="School Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 mb-0.5" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-200">VERITAS</span>
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-blue-900 tracking-wide uppercase font-serif">
                  {settings.schoolName}
                </h2>
                <p className="text-xs italic text-slate-600 mt-0.5 font-medium">
                  {settings.tagline}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {settings.address} • Affiliation No: {settings.affiliationNo}
                </p>
                <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold uppercase tracking-wider">
                  Academic Session: {settings.academicSession}
                </div>
              </div>
            </div>

            {/* Report Card Title Ribbon */}
            <div className="bg-blue-900 text-white py-1.5 px-4 rounded-md text-center mb-4 shadow-xs">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                Official Student Report Card — {settings.termOrExamName}
              </span>
            </div>

            {/* Student Metadata Box */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 mb-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Student Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{student.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Father&apos;s / Guardian Name:</span>
                  <span className="font-semibold text-slate-800">{student.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Admission No:</span>
                  <span className="font-bold text-blue-800 font-mono text-sm">{student.admissionNo}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2.5 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-semibold text-[10px] uppercase mr-1">Class & Section:</span>
                  <span className="font-medium text-slate-800">{student.classSection || settings.classSection}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold text-[10px] uppercase mr-1">Roll Number:</span>
                  <span className="font-medium text-slate-800">{student.rollNo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold text-[10px] uppercase mr-1">Attendance:</span>
                  <span className="font-medium text-slate-800">{student.attendance || '95%'}</span>
                </div>
              </div>
            </div>

            {/* Marks Table */}
            <div className="overflow-hidden border border-slate-200 rounded-lg mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-900 text-white font-bold text-[11px] uppercase tracking-wider text-center">
                    <th className="py-2 px-2.5 w-10">S.No</th>
                    <th className="py-2 px-3 text-left">Subject Name</th>
                    <th className="py-2 px-2 w-20">Max Marks</th>
                    <th className="py-2 px-2 w-24">Marks Obtained</th>
                    <th className="py-2 px-2 w-20">Percentage</th>
                    <th className="py-2 px-2 w-16">Grade</th>
                    <th className="py-2 px-2 w-20">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {student.subjects.map((sub, i) => (
                    <tr
                      key={i}
                      className={
                        sub.status === 'Fail'
                          ? 'bg-rose-50/70 text-rose-900'
                          : i % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/70'
                      }
                    >
                      <td className="py-2 px-2.5 text-center font-mono text-slate-500">{i + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{sub.subject}</td>
                      <td className="py-2 px-2 text-center text-slate-600">{sub.maxMarks}</td>
                      <td className={`py-2 px-2 text-center font-bold ${
                        sub.status === 'Fail' ? 'text-rose-700' : 'text-slate-900'
                      }`}>
                        {sub.marksObtained}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-600">
                        {((sub.marksObtained / (sub.maxMarks || 100)) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 px-2 text-center font-bold">
                        <span className={`px-1.5 py-0.5 rounded ${
                          sub.status === 'Fail' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-bold">
                        <span className={`text-[10px] uppercase font-bold ${
                          sub.status === 'Pass' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td colSpan={2} className="py-2.5 px-3 uppercase tracking-wider text-right">
                      Grand Total & Aggregate:
                    </td>
                    <td className="py-2.5 px-2 text-center">{student.totalMax}</td>
                    <td className="py-2.5 px-2 text-center text-blue-900 text-sm font-extrabold">
                      {student.totalObtained}
                    </td>
                    <td className="py-2.5 px-2 text-center text-blue-900 text-sm font-extrabold">
                      {student.percentage.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-extrabold text-blue-900">
                      {student.overallGrade}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        student.status === 'PASS'
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-rose-200 text-rose-900'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className={`p-3 rounded-lg border text-center ${
                student.status === 'PASS'
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50/70 border-rose-300 text-rose-900'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Overall Result
                </span>
                <span className="text-base font-black flex items-center justify-center gap-1 mt-0.5">
                  {student.status === 'PASS' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {student.status}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Grade & Score
                </span>
                <span className="text-base font-black text-blue-900 mt-0.5 block">
                  {student.percentage.toFixed(1)}% (Grade {student.overallGrade})
                </span>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Class Standing
                </span>
                <span className="text-base font-black text-amber-900 mt-0.5 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 text-amber-700" />
                  {student.rank ? `Rank #${student.rank}` : 'Evaluated'}
                </span>
              </div>
            </div>

            {/* Grading Scale Legend */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 mb-6 text-[10px] text-slate-600">
              <div className="font-bold text-slate-700 uppercase tracking-wider mb-1">
                Grading Scale Key:
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {settings.gradingScale.map((g, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <strong className="text-slate-800">{g.grade}:</strong>
                    <span>≥{g.minPercentage}% ({g.description})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Signatures & Seal Section */}
            <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-200 text-center text-xs">
              <div>
                <div className="h-10 flex items-end justify-center">
                  <div className="w-32 border-b border-slate-400"></div>
                </div>
                <p className="font-bold text-slate-800 mt-1">Class Teacher</p>
                <p className="text-[10px] text-slate-500 italic">Signature & Date</p>
              </div>

              <div>
                <div className="h-10 flex items-end justify-center">
                  <div className="w-32 border-b border-slate-400"></div>
                </div>
                <p className="font-bold text-slate-800 mt-1">Exam Controller</p>
                <p className="text-[10px] text-slate-500 italic">Evaluated & Verified</p>
              </div>

              <div>
                <div className="h-10 flex items-center justify-center">
                  <div className="w-16 h-10 border border-dashed border-slate-300 rounded-full flex items-center justify-center text-[8px] text-slate-400 uppercase font-mono">
                    Seal
                  </div>
                </div>
                <p className="font-bold text-slate-800 mt-1">Principal</p>
                <p className="text-[10px] text-slate-500 italic">Official Seal & Signature</p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-6 pt-3 border-t border-slate-100 text-center text-[9px] text-slate-400">
              Generated by ScholarCard Official Academic System • Document ID: {student.admissionNo}-{student.rollNo || '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
