import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Eye,
  Check,
  Sparkles,
  Clock,
  BookOpen,
  Share2,
  FileCheck2,
} from 'lucide-react';
import { downloadGeneratedPdf, generatePdfBlob, PdfDocumentOptions } from '../utils/pdfGenerator';

interface PdfDocumentCardProps {
  title: string;
  filename?: string;
  subtitle?: string;
  category?: string;
  duration?: string;
  content: string;
  isLight?: boolean;
}

export const PdfDocumentCard: React.FC<PdfDocumentCardProps> = ({
  title,
  filename,
  subtitle,
  category = 'PDF Document',
  duration,
  content,
  isLight = false,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const cleanTitle = title || 'Document';
  const cleanFilename =
    filename || `${cleanTitle.replace(/[/\\?%*:|"<>]/g, '').trim().replace(/\s+/g, '_')}.pdf`;

  // Estimate word count and read/speech time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedMin = Math.max(1, Math.round(wordCount / 130)); // 130 words per min spoken
  const displayDuration = duration || `${estimatedMin} min speech / read`;

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      downloadGeneratedPdf(content, {
        title: cleanTitle,
        subtitle,
        category,
        duration: displayDuration,
        filename: cleanFilename,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    try {
      const { url } = generatePdfBlob(content, {
        title: cleanTitle,
        subtitle,
        category,
        duration: displayDuration,
        filename: cleanFilename,
      });
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (err) {
      console.error('Failed to preview PDF:', err);
    }
  };

  return (
    <>
      <div
        className={`my-3.5 p-3.5 sm:p-5 rounded-2xl border transition-all shadow-md group w-full max-w-full min-w-0 ${
          isLight
            ? 'bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 border-slate-200/90 text-slate-900 hover:border-indigo-300'
            : 'bg-gradient-to-br from-slate-900/95 via-[#0c111d] to-[#141226] border-slate-700/80 text-slate-100 hover:border-indigo-500/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3.5 min-w-0">
          {/* File Icon & Info */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-rose-500 via-red-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/20">
              <div className="flex flex-col items-center">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-[7.5px] sm:text-[8px] font-black tracking-wider uppercase font-mono mt-0.5 leading-none">
                  PDF
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h4 className="font-bold text-xs sm:text-base truncate tracking-tight text-slate-900 dark:text-slate-100 max-w-[200px] sm:max-w-none">
                  {cleanFilename}
                </h4>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                  PDF
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  {displayDuration}
                </span>
                <span>•</span>
                <span className="shrink-0">{wordCount} words</span>
                <span className="hidden xs:inline">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                  <FileCheck2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={handlePreview}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Preview PDF Document"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 shadow-indigo-500/20'
              }`}
              title="Download Formatted PDF"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PDF Modal Preview if user clicks preview */}
      {previewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[90vh] sm:h-[85vh] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-950 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-md">
                  {cleanFilename}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Download PDF</span>
                  <span className="xs:hidden">Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Iframe View */}
            <div className="flex-1 bg-slate-950">
              <iframe
                src={previewUrl}
                title={cleanTitle}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
