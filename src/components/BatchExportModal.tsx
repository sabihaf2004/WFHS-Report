import React from 'react';
import {
  Archive,
  CheckCircle2,
  Download,
  X,
  FileCheck,
  Sparkles,
} from 'lucide-react';

interface BatchExportModalProps {
  isOpen: boolean;
  isGenerating: boolean;
  currentCount: number;
  totalCount: number;
  currentStudent: string;
  isComplete: boolean;
  zipFileName: string;
  onDownloadAgain: () => void;
  onClose: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  isGenerating,
  currentCount,
  totalCount,
  currentStudent,
  isComplete,
  zipFileName,
  onDownloadAgain,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage = totalCount > 0 ? Math.round((currentCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {!isGenerating && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Status Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          {isComplete ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Archive className="w-9 h-9 animate-bounce" />
            </div>
          )}
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-1">
          {isComplete ? 'Report Cards Packaged Successfully!' : 'Compiling PDF Report Cards'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          {isComplete
            ? `All ${totalCount} individual student PDFs were compiled into a .ZIP archive.`
            : `Generating vector PDFs with school header, marks table, and signatures...`}
        </p>

        {/* Progress Bar & Details */}
        {!isComplete ? (
          <div className="space-y-3 mb-6">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-200 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>
                Processing {currentCount} of {totalCount}
              </span>
              <span className="font-mono text-blue-600">{percentage}%</span>
            </div>
            {currentStudent && (
              <p className="text-xs text-slate-500 truncate italic">
                Current: <strong className="text-slate-700 not-italic">{currentStudent}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left mb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate font-mono">{zipFileName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Includes {totalCount} print-ready individual PDFs</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {isComplete ? (
            <>
              <button
                onClick={onDownloadAgain}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download Again
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Done
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Please keep this tab open while PDFs are being created...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
