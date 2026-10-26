import React from 'react';
import {
  GraduationCap,
  Download,
  Settings,
  BookOpen,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Smartphone,
  UploadCloud,
} from 'lucide-react';
import { downloadSampleCsv, downloadSampleExcel } from '../utils/sampleData';

interface NavbarProps {
  onLoadSample: () => void;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  onReset: () => void;
  hasData: boolean;
  schoolName: string;
  activeAppMode: 'teacher-portal' | 'spreadsheet';
  onToggleMode: (mode: 'teacher-portal' | 'spreadsheet') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  onOpenSettings,
  onOpenDocs,
  onReset,
  hasData,
  schoolName,
  activeAppMode,
  onToggleMode,
}) => {
  const [showTemplateDropdown, setShowTemplateDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/10">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ScholarCard
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PDF Generator
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {schoolName}
            </p>
          </div>
        </div>

        {/* Portal Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => onToggleMode('teacher-portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeAppMode === 'teacher-portal'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile phone touch portal for preset names and fast marks entry"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Portal</span>
          </button>

          <button
            onClick={() => onToggleMode('spreadsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeAppMode === 'spreadsheet'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Upload existing Excel or CSV spreadsheet"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel Upload</span>
            <span className="sm:hidden">Excel</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sample Data Quick-load */}
          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="Load demo dataset with 8 students"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Load Sample Data</span>
          </button>

          {/* Template Download Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Download Excel/CSV sample templates"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden md:inline">Download Template</span>
              <span className="md:hidden">Template</span>
            </button>

            {showTemplateDropdown && (
              <div
                className="absolute right-0 mt-2 w-52 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setShowTemplateDropdown(false)}
              >
                <div className="px-3 py-1 border-b border-slate-700/60 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Spreadsheet Templates
                  </p>
                </div>
                <button
                  onClick={() => {
                    downloadSampleExcel();
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/80 flex items-center gap-2.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <div>
                    <div className="font-medium">Excel Format (.xlsx)</div>
                    <div className="text-[10px] text-slate-400">Pre-formatted columns & sample data</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    downloadSampleCsv();
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/80 flex items-center gap-2.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-blue-400" />
                  <div>
                    <div className="font-medium">CSV Format (.csv)</div>
                    <div className="text-[10px] text-slate-400">Lightweight plain text format</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* School Settings */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="Configure School Name, Logo, Session, and Passing Rules"
          >
            <Settings className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Tech Stack & Guide */}
          <button
            onClick={onOpenDocs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors shadow-sm"
            title="View tech stack comparison and local run instructions"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-300" />
            <span className="hidden sm:inline">Stack & Setup</span>
          </button>

          {/* Reset when data loaded */}
          {hasData && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors"
              title="Clear data and upload a new file"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Clear</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
