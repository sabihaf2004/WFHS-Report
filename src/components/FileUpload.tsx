import React, { useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileCheck2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { downloadSampleExcel, downloadSampleCsv } from '../utils/sampleData';

interface FileUploadProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileLoaded,
  onLoadSample,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setErrorMsg('Please upload a valid Excel spreadsheet (.xlsx, .xls) or .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        onFileLoaded(buffer, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading uploaded file. Please try again.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          Automated Batch Report Card System
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Transform Excel Spreadsheets into{' '}
          <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
            Print-Ready PDF Report Cards
          </span>
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Upload your class marksheet in <strong className="text-slate-800">.xlsx</strong> or <strong className="text-slate-800">.csv</strong>. 
          The app validates entries, computes totals, percentages, and ranks, and compiles individual PDF report cards ready to download as a <strong className="text-slate-800">.zip</strong> archive.
        </p>
      </div>

      {/* Upload Drop Zone Card */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 shadow-lg scale-[1.01]'
            : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileInputChange}
          className="hidden"
          id="spreadsheet-upload-input"
          aria-label="Upload Excel or CSV spreadsheet"
        />

        <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-blue-50 group-hover:bg-blue-100/80 flex items-center justify-center text-blue-600 transition-colors shadow-inner">
          {isLoading ? (
            <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {isDragging ? 'Drop spreadsheet here to upload' : 'Click to browse or drag & drop spreadsheet'}
        </h3>
        <p className="text-sm text-slate-500 mb-5 max-w-md mx-auto">
          Supports Microsoft Excel (<strong className="font-semibold text-slate-700">.xlsx, .xls</strong>) and Comma-Separated Values (<strong className="font-semibold text-slate-700">.csv</strong>)
        </p>

        {/* Quick action badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Automatic Column Detection
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Instant Data Validation
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
            Bulk ZIP Packaging
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Alternative Options: Demo Dataset & Template Downloads */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Load Demo */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-xl p-4 border border-indigo-100 flex items-center justify-between shadow-xs">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Want to test immediately?
            </h4>
            <p className="text-xs text-indigo-700 mt-0.5">
              Load sample dataset with 8 pre-filled students & 5 subjects
            </p>
          </div>
          <button
            onClick={onLoadSample}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow flex items-center gap-1.5 shrink-0"
          >
            Load Sample Data
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Download Template */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Download Template
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Use as reference to format your own spreadsheet
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadSampleExcel()}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1"
              title="Download Excel spreadsheet template"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              .xlsx
            </button>
            <button
              onClick={() => downloadSampleCsv()}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1"
              title="Download CSV spreadsheet template"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              .csv
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Format Reference Guide */}
      <div className="mt-8 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          Required & Supported Column Formats
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Student Name
            </div>
            <p className="text-slate-500 text-[11px]">
              Headers: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Student Name</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Name</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Candidate Name</code>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Father&apos;s Name
            </div>
            <p className="text-slate-500 text-[11px]">
              Headers: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Father Name</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Father&apos;s Name</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Parent Name</code>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Admission No
            </div>
            <p className="text-slate-500 text-[11px]">
              Headers: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Admission Number</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Adm No</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Roll No</code>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Subject Marks
            </div>
            <p className="text-slate-500 text-[11px]">
              Any additional columns: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Math</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Science</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">English</code>, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
