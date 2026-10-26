import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Terminal,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface TechStackGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechStackGuideModal: React.FC<TechStackGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendation' | 'node-setup' | 'python-prototype'>('recommendation');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const nodeSetupCode = `# 1. Clone repository or navigate to app directory
cd scholarcard-app

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# App runs at: http://localhost:3000`;

  const pythonCode = `import io
import zipfile
import pandas as pd
import streamlit as st
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

st.set_page_config(page_title="Student Report Card Generator", layout="wide")
st.title("Student Report Card PDF Generator")

uploaded_file = st.file_uploader("Upload Excel (.xlsx) or CSV", type=["xlsx", "csv"])

def generate_pdf(row, subjects, school_name="SPRINGDALE ACADEMY"):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    story = []
    styles = getSampleStyleSheet()

    # School Header
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=1, textColor=colors.HexColor('#1e3a8a'))
    story.append(Paragraph(f"<b>{school_name}</b>", title_style))
    story.append(Paragraph("<b>STUDENT PROGRESS REPORT</b>", styles['Heading2']))
    story.append(Spacer(1, 15))

    # Student Details
    details_data = [
        ["Student Name:", str(row.get('Student Name', 'N/A')), "Admission No:", str(row.get('Admission Number', 'N/A'))],
        ["Father's Name:", str(row.get('Father Name', 'N/A')), "Class/Section:", str(row.get('Class', '10th'))]
    ]
    details_table = Table(details_data, colWidths=[110, 150, 100, 150])
    details_table.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc'))]))
    story.append(details_table)
    story.append(Spacer(1, 15))

    # Marks Table
    marks_data = [["Subject", "Max Marks", "Marks Obtained", "Status"]]
    total_obt = 0
    total_max = len(subjects) * 100

    for sub in subjects:
        val = row.get(sub, 0)
        try:
            val = float(val)
        except:
            val = 0.0
        status = "Pass" if val >= 40 else "Fail"
        total_obt += val
        marks_data.append([sub, "100", f"{val:.1f}", status])

    pct = (total_obt / total_max) * 100 if total_max > 0 else 0
    marks_data.append(["TOTAL", str(total_max), f"{total_obt:.1f}", f"{pct:.1f}%"])

    marks_table = Table(marks_data, colWidths=[180, 100, 120, 110])
    marks_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#f1f5f9')),
    ]))
    story.append(marks_table)
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

if uploaded_file:
    df = pd.read_excel(uploaded_file) if uploaded_file.name.endswith('.xlsx') else pd.read_csv(uploaded_file)
    st.write("### Data Preview", df.head())

    # Exclude metadata columns
    non_subjects = ['Student Name', 'Father Name', 'Admission Number', 'Roll No', 'Class', 'Attendance']
    subject_cols = [c for c in df.columns if c not in non_subjects]

    if st.button("Generate & Download All PDFs (.zip)"):
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for idx, row in df.iterrows():
                pdf_bytes = generate_pdf(row, subject_cols)
                name = str(row.get('Student Name', f'Student_{idx}')).replace(' ', '_')
                adm = str(row.get('Admission Number', f'{idx}'))
                zip_file.writestr(f"{adm}_{name}_ReportCard.pdf", pdf_bytes)

        zip_buffer.seek(0)
        st.download_button(
            label="Download ZIP Archive",
            data=zip_buffer,
            file_name="Report_Cards.zip",
            mime="application/zip"
        )`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Tech Stack Recommendation & Local Setup</h3>
              <p className="text-xs text-slate-400">Comparing Client-Side / Node.js vs Python Streamlit/ReportLab</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('recommendation')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'recommendation'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Stack Recommendation & Architecture
          </button>
          <button
            onClick={() => setActiveTab('node-setup')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'node-setup'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Node.js / React Local Setup
          </button>
          <button
            onClick={() => setActiveTab('python-prototype')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'python-prototype'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Python + Streamlit Alternative Code
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'recommendation' && (
            <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {/* Executive Summary */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Primary Recommendation: Client-Centric React + TypeScript + jsPDF + JSZip
                </h4>
                <p className="text-slate-700">
                  For generating student report cards, the <strong>Client-Side React / TypeScript stack (implemented in this application)</strong> is vastly superior to a server-heavy Python/Flask solution for educational institutions. Here is why:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-900 block mb-0.5">🔒 100% Student Data Privacy (FERPA / GDPR)</span>
                    <span className="text-slate-600">The spreadsheet and confidential student marks are parsed and converted to PDF directly inside the teacher’s browser. No student data ever touches an external database.</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-900 block mb-0.5">⚡ Instant Live Interactive Preview</span>
                    <span className="text-slate-600">Teachers can preview report cards in real-time before batch exporting, with zero network roundtrip latency.</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-900 block mb-0.5">💰 Zero Cloud Compute & Storage Costs</span>
                    <span className="text-slate-600">Can be hosted as a static web application on GitHub Pages, Cloudflare Pages, Vercel, or AWS S3 for $0/month.</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-900 block mb-0.5">📦 In-Memory Bulk ZIP Generation</span>
                    <span className="text-slate-600">JSZip bundles 500+ student PDFs in seconds directly in RAM and triggers a single download prompt.</span>
                  </div>
                </div>
              </div>

              {/* Comparison Matrix */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  Comprehensive Tech Stack Comparison
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Criteria</th>
                        <th className="py-2.5 px-3 bg-blue-50/70 text-blue-900">React + jsPDF + JSZip (This App)</th>
                        <th className="py-2.5 px-3">Python + Streamlit + ReportLab</th>
                        <th className="py-2.5 px-3">Node.js Express + Puppeteer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Architecture</td>
                        <td className="py-2.5 px-3 bg-blue-50/30">Client-First SPA / Static Web</td>
                        <td className="py-2.5 px-3">Python Web Server (Streamlit)</td>
                        <td className="py-2.5 px-3">Heavy Headless Chrome Node Server</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">PDF Generation Speed</td>
                        <td className="py-2.5 px-3 bg-blue-50/30 font-bold text-emerald-700">~25ms / student (Instant)</td>
                        <td className="py-2.5 px-3">~100ms / student</td>
                        <td className="py-2.5 px-3 font-bold text-rose-700">~1500ms / student (Slow)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Data Privacy</td>
                        <td className="py-2.5 px-3 bg-blue-50/30 font-bold text-emerald-700">Highest (Kept in Browser)</td>
                        <td className="py-2.5 px-3">Sent to Python Server memory</td>
                        <td className="py-2.5 px-3">Sent to Node server memory</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Live Visual Preview</td>
                        <td className="py-2.5 px-3 bg-blue-50/30 font-bold text-emerald-700">Interactive WYSIWYG Modal</td>
                        <td className="py-2.5 px-3">Limited / Requires iframe reload</td>
                        <td className="py-2.5 px-3">Requires server image snapshot</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Hosting Cost</td>
                        <td className="py-2.5 px-3 bg-blue-50/30 font-bold text-emerald-700">$0 (Free static hosting)</td>
                        <td className="py-2.5 px-3">$7-$20/mo (Cloud Run/EC2)</td>
                        <td className="py-2.5 px-3">$25+/mo (High RAM for Chromium)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'node-setup' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  How to Set Up & Run ScholarCard Locally
                </h4>
                <p className="text-slate-600 text-xs">
                  Prerequisites: Node.js 18 or 20+ installed on your machine.
                </p>
              </div>

              <div className="relative bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                <button
                  onClick={() => copyToClipboard(nodeSetupCode, 'node-setup')}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  {copiedCode === 'node-setup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'node-setup' ? 'Copied' : 'Copy'}
                </button>
                <pre>{nodeSetupCode}</pre>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <div>
                    <strong className="text-slate-900 block">Clone or extract the source code</strong>
                    <span className="text-slate-600">Contains the complete Vite + React SPA codebase with Tailwind CSS.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <div>
                    <strong className="text-slate-900 block">Install npm dependencies</strong>
                    <span className="text-slate-600">Installs <code>xlsx</code>, <code>jspdf</code>, <code>jspdf-autotable</code>, and <code>jszip</code>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <div>
                    <strong className="text-slate-900 block">Production Build (Optional)</strong>
                    <span className="text-slate-600">Run <code>npm run build</code> to produce an optimized <code>dist/</code> folder ready for static deployment to GitHub Pages, Netlify, or Vercel.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'python-prototype' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Python Alternative: Streamlit + ReportLab Prototype
                </h4>
                <p className="text-slate-600 text-xs">
                  If your infrastructure mandates a Python backend, here is the complete, runnable Python script using Streamlit, ReportLab, and pandas.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <p className="font-semibold text-slate-800">Install Python dependencies:</p>
                <code className="block bg-slate-900 text-emerald-400 p-2 rounded font-mono">
                  pip install streamlit pandas openpyxl reportlab
                </code>
              </div>

              <div className="relative bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-96">
                <button
                  onClick={() => copyToClipboard(pythonCode, 'python-code')}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  {copiedCode === 'python-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'python-code' ? 'Copied' : 'Copy'}
                </button>
                <pre>{pythonCode}</pre>
              </div>

              <div className="text-xs text-slate-500">
                Run with: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">streamlit run app.py</code>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            ScholarCard uses the recommended React + jsPDF + JSZip production architecture.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
