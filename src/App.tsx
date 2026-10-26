/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { ValidationBanner } from './components/ValidationBanner';
import { StudentTable } from './components/StudentTable';
import { ReportCardPreviewModal } from './components/ReportCardPreviewModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { EditStudentModal } from './components/EditStudentModal';
import { BatchExportModal } from './components/BatchExportModal';
import { TechStackGuideModal } from './components/TechStackGuideModal';
import { TeacherPortal } from './components/TeacherPortal/TeacherPortal';

import { ParseResult, SchoolSettings, StudentRecord } from './types';
import { DEFAULT_SCHOOL_SETTINGS, parseFileBuffer, parseRawData } from './utils/dataParser';
import { getSampleParsedData } from './utils/sampleData';
import { computeRanks, calculateStudentTotals } from './utils/gradeCalculator';
import { exportReportCardsToZip, triggerBlobDownload } from './utils/zipExporter';

export default function App() {
  const [activeAppMode, setActiveAppMode] = useState<'teacher-portal' | 'spreadsheet'>('teacher-portal');
  const [teacherPortalStudents, setTeacherPortalStudents] = useState<StudentRecord[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIssueFilterActive, setIsIssueFilterActive] = useState(false);

  // Modals state
  const [previewStudent, setPreviewStudent] = useState<StudentRecord | null>(null);
  const [editStudent, setEditStudent] = useState<StudentRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Batch Export ZIP state
  const [batchState, setBatchState] = useState({
    isOpen: false,
    isGenerating: false,
    currentCount: 0,
    totalCount: 0,
    currentStudent: '',
    isComplete: false,
    zipBlob: null as Blob | null,
    zipFileName: '',
  });

  // Handle uploaded spreadsheet file
  const handleFileLoaded = useCallback((buffer: ArrayBuffer, fileName: string) => {
    setIsLoading(true);
    try {
      const result = parseFileBuffer(buffer, fileName, settings);
      setParseResult(result);
      setIsIssueFilterActive(false);
    } catch (err: any) {
      alert(`Error parsing file: ${err?.message || 'Invalid spreadsheet structure'}`);
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  // Load sample demo dataset
  const handleLoadSample = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const result = getSampleParsedData(settings);
      setParseResult(result);
      setIsIssueFilterActive(false);
      setIsLoading(false);
    }, 150);
  }, [settings]);

  // Reset / Clear loaded data
  const handleReset = useCallback(() => {
    setParseResult(null);
    setIsIssueFilterActive(false);
    setPreviewStudent(null);
    setEditStudent(null);
  }, []);

  // Update School Settings and re-evaluate students
  const handleSaveSettings = useCallback((newSettings: SchoolSettings) => {
    setSettings(newSettings);
    if (parseResult && parseResult.records.length > 0) {
      // Re-calculate all student totals and ranks with new threshold / scale
      const updatedRecords = parseResult.records.map(student => {
        const updatedSubjects = student.subjects.map(sub => {
          const max = newSettings.defaultMaxMarks || 100;
          const pct = (sub.marksObtained / max) * 100;
          const status = pct >= newSettings.passingPercentage ? 'Pass' as const : 'Fail' as const;
          return {
            ...sub,
            maxMarks: max,
            status,
          };
        });

        const totals = calculateStudentTotals(updatedSubjects, newSettings.passingPercentage, newSettings.gradingScale);
        return {
          ...student,
          subjects: updatedSubjects,
          totalObtained: totals.totalObtained,
          totalMax: totals.totalMax,
          percentage: totals.percentage,
          overallGrade: totals.overallGrade,
          status: totals.status,
        };
      });

      const ranked = computeRanks(updatedRecords);
      setParseResult({
        ...parseResult,
        records: ranked,
      });

      if (previewStudent) {
        const updatedPreview = ranked.find(s => s.id === previewStudent.id);
        if (updatedPreview) setPreviewStudent(updatedPreview);
      }
    }
  }, [parseResult, previewStudent]);

  // Save an edited student record
  const handleSaveStudent = useCallback((updatedStudent: StudentRecord) => {
    if (!parseResult) return;

    const newRecords = parseResult.records.map(r =>
      r.id === updatedStudent.id ? updatedStudent : r
    );

    const reRanked = computeRanks(newRecords);
    const validCount = reRanked.filter(r => r.isValid).length;
    const errorCount = reRanked.filter(r => !r.isValid).length;

    setParseResult({
      ...parseResult,
      records: reRanked,
      validCount,
      errorCount,
    });

    if (previewStudent && previewStudent.id === updatedStudent.id) {
      setPreviewStudent(updatedStudent);
    }
  }, [parseResult, previewStudent]);

  // Batch Export All PDFs as a ZIP archive
  const handleBatchExport = useCallback(async (customStudents?: StudentRecord[]) => {
    const listToExport = customStudents || parseResult?.records.filter(r => r.isValid) || [];
    if (listToExport.length === 0) {
      alert('No valid student records available to generate report cards.');
      return;
    }

    setBatchState({
      isOpen: true,
      isGenerating: true,
      currentCount: 0,
      totalCount: listToExport.length,
      currentStudent: '',
      isComplete: false,
      zipBlob: null,
      zipFileName: '',
    });

    try {
      const { blob, fileName } = await exportReportCardsToZip({
        students: listToExport,
        settings,
        onProgress: (current, total, studentName) => {
          setBatchState(prev => ({
            ...prev,
            currentCount: current,
            totalCount: total,
            currentStudent: studentName,
          }));
        },
      });

      setBatchState(prev => ({
        ...prev,
        isGenerating: false,
        isComplete: true,
        zipBlob: blob,
        zipFileName: fileName,
      }));

      // Trigger instant browser download of the ZIP file
      triggerBlobDownload(blob, fileName);
    } catch (err: any) {
      alert(`Export failed: ${err?.message || 'Error compiling zip archive'}`);
      setBatchState(prev => ({ ...prev, isOpen: false, isGenerating: false }));
    }
  }, [parseResult, settings]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onLoadSample={handleLoadSample}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onReset={handleReset}
        hasData={Boolean(parseResult && parseResult.records.length > 0)}
        schoolName={settings.schoolName}
        activeAppMode={activeAppMode}
        onToggleMode={(mode) => setActiveAppMode(mode)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeAppMode === 'teacher-portal' ? (
          <TeacherPortal
            settings={settings}
            onPreviewStudent={(std) => setPreviewStudent(std)}
            onBatchExport={(stds) => handleBatchExport(stds)}
            onSyncToMain={(stds) => setTeacherPortalStudents(stds)}
          />
        ) : (
          !parseResult || parseResult.records.length === 0 ? (
            <FileUpload
              onFileLoaded={handleFileLoaded}
              onLoadSample={handleLoadSample}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Validation & Metrics Banner */}
              <ValidationBanner
                parseResult={parseResult}
                onBatchExport={() => handleBatchExport()}
                onFilterIssues={() => setIsIssueFilterActive(!isIssueFilterActive)}
                isIssueFilterActive={isIssueFilterActive}
              />

              {/* Students Table */}
              <StudentTable
                students={parseResult.records}
                settings={settings}
                onPreviewStudent={(std) => setPreviewStudent(std)}
                onEditStudent={(std) => setEditStudent(std)}
                isIssueFilterActive={isIssueFilterActive}
                onResetIssueFilter={() => setIsIssueFilterActive(false)}
              />
            </div>
          )
        )}
      </main>

      {/* Single Report Card Interactive Preview Modal */}
      {previewStudent && (
        <ReportCardPreviewModal
          student={previewStudent}
          allStudents={
            activeAppMode === 'teacher-portal'
              ? (teacherPortalStudents.length > 0 ? teacherPortalStudents : [previewStudent])
              : (parseResult?.records.filter(r => r.isValid) || [previewStudent])
          }
          settings={settings}
          onClose={() => setPreviewStudent(null)}
          onSelectStudent={(std) => setPreviewStudent(std)}
        />
      )}

      {/* Edit Student Record Modal */}
      {editStudent && (
        <EditStudentModal
          student={editStudent}
          settings={settings}
          onSave={handleSaveStudent}
          onClose={() => setEditStudent(null)}
        />
      )}

      {/* School Settings Modal */}
      {isSettingsOpen && (
        <SchoolSettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Batch Export Progress Modal */}
      <BatchExportModal
        isOpen={batchState.isOpen}
        isGenerating={batchState.isGenerating}
        currentCount={batchState.currentCount}
        totalCount={batchState.totalCount}
        currentStudent={batchState.currentStudent}
        isComplete={batchState.isComplete}
        zipFileName={batchState.zipFileName}
        onDownloadAgain={() => {
          if (batchState.zipBlob && batchState.zipFileName) {
            triggerBlobDownload(batchState.zipBlob, batchState.zipFileName);
          }
        }}
        onClose={() => setBatchState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Architecture & Tech Stack Guide Modal */}
      <TechStackGuideModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
