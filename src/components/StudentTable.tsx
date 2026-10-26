import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Download,
  Edit2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { StudentRecord, SchoolSettings } from '../types';
import { downloadStudentPdf } from '../utils/pdfGenerator';

interface StudentTableProps {
  students: StudentRecord[];
  settings: SchoolSettings;
  onPreviewStudent: (student: StudentRecord) => void;
  onEditStudent: (student: StudentRecord) => void;
  isIssueFilterActive: boolean;
  onResetIssueFilter: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  settings,
  onPreviewStudent,
  onEditStudent,
  isIssueFilterActive,
  onResetIssueFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL' | 'NEEDS IMPROVEMENT'>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'percentage' | 'admission'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Issue filter override
      if (isIssueFilterActive) {
        const hasIssues = !student.isValid || student.validationWarnings.length > 0 || student.validationErrors.length > 0;
        if (!hasIssues) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = student.studentName.toLowerCase().includes(query);
        const matchesAdmission = student.admissionNo.toLowerCase().includes(query);
        const matchesFather = student.fatherName.toLowerCase().includes(query);
        const matchesRoll = student.rollNo?.toLowerCase().includes(query);
        if (!matchesName && !matchesAdmission && !matchesFather && !matchesRoll) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (student.status !== statusFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rank') {
        // If rank is missing (invalid records), put at bottom
        const rankA = a.rank ?? 99999;
        const rankB = b.rank ?? 99999;
        comparison = rankA - rankB;
      } else if (sortBy === 'percentage') {
        comparison = b.percentage - a.percentage;
      } else if (sortBy === 'name') {
        comparison = a.studentName.localeCompare(b.studentName);
      } else if (sortBy === 'admission') {
        comparison = a.admissionNo.localeCompare(b.admissionNo);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [students, searchQuery, statusFilter, sortBy, sortDirection, isIssueFilterActive]);

  const toggleSort = (field: 'rank' | 'name' | 'percentage' | 'admission') => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection(field === 'rank' || field === 'name' || field === 'admission' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, admission no, father..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {isIssueFilterActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Issues Only</span>
              <button
                onClick={onResetIssueFilter}
                className="ml-1 hover:text-amber-950 font-bold"
                title="Clear issue filter"
              >
                ×
              </button>
            </div>
          )}

          {/* Status Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium text-slate-600">
            {(['ALL', 'PASS', 'FAIL', 'NEEDS IMPROVEMENT'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'NEEDS IMPROVEMENT' ? 'Needs Imp.' : tab}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="rank">Sort by Rank</option>
              <option value="percentage">Sort by Percentage</option>
              <option value="name">Sort by Student Name</option>
              <option value="admission">Sort by Admission No</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center cursor-pointer hover:bg-slate-100/60" onClick={() => toggleSort('rank')}>
                Rank
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100/60" onClick={() => toggleSort('name')}>
                Student Details
              </th>
              <th className="py-3 px-4 hidden md:table-cell">
                Subject Performance
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/60" onClick={() => toggleSort('percentage')}>
                Score & %
              </th>
              <th className="py-3 px-4 text-center">
                Overall Result
              </th>
              <th className="py-3 px-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No students match your criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting the search query or status filter.</p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const hasIssues = !student.isValid || student.validationWarnings.length > 0;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      !student.isValid ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      {student.rank ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                          student.rank === 1
                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
                            : student.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : student.rank === 3
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{student.rank}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div>
                          <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5" onClick={() => onPreviewStudent(student)}>
                            <span>{student.studentName}</span>
                            {hasIssues && (
                              <span title={student.validationErrors.concat(student.validationWarnings).join(' | ')}>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="font-mono text-slate-600 bg-slate-100 px-1 rounded">
                              {student.admissionNo}
                            </span>
                            <span>•</span>
                            <span>Father: {student.fatherName}</span>
                            {student.rollNo && (
                              <>
                                <span>•</span>
                                <span>Roll #{student.rollNo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subject Marks Breakdown */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {student.subjects.slice(0, 4).map((sub, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                              sub.status === 'Fail'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                            title={`${sub.subject}: ${sub.marksObtained}/${sub.maxMarks} (${sub.grade})`}
                          >
                            <span className="truncate max-w-[65px]">{sub.subject}</span>
                            <span className="font-bold">{sub.marksObtained}</span>
                          </span>
                        ))}
                        {student.subjects.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{student.subjects.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total & Percentage */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900 text-sm">
                        {student.percentage.toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {student.totalObtained} / {student.totalMax}
                      </div>
                    </td>

                    {/* Result Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        student.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : student.status === 'NEEDS IMPROVEMENT'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {student.status === 'PASS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{student.status}</span>
                        <span className="font-mono text-[11px] opacity-80">({student.overallGrade})</span>
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                        {/* Preview Report Card */}
                        <button
                          onClick={() => onPreviewStudent(student)}
                          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Preview full report card layout"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>

                        {/* Download Single PDF */}
                        <button
                          onClick={() => downloadStudentPdf(student, settings)}
                          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Download individual PDF report card"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit student marks or metadata"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing {filteredStudents.length} of {students.length} students
        </span>
        <span className="hidden sm:inline">
          Click &ldquo;Preview&rdquo; on any row to inspect report card format or &ldquo;Generate All PDFs&rdquo; to batch download.
        </span>
      </div>
    </div>
  );
};
