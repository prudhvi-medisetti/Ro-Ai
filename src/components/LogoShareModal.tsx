import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Eye,
  Layers,
  Wand2,
  Code,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { RoOfficialLogo } from './RoOfficialLogo';

interface LogoShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImageGen?: () => void;
}

export const LogoShareModal: React.FC<LogoShareModalProps> = ({
  isOpen,
  onClose,
  onOpenImageGen,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'generate' | 'embed'>('preview');
  const [backgroundType, setBackgroundType] = useState<'dark' | 'transparent' | 'gradient'>('dark');
  const [logoVariant, setLogoVariant] = useState<'full' | 'icon-only'>('full');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  // Helper to convert SVG to Canvas & Download HD PNG
  const handleExportPNG = async (resolution: number = 1024, transparent: boolean = false) => {
    setIsExporting(true);
    try {
      const svgElement = document.getElementById('ro-official-logo-svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = logoVariant === 'icon-only' ? resolution : Math.round((resolution * 620) / 500);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (!transparent) {
          ctx.fillStyle = '#060913';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(blobURL);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const dlUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `ro-ai-assistant-logo-${logoVariant}-${resolution}x${resolution}.png`;
          link.href = dlUrl;
          link.click();
          URL.revokeObjectURL(dlUrl);
          setIsExporting(false);
        }, 'image/png');
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Failed to export PNG:', err);
      setIsExporting(false);
    }
  };

  // Helper to copy high-res image to clipboard
  const handleCopyImageToClipboard = async () => {
    try {
      const svgElement = document.getElementById('ro-official-logo-svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = logoVariant === 'icon-only' ? 1024 : Math.round((1024 * 620) / 500);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(blobURL);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
              }),
            ]);
            setCopiedFormat('image');
            setTimeout(() => setCopiedFormat(null), 2500);
          } catch {
            // fallback
            navigator.clipboard.writeText(window.location.origin);
            setCopiedFormat('link');
            setTimeout(() => setCopiedFormat(null), 2500);
          }
        }, 'image/png');
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  // Native Web Share
  const handleNativeShare = async () => {
    try {
      const svgElement = document.getElementById('ro-official-logo-svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(blobURL);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'ro-ai-chatbot-logo.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Ro - AI Chat Assistant Official Logo',
              text: 'Check out the official logo and brand for Ro AI Chatbot!',
              files: [file],
            });
          } else if (navigator.share) {
            await navigator.share({
              title: 'Ro - AI Chat Assistant Official Logo',
              text: 'Ro - Authentic Human-style AI Companion with High-Yield Tools',
              url: window.location.href,
            });
          } else {
            handleCopyImageToClipboard();
          }
        }, 'image/png');
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // Download SVG
  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('ro-official-logo-svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ro-ai-logo-${logoVariant}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="modal-logo-share-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="modal-logo-share-card"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Ro Official Brand & Logo Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  Official Assets
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Share, download HD vectors, copy to clipboard, or generate custom brand variations
              </p>
            </div>
          </div>

          <button
            id="btn-close-logo-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800/60 bg-slate-950/40">
          <button
            id="tab-logo-preview"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Brand Preview & Share</span>
          </button>

          <button
            id="tab-logo-embed"
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Embed & Badges</span>
          </button>

          <button
            id="tab-logo-generate"
            onClick={() => {
              if (onOpenImageGen) {
                onClose();
                onOpenImageGen();
              } else {
                setActiveTab('generate');
              }
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-purple-400/80 hover:text-purple-300'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Image & Logo Variations</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left Column: Live Render Showcase Canvas */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div
                  id="logo-preview-canvas-box"
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center p-6 border transition-all shadow-2xl relative overflow-hidden group ${
                    backgroundType === 'dark'
                      ? 'bg-[#060913] border-slate-800 shadow-cyan-950/30'
                      : backgroundType === 'gradient'
                      ? 'bg-gradient-to-br from-slate-950 via-[#0D1527] to-[#1E1138] border-indigo-900/50'
                      : 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950/80 border-dashed border-slate-700'
                  }`}
                >
                  <RoOfficialLogo
                    size="hero"
                    variant={logoVariant}
                    glow={true}
                    showSubtitle={true}
                  />

                  {/* Quick Copy Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      onClick={handleCopyImageToClipboard}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Image</span>
                    </button>
                  </div>
                </div>

                {/* Canvas Background & Layout Selectors */}
                <div className="flex items-center justify-between w-full mt-3 px-1 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 mr-1">Backdrop:</span>
                    <button
                      onClick={() => setBackgroundType('dark')}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                        backgroundType === 'dark'
                          ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Cyber Dark
                    </button>
                    <button
                      onClick={() => setBackgroundType('transparent')}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                        backgroundType === 'transparent'
                          ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Transparent
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLogoVariant('full')}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                        logoVariant === 'full'
                          ? 'bg-slate-800 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Full Lockup
                    </button>
                    <button
                      onClick={() => setLogoVariant('icon-only')}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                        logoVariant === 'icon-only'
                          ? 'bg-slate-800 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Icon Only
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Sharing Actions & HD Downloads */}
              <div className="md:col-span-6 space-y-4">
                {/* One-Click Share & Copy Bar */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Instant Sharing</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-share-native-logo"
                      onClick={handleNativeShare}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Logo</span>
                    </button>

                    <button
                      id="btn-copy-logo-image"
                      onClick={handleCopyImageToClipboard}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs transition-all cursor-pointer"
                    >
                      {copiedFormat === 'image' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Copied PNG!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-cyan-400" />
                          <span>Copy Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* High-Resolution HD Export Options */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Export HD Brand Files</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Lossless Quality</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-download-png-1024"
                      onClick={() => handleExportPNG(1024, false)}
                      disabled={isExporting}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                          HD PNG (1024px)
                        </div>
                        <div className="text-[10px] text-slate-400">Cyber Dark BG</div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                    </button>

                    <button
                      id="btn-download-png-transparent"
                      onClick={() => handleExportPNG(1024, true)}
                      disabled={isExporting}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
                          Transparent PNG
                        </div>
                        <div className="text-[10px] text-slate-400">For UI & Avatars</div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                    </button>

                    <button
                      id="btn-download-png-2048"
                      onClick={() => handleExportPNG(2048, false)}
                      disabled={isExporting}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                          Ultra 2K PNG
                        </div>
                        <div className="text-[10px] text-slate-400">2048x2048 Print</div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                    </button>

                    <button
                      id="btn-download-svg"
                      onClick={handleDownloadSVG}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-emerald-300">
                          Vector SVG
                        </div>
                        <div className="text-[10px] text-slate-400">Infinite Scaling</div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                    </button>
                  </div>
                </div>

                {/* Brand Color Specs */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF]" />
                    <span className="text-slate-300">#00F5FF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                    <span className="text-slate-300">#3B82F6</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]" />
                    <span className="text-slate-300">#8B5CF6</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#060913] border border-slate-700" />
                    <span className="text-slate-400">#060913</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-200">GitHub / README Markdown Badge</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`[![Ro AI Chat Assistant](https://img.shields.io/badge/Powered%20By-Ro%20AI-00F0FF?style=for-the-badge&logo=robot&logoColor=black)](${window.location.origin})`}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-300 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `[![Ro AI Chat Assistant](https://img.shields.io/badge/Powered%20By-Ro%20AI-00F0FF?style=for-the-badge&logo=robot&logoColor=black)](${window.location.origin})`
                      );
                      setCopiedFormat('badge');
                      setTimeout(() => setCopiedFormat(null), 2000);
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedFormat === 'badge' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFormat === 'badge' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-200">HTML Website Embed Code</h3>
                <textarea
                  readOnly
                  rows={3}
                  value={`<a href="${window.location.origin}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:#060913;border:1px solid #1E293B;border-radius:12px;color:#fff;text-decoration:none;font-family:sans-serif;font-weight:600;font-size:13px;"><span style="color:#00F5FF;">●</span> Ro AI Chat Assistant</a>`}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-300 select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<a href="${window.location.origin}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:#060913;border:1px solid #1E293B;border-radius:12px;color:#fff;text-decoration:none;font-family:sans-serif;font-weight:600;font-size:13px;"><span style="color:#00F5FF;">●</span> Ro AI Chat Assistant</a>`
                    );
                    setCopiedFormat('html');
                    setTimeout(() => setCopiedFormat(null), 2000);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedFormat === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copiedFormat === 'html' ? 'Copied HTML' : 'Copy HTML Snippet'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950 border border-purple-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/10">
                <Wand2 className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-white">AI Mascot & Graphic Generation Studio</h3>
                <p className="text-xs text-slate-300">
                  Generate new mascot poses, 3D cyberpunk variations, custom avatars, and promotional graphics directly in the app.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenImageGen) onOpenImageGen();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch AI Graphic Generator</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Official High-Resolution Vector Assets</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
