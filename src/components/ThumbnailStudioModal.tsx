import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Wand2,
  RefreshCw,
  Palette,
  Type,
  Layers,
  Eye,
  AlertCircle,
  TrendingUp,
  Upload,
  Play,
  Share2,
} from 'lucide-react';
import { YouTubeThumbnailConcept } from '../types';

interface ThumbnailStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (promptText: string, imageAttachment?: any) => void;
}

export const ThumbnailStudioModal: React.FC<ThumbnailStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'ideator' | 'studio' | 'analyzer'>('ideator');

  // Ideator State
  const [videoTopic, setVideoTopic] = useState('How I Built a Profitable AI SaaS in 14 Days');
  const [channelNiche, setChannelNiche] = useState('Tech & Coding');
  const [stylePreference, setStylePreference] = useState('High CTR Modern');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [concepts, setConcepts] = useState<YouTubeThumbnailConcept[]>([
    {
      id: 'concept-1',
      titleOption: 'I Built a $10,000/Mo AI SaaS in 14 Days (Step-by-Step)',
      overlayText: '$10K IN 14 DAYS?',
      visualComposition:
        'Left side: Shocked creator face pointing right. Right side: Glowing Stripe revenue dashboard chart spiking dramatically. High contrast dark slate backdrop with neon violet backlight.',
      facialExpression: 'Intense shock/skepticism with mouth slightly open, high direct eye contact.',
      colorPalette: ['#10B981', '#6366F1', '#0F172A', '#FACC15'],
      contrastTip: 'Green revenue chart provides massive pop against dark YouTube player backdrops.',
      estimatedCTRScore: 94,
      hookExplanation:
        'Combines extreme time constraint (14 days) with concrete outcome ($10k) and proof-driven visual chart.',
    },
    {
      id: 'concept-2',
      titleOption: 'Don’t Build AI SaaS Before Watching This',
      overlayText: 'HUGE MISTAKE!',
      visualComposition:
        'Focal object: Red hazard warning sign over a cracked laptop screen. Creator face in deep concern with hand on forehead. Harsh dramatic red & amber rim lighting.',
      facialExpression: 'Concerned, serious cautionary glare looking straight through the screen.',
      colorPalette: ['#EF4444', '#F97316', '#1E293B', '#FFFFFF'],
      contrastTip: 'High-contrast red warning icon immediately halts scroll on mobile feeds.',
      estimatedCTRScore: 91,
      hookExplanation:
        'Leverages loss aversion and fear of missing out (FOMO) to stop creators in their tracks.',
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Studio / Canvas State
  const [headlineText, setHeadlineText] = useState('100 DAYS OF AI');
  const [subText, setSubText] = useState('Zero to $10,000');
  const [bgStyle, setBgStyle] = useState<'gradient-dark' | 'neon-cyber' | 'sunset' | 'emerald' | 'custom'>('gradient-dark');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [accentColor, setAccentColor] = useState('#FACC15');
  const [badgeText, setBadgeText] = useState('CASE STUDY');
  const [showBadge, setShowBadge] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [durationText, setDurationText] = useState('14:20');
  const [fontSize, setFontSize] = useState(48);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Analyzer State
  const [critiqueImage, setCritiqueImage] = useState<string | null>(null);
  const [critiqueTitle, setCritiqueTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  // Auto redraw canvas when studio props change
  useEffect(() => {
    if (activeTab === 'studio' && canvasRef.current) {
      drawThumbnailCanvas();
    }
  }, [
    activeTab,
    headlineText,
    subText,
    bgStyle,
    customBgImage,
    textColor,
    accentColor,
    badgeText,
    showBadge,
    showDuration,
    durationText,
    fontSize,
  ]);

  const handleGenerateIdeas = async () => {
    if (!videoTopic.trim()) return;
    setIsGeneratingIdeas(true);
    try {
      const res = await fetch('/api/creator/thumbnail-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTopic,
          channelNiche,
          stylePreference,
        }),
      });
      const data = await res.json();
      if (data.concepts && Array.isArray(data.concepts) && data.concepts.length > 0) {
        setConcepts(data.concepts);
      }
    } catch (e) {
      console.error('Failed to generate ideas:', e);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const drawThumbnailCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if (customBgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = customBgImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        // Vignette overlay
        const grad = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
        grad.addColorStop(0, 'rgba(0,0,0,0.2)');
        grad.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        drawForeground(ctx, width, height);
      };
      return;
    } else {
      let grad = ctx.createLinearGradient(0, 0, width, height);
      if (bgStyle === 'neon-cyber') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0f0c29');
        grad.addColorStop(0.5, '#302b63');
        grad.addColorStop(1, '#24243e');
      } else if (bgStyle === 'sunset') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#833ab4');
        grad.addColorStop(0.5, '#fd1d1d');
        grad.addColorStop(1, '#fcb045');
      } else if (bgStyle === 'emerald') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.5, '#047857');
        grad.addColorStop(1, '#0f172a');
      } else {
        // gradient-dark
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Add ambient glow circles
      ctx.save();
      const glowGrad = ctx.createRadialGradient(width * 0.75, height * 0.35, 20, width * 0.75, height * 0.35, 400);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      drawForeground(ctx, width, height);
    }
  };

  const drawForeground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 2. Draw Badge (top left)
    if (showBadge && badgeText.trim()) {
      ctx.save();
      ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
      const badgeWidth = ctx.measureText(badgeText.toUpperCase()).width + 44;
      const badgeHeight = 56;
      const bx = 60;
      const by = 60;

      // Badge background pill
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeWidth, badgeHeight, 14);
      ctx.fill();

      // Badge text
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText.toUpperCase(), bx + 22, by + badgeHeight / 2 + 1);
      ctx.restore();
    }

    // 3. Draw Main Headline Text
    ctx.save();
    ctx.font = `900 ${fontSize * 1.6}px system-ui, -apple-system, sans-serif`;
    ctx.textBaseline = 'top';

    const textX = 60;
    const textY = showBadge ? 140 : 80;

    // Text Shadow & Heavy Outline for max CTR legibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    // Stroke
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(headlineText.toUpperCase(), textX, textY);

    // Fill
    ctx.fillStyle = textColor;
    ctx.fillText(headlineText.toUpperCase(), textX, textY);

    // Subtext
    if (subText.trim()) {
      const subY = textY + fontSize * 1.8;
      ctx.font = `800 ${fontSize * 1.0}px system-ui, -apple-system, sans-serif`;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(subText, textX, subY);

      ctx.fillStyle = accentColor;
      ctx.fillText(subText, textX, subY);
    }
    ctx.restore();

    // 4. Draw YouTube Play / Duration Overlay (bottom right)
    if (showDuration) {
      ctx.save();
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      const durWidth = ctx.measureText(durationText).width + 24;
      const durHeight = 40;
      const dx = width - durWidth - 30;
      const dy = height - durHeight - 30;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.beginPath();
      ctx.roundRect(dx, dy, durWidth, durHeight, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'middle';
      ctx.fillText(durationText, dx + 12, dy + durHeight / 2 + 1);
      ctx.restore();
    }
  };

  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      const link = document.createElement('a');
      link.download = `youtube-thumbnail-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyConceptToStudio = (concept: YouTubeThumbnailConcept) => {
    setHeadlineText(concept.overlayText);
    setSubText(concept.titleOption.slice(0, 32));
    if (concept.colorPalette && concept.colorPalette.length > 0) {
      setAccentColor(concept.colorPalette[0]);
    }
    setActiveTab('studio');
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCritiqueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCritiqueImage(reader.result as string);
      setAnalysisResult(null);
      setAnalyzerError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunCritique = async () => {
    if (!critiqueImage) return;
    setIsAnalyzing(true);
    setAnalyzerError(null);
    try {
      const res = await fetch('/api/creator/analyze-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: critiqueImage,
          videoTitle: critiqueTitle,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else if (data.error) {
        setAnalyzerError(data.error);
      }
    } catch (e: any) {
      setAnalyzerError(e.message || 'Failed to analyze thumbnail.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#090D16] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 text-white font-bold">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                  YouTube Thumbnail Creator Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-300 text-[10px] font-bold">
                  HIGH CTR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI visual ideation, 16:9 canvas builder, and psychological CTR analyzer
              </p>
            </div>
          </div>

          <button
            id="btn-close-thumbnail-studio"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-4 sm:px-6">
          <button
            id="tab-thumbnail-ideator"
            onClick={() => setActiveTab('ideator')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ideator'
                ? 'border-red-500 text-red-400 bg-red-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>AI Thumbnail Ideator</span>
          </button>

          <button
            id="tab-thumbnail-studio"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-indigo-400" />
            <span>16:9 Live Canvas Studio</span>
          </button>

          <button
            id="tab-thumbnail-analyzer"
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'analyzer'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>CTR & Pic Critique</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AI THUMBNAIL IDEATOR */}
          {activeTab === 'ideator' && (
            <div className="space-y-6">
              {/* Ideator Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Video Topic or Title Idea</label>
                  <input
                    type="text"
                    value={videoTopic}
                    onChange={(e) => setVideoTopic(e.target.value)}
                    placeholder="e.g., How to Learn Coding in 3 Months, Building a $10k SaaS..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Channel Niche</label>
                  <select
                    value={channelNiche}
                    onChange={(e) => setChannelNiche(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-red-500 cursor-pointer"
                  >
                    <option>Tech & Coding</option>
                    <option>Finance & Crypto</option>
                    <option>Productivity & Study</option>
                    <option>Gaming & Entertainment</option>
                    <option>Storytelling & Documentary</option>
                    <option>Fitness & Lifestyle</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button
                    id="btn-generate-thumbnail-ideas"
                    onClick={handleGenerateIdeas}
                    disabled={isGeneratingIdeas || !videoTopic.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isGeneratingIdeas ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Psychological Hooks...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate High-CTR Concepts</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Concepts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concepts.map((concept, index) => (
                  <div
                    key={concept.id || index}
                    className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold">
                        CONCEPT #{index + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-400">Est. CTR:</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                          {concept.estimatedCTRScore}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Pair with Video Title:
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{concept.titleOption}</h4>
                    </div>

                    {/* Overlay Text Pill */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Thumbnail Overlay Text (Max 3-4 Words):
                        </span>
                        <span className="font-black text-amber-300 text-sm tracking-wide">
                          "{concept.overlayText}"
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyText(concept.overlayText, `overlay-${index}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === `overlay-${index}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Visual Scene */}
                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="font-bold text-red-400 block mb-1">Visual Composition:</span>
                      {concept.visualComposition}
                    </div>

                    {/* Facial expression & color palette */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block font-semibold">Creator Expression:</span>
                        <span className="text-slate-200">{concept.facialExpression}</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block font-semibold mb-1">Color Palette:</span>
                        <div className="flex items-center gap-1.5">
                          {concept.colorPalette?.map((c, ci) => (
                            <span
                              key={ci}
                              className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                      <button
                        onClick={() => handleApplyConceptToStudio(concept)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Open in Canvas Studio →</span>
                      </button>

                      {onSendToChat && (
                        <button
                          onClick={() => {
                            onSendToChat(
                              `Hey Ro! I'm creating a YouTube video titled "${concept.titleOption}". Here is my thumbnail concept: "${concept.overlayText}" with visual scene: "${concept.visualComposition}". Can you help me script the viral 5-second intro hook and outline the full video?`
                            );
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Discuss with Ro</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 16:9 LIVE CANVAS STUDIO */}
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Canvas Preview Area (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Live 16:9 Output Preview</span>
                    <span className="text-[10px] text-slate-500 font-mono">1280 × 720 HD</span>
                  </div>
                  <button
                    id="btn-download-thumbnail"
                    onClick={handleDownloadThumbnail}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>

                {/* Canvas Render Element */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video bg-black flex items-center justify-center">
                  <canvas ref={canvasRef} className="w-full h-full object-cover" />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>CTR Tip:</strong> High-contrast yellow and white texts with heavy black strokes guarantee legibility even on tiny 200px smartphone YouTube app screens.
                  </span>
                </div>
              </div>

              {/* Canvas Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Thumbnail Customizer</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Headline Text (Impactful 2-4 Words)</label>
                  <input
                    type="text"
                    value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)}
                    placeholder="e.g. 100 DAYS OF AI"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sub-headline / Punchline</label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="e.g. Zero to $10,000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:border-indigo-500"
                  />
                </div>

                {/* Badge Options */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Badge Text</label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. NEW, 1M+, PROOF"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Accent Color</label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {['#FACC15', '#EF4444', '#10B981', '#6366F1', '#EC4899'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setAccentColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                            accentColor === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Background Presets & Custom Upload */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block">Background Style</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'gradient-dark', label: 'Dark Violet' },
                      { id: 'neon-cyber', label: 'Cyberpunk' },
                      { id: 'sunset', label: 'Sunset Fire' },
                      { id: 'emerald', label: 'Emerald' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setBgStyle(st.id as any);
                          setCustomBgImage(null);
                        }}
                        className={`p-2 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                          bgStyle === st.id && !customBgImage
                            ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Upload Custom Pic as background */}
                  <div className="pt-2">
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Upload Creator Photo / Backdrop</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setCustomBgImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THUMBNAIL CTR & PIC ANALYZER */}
          {activeTab === 'analyzer' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Upload Draft Thumbnail for AI CTR Score & Critique</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Thumbnail Image File (PNG/JPG)</label>
                    <label className="relative flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-900/80 transition-colors cursor-pointer overflow-hidden group">
                      {critiqueImage ? (
                        <img
                          src={critiqueImage}
                          alt="Uploaded draft thumbnail"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center p-4 space-y-2">
                          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto group-hover:text-emerald-400 transition-colors" />
                          <div className="text-xs font-semibold text-slate-300">
                            Click or Drag thumbnail pic here
                          </div>
                          <div className="text-[11px] text-slate-500">Supports 16:9, PNG, JPG, WebP</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCritiqueUpload}
                      />
                    </label>
                  </div>

                  {/* Title & Submit */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Planned Video Title (Optional for context)
                      </label>
                      <input
                        type="text"
                        value={critiqueTitle}
                        onChange={(e) => setCritiqueTitle(e.target.value)}
                        placeholder="e.g., Why 99% of Developers Fail in 2026"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Ro will evaluate text-to-image contrast, curiosity gap, facial expressions, and mobile feed legibility.
                      </p>
                    </div>

                    <button
                      id="btn-run-thumbnail-critique"
                      onClick={handleRunCritique}
                      disabled={isAnalyzing || !critiqueImage}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Gemini is analyzing visual heatmaps & CTR...</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          <span>Analyze Thumbnail CTR Score</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Analyzer Results */}
              {analyzerError && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{analyzerError}</span>
                </div>
              )}

              {analysisResult && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI CTR & Visual Hierarchy Evaluation</span>
                    </span>
                    {onSendToChat && (
                      <button
                        onClick={() => {
                          onSendToChat(
                            `Hey Ro, I just ran a critique on my YouTube thumbnail. Here was the analysis:\n\n${analysisResult}\n\nCan you help me rewrite the overlay text and give me 2 alternative title hooks?`
                          );
                          onClose();
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        Continue in Chat with Ro →
                      </button>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {analysisResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
