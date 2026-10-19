import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  AlertCircle,
  Wand2,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { GeneratedImageData } from '../types';

interface GeneratedImageCardProps {
  data: GeneratedImageData;
  isLight: boolean;
  onRegenerate?: (prompt: string, options?: { aspectRatio?: string; style?: string }) => void;
  onOpenLightbox?: (imageUrl: string, title: string) => void;
}

export const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({
  data,
  isLight,
  onRegenerate,
  onOpenLightbox,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const {
    imageUrl,
    prompt,
    revisedPrompt,
    aspectRatio = '1:1',
    style = 'Natural',
    status,
    error,
  } = data;

  const isGenerating = status === 'generating';
  const isError = status === 'error';

  const handleDownload = () => {
    if (!imageUrl) return;
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      const safeName = (prompt || 'generated-image')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 30);
      link.download = `ro-ai-${safeName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopyImage = async () => {
    if (!imageUrl) return;
    try {
      if (imageUrl.startsWith('data:image/')) {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      }
      // Fallback: Copy URL/Data to clipboard
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Secondary fallback
      try {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  // Quick Variation Chips
  const variationChips = [
    { label: '✨ Make it more vibrant', styleMod: 'Vibrant & Colorful' },
    { label: '🎌 Anime Studio Ghibli style', styleMod: 'Anime Studio Ghibli' },
    { label: '📸 Photorealistic 8K', styleMod: 'Photorealistic 8K UHD' },
    { label: '🌆 Cyberpunk Neon', styleMod: 'Cyberpunk Neon Glow' },
    { label: '🎨 Watercolor Painting', styleMod: 'Watercolor Art' },
  ];

  if (isGenerating) {
    return (
      <div
        className={`rounded-2xl p-6 border transition-all relative overflow-hidden ${
          isLight
            ? 'bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/80 border-indigo-200/90 shadow-sm'
            : 'bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-slate-950/80 border-indigo-500/30 shadow-xl'
        }`}
      >
        {/* Animated Background Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
          {/* Pulsing Visual Loader Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-sky-500 to-indigo-600 p-0.5 animate-pulse shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md animate-ping" style={{ animationDuration: '3s' }} />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h4 className={`text-base font-bold flex items-center justify-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              <span>Creating your image...</span>
            </h4>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} italic`}>
              &ldquo;{prompt}&rdquo;
            </p>
          </div>

          {/* Configuration Badges */}
          <div className="flex items-center gap-2 pt-2">
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
              isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}>
              Aspect: {aspectRatio}
            </span>
            {style && style !== 'Natural' && (
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
              }`}>
                Style: {style}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`rounded-2xl p-5 border transition-all ${
          isLight
            ? 'bg-rose-50/80 border-rose-200 text-rose-800'
            : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-bold">Image generation was unable to complete</h4>
            <p className="text-xs opacity-90 leading-relaxed">
              {error || 'The model was unable to synthesize the image for this prompt. Please try modifying your prompt or selecting a different aspect ratio.'}
            </p>
            {prompt && onRegenerate && (
              <button
                onClick={() => onRegenerate(prompt, { aspectRatio, style })}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Generation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!imageUrl) return null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all shadow-lg group/imgcard ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-slate-200/50'
          : 'bg-slate-900/90 border-slate-800 shadow-black/40'
      }`}
    >
      {/* Top Header info bar */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b text-xs ${
        isLight ? 'bg-slate-50/80 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-xs">
            <ImageIcon className="w-3 h-3" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            Generated Image
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
          }`}>
            {aspectRatio}
          </span>
          {style && style !== 'Natural' && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/40 text-indigo-300'
            }`}>
              {style}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowPromptDetails(!showPromptDetails)}
          className={`text-[11px] font-medium transition-colors cursor-pointer ${
            isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
          }`}
        >
          {showPromptDetails ? 'Hide prompt' : 'Show prompt'}
        </button>
      </div>

      {/* Expanded Prompt Details */}
      {showPromptDetails && (
        <div className={`p-3 text-xs border-b ${
          isLight ? 'bg-indigo-50/50 border-indigo-100 text-slate-700' : 'bg-indigo-950/30 border-indigo-900/40 text-slate-300'
        }`}>
          <div className="space-y-1">
            <div className="font-semibold text-[11px] text-indigo-400 uppercase tracking-wide">
              Original Prompt
            </div>
            <p className="italic leading-relaxed">{prompt}</p>
            {revisedPrompt && revisedPrompt !== prompt && (
              <div className="pt-1.5 border-t border-indigo-500/20 mt-1.5">
                <div className="font-semibold text-[11px] text-indigo-400 uppercase tracking-wide">
                  Enhanced AI Prompt
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">{revisedPrompt}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Display Area */}
      <div className="relative overflow-hidden bg-slate-950/90 flex items-center justify-center min-h-[220px] max-h-[560px]">
        <img
          src={imageUrl}
          alt={prompt || 'AI Generated Image'}
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[560px] object-contain cursor-pointer transition-transform duration-300 group-hover/imgcard:scale-[1.005]"
          onClick={() => onOpenLightbox && onOpenLightbox(imageUrl, prompt)}
        />

        {/* Hover Quick Action Floating Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/imgcard:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl">
          <button
            onClick={() => onOpenLightbox && onOpenLightbox(imageUrl, prompt)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Open Fullscreen Lightbox"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Download PNG Image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyImage}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Copy Image / URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Bar: Action Toolbar & Variation Suggestions */}
      <div className={`p-3.5 space-y-3 ${isLight ? 'bg-white' : 'bg-slate-900/80'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Main Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download</span>
            </button>

            <button
              onClick={handleCopyImage}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={() => onRegenerate(prompt, { aspectRatio, style })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-indigo-950/50 hover:bg-indigo-900/70 text-indigo-300 border-indigo-500/30'
                }`}
                title="Regenerate another variation with same prompt"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Regenerate</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onOpenLightbox && onOpenLightbox(imageUrl, prompt)}
            className={`text-xs font-medium flex items-center gap-1 cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full View</span>
          </button>
        </div>

        {/* Quick Style Variation Chips */}
        {onRegenerate && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Wand2 className="w-3 h-3 text-amber-400" />
              <span>Generate variations:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {variationChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    onRegenerate(`${prompt}, ${chip.styleMod}`, {
                      aspectRatio,
                      style: chip.styleMod,
                    })
                  }
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border-slate-200 hover:border-indigo-300'
                      : 'bg-slate-950/60 hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-300 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
