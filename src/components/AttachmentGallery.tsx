import React, { useState, useMemo, useEffect } from 'react';
import {
  Image as ImageIcon,
  FileText,
  FileCode,
  Download,
  Copy,
  Check,
  Search,
  Grid,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ArrowUpRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Layers,
  Clock,
  HardDrive,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { ChatMessage, MessageAttachment, MessageRole } from '../types';

export interface GalleryItem {
  attachment: MessageAttachment;
  messageId: string;
  role: MessageRole;
  timestamp: number;
  messageSnippet: string;
}

interface AttachmentGalleryProps {
  messages: ChatMessage[];
  onJumpToMessage: (messageId: string) => void;
  onSendPrompt?: (prompt: string) => void;
  onCloseGalleryView?: () => void;
}

export const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({
  messages,
  onJumpToMessage,
  onSendPrompt,
  onCloseGalleryView,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'code'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'largest' | 'name'>('newest');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Real-time extraction of all attachments across the chat session messages
  const allAttachments = useMemo<GalleryItem[]>(() => {
    const items: GalleryItem[] = [];
    messages.forEach((msg) => {
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((att) => {
          items.push({
            attachment: att,
            messageId: msg.id,
            role: msg.role,
            timestamp: msg.timestamp,
            messageSnippet:
              msg.content.slice(0, 90) + (msg.content.length > 90 ? '...' : '') ||
              (att.isImage ? 'Shared an image' : 'Attached a document'),
          });
        });
      }
    });
    return items;
  }, [messages]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = allAttachments.length;
    const imageCount = allAttachments.filter((i) => i.attachment.isImage).length;
    const docCount = allAttachments.filter(
      (i) =>
        !i.attachment.isImage &&
        !i.attachment.name.match(/\.(ts|js|jsx|tsx|json|html|css|py|java|c|cpp|rs|go)$/i)
    ).length;
    const codeCount = allAttachments.filter((i) =>
      i.attachment.name.match(/\.(ts|js|jsx|tsx|json|html|css|py|java|c|cpp|rs|go)$/i)
    ).length;
    const totalBytes = allAttachments.reduce((sum, i) => sum + (i.attachment.size || 0), 0);

    return { totalCount, imageCount, docCount, codeCount, totalBytes };
  }, [allAttachments]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return allAttachments
      .filter((item) => {
        // Filter by category
        if (filterType === 'images' && !item.attachment.isImage) return false;
        if (filterType === 'documents' && item.attachment.isImage) return false;
        if (filterType === 'code') {
          const isCode = Boolean(
            item.attachment.name.match(/\.(ts|js|jsx|tsx|json|html|css|py|java|c|cpp|rs|go)$/i)
          );
          if (!isCode) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = item.attachment.name.toLowerCase().includes(q);
          const matchesType = item.attachment.type.toLowerCase().includes(q);
          const matchesSnippet = item.messageSnippet.toLowerCase().includes(q);
          if (!matchesName && !matchesType && !matchesSnippet) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.timestamp - a.timestamp;
        if (sortBy === 'oldest') return a.timestamp - b.timestamp;
        if (sortBy === 'largest') return (b.attachment.size || 0) - (a.attachment.size || 0);
        if (sortBy === 'name') return a.attachment.name.localeCompare(b.attachment.name);
        return 0;
      });
  }, [allAttachments, filterType, searchQuery, sortBy]);

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        setZoomLevel(1);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const handleDownload = (item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = item.attachment.dataUrl;
    link.download = item.attachment.name || `attachment-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async (item: GalleryItem) => {
    try {
      if (item.attachment.isImage) {
        const res = await fetch(item.attachment.dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      } else if (item.attachment.textContent) {
        await navigator.clipboard.writeText(item.attachment.textContent);
      } else {
        await navigator.clipboard.writeText(item.attachment.name);
      }
      setCopiedId(item.attachment.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      await navigator.clipboard.writeText(item.attachment.name);
      setCopiedId(item.attachment.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div
      id="attachment-gallery-container"
      className="w-full flex-1 flex flex-col min-h-0 bg-[#080B11] text-slate-200 animate-in fade-in duration-200"
    >
      {/* Header & Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-10 space-y-3.5">
        {/* Top title and quick summary */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Session Attachment Gallery
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold">
                  {stats.totalCount} {stats.totalCount === 1 ? 'file' : 'files'}
                </span>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  • {formatBytes(stats.totalBytes)} total
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse, preview, download, and analyze all images and files in this session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Grid Density Toggle */}
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-0.5">
              <button
                onClick={() => setGridDensity('comfortable')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  gridDensity === 'comfortable'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Comfortable card grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setGridDensity('compact')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  gridDensity === 'compact'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Compact grid view"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Back to Chat View Button */}
            {onCloseGalleryView && (
              <button
                id="btn-close-gallery-view"
                onClick={onCloseGalleryView}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Return to Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills, Search Bar, and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All Files</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {stats.totalCount}
              </span>
            </button>

            <button
              onClick={() => setFilterType('images')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filterType === 'images'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {stats.imageCount}
              </span>
            </button>

            <button
              onClick={() => setFilterType('documents')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filterType === 'documents'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Documents</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {stats.docCount}
              </span>
            </button>

            <button
              onClick={() => setFilterType('code')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filterType === 'code'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code & Data</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {stats.codeCount}
              </span>
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500 outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="largest">Largest Size</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content Area (Auto-adjusts responsive columns in real-time) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
              <Layers className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-200">
              {allAttachments.length === 0
                ? 'No Attachments in this Session'
                : 'No files match your filters'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
              {allAttachments.length === 0
                ? 'Upload images, code scripts, PDFs, or generate AI artwork in chat. All assets will automatically compile here in real-time.'
                : 'Try clearing your search query or switching the category filter above.'}
            </p>
            {allAttachments.length > 0 && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-4 transition-all duration-200 ${
              gridDensity === 'compact'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
            }`}
          >
            {filteredItems.map((item, index) => {
              const { attachment } = item;
              const isCode = Boolean(
                attachment.name.match(/\.(ts|js|jsx|tsx|json|html|css|py|java|c|cpp|rs|go)$/i)
              );

              return (
                <div
                  key={attachment.id || index}
                  id={`gallery-card-${attachment.id}`}
                  className="group relative flex flex-col rounded-2xl bg-[#0C101A] border border-slate-800/90 hover:border-indigo-500/50 transition-all duration-200 shadow-lg hover:shadow-indigo-500/10 overflow-hidden"
                >
                  {/* Media Visual Area */}
                  <div
                    onClick={() => {
                      if (attachment.isImage) {
                        setLightboxIndex(index);
                        setZoomLevel(1);
                      }
                    }}
                    className={`relative w-full overflow-hidden bg-slate-950 flex items-center justify-center ${
                      gridDensity === 'compact' ? 'aspect-square' : 'aspect-video'
                    } ${attachment.isImage ? 'cursor-zoom-in' : 'cursor-default'}`}
                  >
                    {attachment.isImage ? (
                      <>
                        <img
                          src={attachment.dataUrl}
                          alt={attachment.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                          <span className="p-2 rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-indigo-600 transition-colors">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                            isCode
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                              : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400'
                          }`}
                        >
                          {isCode ? (
                            <FileCode className="w-6 h-6" />
                          ) : (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                          {attachment.name.split('.').pop() || 'FILE'}
                        </span>
                      </div>
                    )}

                    {/* Format Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
                        {attachment.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </div>

                    {/* Sender Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-md backdrop-blur-md border text-[10px] font-semibold ${
                          item.role === 'user'
                            ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                            : 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                        }`}
                      >
                        {item.role === 'user' ? 'User' : 'Ro Bot'}
                      </span>
                    </div>
                  </div>

                  {/* Card Info & Actions */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div
                        className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors"
                        title={attachment.name}
                      >
                        {attachment.name}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{formatBytes(attachment.size)}</span>
                        <span>
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleDownload(item)}
                        className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-3 h-3 text-cyan-400" />
                        <span className="hidden sm:inline">Save</span>
                      </button>

                      <button
                        onClick={() => handleCopy(item)}
                        className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === attachment.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-purple-400" />
                        )}
                        <span className="hidden sm:inline">
                          {copiedId === attachment.id ? 'Copied' : 'Copy'}
                        </span>
                      </button>

                      <button
                        onClick={() => onJumpToMessage(item.messageId)}
                        className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Jump to message in chat"
                      >
                        <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                        <span className="hidden sm:inline">Jump</span>
                      </button>
                    </div>

                    {/* Quick Ask AI Prompt */}
                    {onSendPrompt && (
                      <button
                        onClick={() => {
                          onSendPrompt(
                            `Can you analyze the attached file "${attachment.name}" and provide a deep breakdown of its contents?`
                          );
                          if (onCloseGalleryView) onCloseGalleryView();
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-indigo-950/60 to-purple-950/60 hover:from-indigo-900/80 hover:to-purple-900/80 border border-indigo-500/30 text-indigo-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Ask Ro to Analyze</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal (Auto-adjusting Viewport & Keyboard Navigation) */}
      {lightboxIndex !== null && currentLightboxItem && (
        <div
          id="attachment-gallery-lightbox-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          {/* Close button */}
          <button
            onClick={() => {
              setLightboxIndex(null);
              setZoomLevel(1);
            }}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer shadow-xl"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={() => {
              setLightboxIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
              );
              setZoomLevel(1);
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-xl"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              setLightboxIndex((prev) =>
                prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
              );
              setZoomLevel(1);
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-xl"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Main Card */}
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Top Lightbox Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/90 bg-slate-900/70">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="text-xs font-bold text-white truncate max-w-md">
                  {currentLightboxItem.attachment.name}
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {formatBytes(currentLightboxItem.attachment.size)}
                </span>
              </div>

              {/* Zoom and Actions Toolbar */}
              <div className="flex items-center gap-2">
                {currentLightboxItem.attachment.isImage && (
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-300 px-1">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer text-[10px] font-mono"
                      title="Reset Zoom"
                    >
                      1:1
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleDownload(currentLightboxItem)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Lightbox Preview Body */}
            <div className="flex-1 min-h-[360px] max-h-[65vh] p-4 flex items-center justify-center overflow-auto bg-[#04060A]">
              {currentLightboxItem.attachment.isImage ? (
                <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={currentLightboxItem.attachment.dataUrl}
                    alt={currentLightboxItem.attachment.name}
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg transition-transform duration-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : currentLightboxItem.attachment.textContent ? (
                <div className="w-full h-full max-h-[60vh] p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-auto font-mono text-xs text-slate-300 whitespace-pre-wrap">
                  {currentLightboxItem.attachment.textContent}
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-300">
                    Binary or Document File Preview
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    This file format cannot be rendered directly in visual lightbox. Click download to view locally.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Info & Navigation Bar */}
            <div className="px-5 py-3 border-t border-slate-800/90 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-400">
                <span>
                  Uploaded by{' '}
                  <strong className="text-slate-200">
                    {currentLightboxItem.role === 'user' ? 'You' : 'Ro AI'}
                  </strong>
                </span>
                <span>•</span>
                <span>{new Date(currentLightboxItem.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = currentLightboxItem.messageId;
                    setLightboxIndex(null);
                    onJumpToMessage(id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Jump to Message in Chat</span>
                </button>

                {onSendPrompt && (
                  <button
                    onClick={() => {
                      const name = currentLightboxItem.attachment.name;
                      setLightboxIndex(null);
                      onSendPrompt(
                        `Can you provide an analysis and key highlights for "${name}"?`
                      );
                      if (onCloseGalleryView) onCloseGalleryView();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze with Ro</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
