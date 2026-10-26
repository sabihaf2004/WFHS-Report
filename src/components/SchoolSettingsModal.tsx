import React, { useState } from 'react';
import {
  X,
  Building2,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Percent,
  Calendar,
  Award,
} from 'lucide-react';
import { SchoolSettings } from '../types';
import { DEFAULT_SCHOOL_SETTINGS } from '../utils/dataParser';

interface SchoolSettingsModalProps {
  settings: SchoolSettings;
  onSave: (newSettings: SchoolSettings) => void;
  onClose: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [logoPreview, setLogoPreview] = useState<string | undefined>(settings.logoDataUrl);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logoDataUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(undefined);
    setFormData(prev => ({ ...prev, logoDataUrl: undefined }));
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_SCHOOL_SETTINGS });
    setLogoPreview(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">School Branding & Grading Settings</h3>
              <p className="text-xs text-slate-400">Configure report card header, session, and passing criteria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Logo Upload Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {logoPreview ? (
                <img src={logoPreview} alt="School Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="text-center text-slate-400 p-2">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <span className="text-[10px] uppercase font-bold text-slate-500">Default Crest</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">School Crest or Logo</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a square PNG or JPG file to display on the top-left of each report card.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors">
                  Upload Logo Image
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* School Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                School / Institution Name
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Springdale International Academy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                School Tagline / Motto
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Excellence in Academics & Character"
              />
            </div>
          </div>

          {/* Address & Affiliation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="City, State, Zip"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Affiliation / Accreditation No.
              </label>
              <input
                type="text"
                value={formData.affiliationNo}
                onChange={(e) => setFormData(prev => ({ ...prev, affiliationNo: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. CBSE / AFF / 2025"
              />
            </div>
          </div>

          {/* Academic Session & Exam Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Session / Year
              </label>
              <input
                type="text"
                required
                value={formData.academicSession}
                onChange={(e) => setFormData(prev => ({ ...prev, academicSession: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. 2025 - 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exam / Term Title
              </label>
              <input
                type="text"
                required
                value={formData.termOrExamName}
                onChange={(e) => setFormData(prev => ({ ...prev, termOrExamName: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Annual Assessment (Term - II)"
              />
            </div>
          </div>

          {/* Passing Criteria & Default Max Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Passing Percentage Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="75"
                  required
                  value={formData.passingPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingPercentage: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Students scoring below this percentage or failing any subject will be flagged accordingly.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Default Max Marks Per Subject
              </label>
              <input
                type="number"
                min="10"
                max="500"
                required
                value={formData.defaultMaxMarks}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultMaxMarks: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used as the denominator when computing percentage for each subject (usually 100).
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>

            <div className="flex items-center gap-2">
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
                Save & Recalculate
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
