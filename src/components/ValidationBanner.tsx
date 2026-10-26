import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Award,
  TrendingUp,
  Archive,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { ParseResult, StudentRecord } from '../types';

interface ValidationBannerProps {
  parseResult: ParseResult;
  onBatchExport: () => void;
  onFilterIssues: () => void;
  isIssueFilterActive: boolean;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  parseResult,
  onBatchExport,
  onFilterIssues,
  isIssueFilterActive,
}) => {
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const { records, issues, validCount, errorCount, totalRows } = parseResult;

  const validRecords = records.filter(r => r.isValid);
  const passedCount = validRecords.filter(r => r.status === 'PASS').length;
  const passRate = validRecords.length > 0 ? ((passedCount / validRecords.length) * 100).toFixed(1) : '0';

  const avgPercentage =
    validRecords.length > 0
      ? (validRecords.reduce((acc, r) => acc + r.percentage, 0) / validRecords.length).toFixed(1)
      : '0';

  const topper = validRecords.reduce<StudentRecord | null>((top, current) => {
    if (!top || current.percentage > top.percentage) return current;
    return top;
  }, null);

  const errorIssues = issues.filter(i => i.severity === 'error');
  const warningIssues = issues.filter(i => i.severity === 'warning');

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
            <p className="text-xl font-bold text-slate-900">{totalRows} Students</p>
          </div>
        </div>

        {/* Valid / Ready */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ready for PDF</p>
            <p className="text-xl font-bold text-emerald-700">{validCount} / {totalRows}</p>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</p>
            <p className="text-xl font-bold text-indigo-900">{passRate}%</p>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Class Average</p>
            <p className="text-xl font-bold text-purple-900">{avgPercentage}%</p>
          </div>
        </div>

        {/* Class Topper */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Class Topper</p>
            <p className="text-sm font-bold text-slate-900 truncate" title={topper?.studentName}>
              {topper ? `${topper.studentName} (${topper.percentage}%)` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Bar & Issue Alert */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Issues summary alert */}
        <div className="flex items-center gap-3">
          {issues.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                errorCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorIssues.length} error{errorIssues.length !== 1 ? 's' : ''}, {warningIssues.length} warning{warningIssues.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setShowIssueDetails(!showIssueDetails)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
              >
                {showIssueDetails ? 'Hide Log' : 'View Log'}
                {showIssueDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onFilterIssues}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isIssueFilterActive
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {isIssueFilterActive ? 'Showing Issues Only (Click to Clear)' : 'Filter Issues Only'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>All student records parsed cleanly without validation errors.</span>
            </div>
          )}
        </div>

        {/* Primary Export Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBatchExport}
            disabled={validCount === 0}
            className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg disabled:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Archive className="w-4 h-4" />
            <span>Generate & Download All PDFs (.ZIP)</span>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-1">
              {validCount} Cards
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Validation Issues Drawer */}
      {showIssueDetails && issues.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600" />
              Data Validation & Diagnostics Report
            </h5>
            <span className="text-xs text-slate-500">
              {issues.length} total notifications
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2.5 border ${
                  issue.severity === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  issue.severity === 'error' ? 'text-rose-600' : 'text-amber-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>Row #{issue.rowNumber}</span>
                    <span>•</span>
                    <span>{issue.studentName} ({issue.admissionNo})</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-black/5 font-mono">
                      {issue.field}
                    </span>
                  </div>
                  <p className="mt-0.5 text-slate-700">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
