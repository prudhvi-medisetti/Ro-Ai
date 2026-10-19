import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Send,
  Wand2,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Palette,
  Maximize2,
  Upload,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { RoOfficialLogo } from './RoOfficialLogo';

interface AiImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string, imageUrl?: string) => void;
  onOpenLogoStudio?: () => void;
  initialImageBase64?: string;
}

const PRESET_PROMPTS = [
  {
    title: 'Ro Official 3D Mascot',
    prompt: 'Cute 3D white robot mascot head named Ro with glowing cyan happy eyes, sleek helmet, dark visor, cyber glow, inside neon blue and purple circle, 8k render, octane style',
    ratio: '1:1',
  },
  {
    title: 'Cyberpunk Neon Ro',
    prompt: 'Ro AI mascot in a glowing cyberpunk neon Tokyo street at night, holographic UI hud, volumetric lighting, vivid cyan and magenta reflections, cinematic 4k',
    ratio: '16:9',
  },
  {
    title: 'Minimalist Vector App Icon',
    prompt: 'Minimalist flat vector icon of friendly robot mascot head Ro, bold geometric lines, neon cyan on dark matte obsidian background, modern branding',
    ratio: '1:1',
  },
  {
    title: 'YouTube Creator Banner',
    prompt: 'Futuristic AI creator studio background with holographic screens, high-tech glowing desk setup, purple and cyan ambient LED lights, 16:9 wide banner',
    ratio: '16:9',
  },
  {
    title: 'Anime Mecha Ro',
    prompt: 'Stylized anime chibi robot mascot Ro with oversized expressive digital eyes, metallic pearl armor, dynamic action pose, clean cel-shading',
    ratio: '1:1',
  },
];

export const AiImageGeneratorModal: React.FC<AiImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  onOpenLogoStudio,
  initialImageBase64,
}) => {
  const [tab, setTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState(
    'Cute 3D white robot mascot head named Ro with glowing cyan happy eyes, sleek helmet, dark visor, cyber glow, neon blue and purple ring'
  );
  const [editPrompt, setEditPrompt] = useState(
    'Add a glowing cyberpunk holographic visor and futuristic neon city reflections'
  );
  const [editImageBase64, setEditImageBase64] = useState<string | null>(initialImageBase64 || null);
  const [editMimeType, setEditMimeType] = useState('image/png');

  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [stylePreset, setStylePreset] = useState<string>('3D Cyberpunk');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [promptUsed, setPromptUsed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditImageBase64(event.target?.result as string);
      setEditMimeType(file.type || 'image/png');
      setTab('edit');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = (customPrompt || prompt).trim();
    if (!finalPrompt || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio,
          style: stylePreset,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setPromptUsed(finalPrompt);
      } else {
        setGeneratedImage('fallback-svg');
        setPromptUsed(finalPrompt);
      }
    } catch (err: any) {
      console.error('Image gen error:', err);
      setGeneratedImage('fallback-svg');
      setPromptUsed(finalPrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!editImageBase64 || !editPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: editImageBase64,
          mimeType: editMimeType,
          editPrompt: editPrompt.trim(),
          aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to edit image');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setPromptUsed(`Edited: ${editPrompt.trim()}`);
      }
    } catch (err: any) {
      console.error('Image edit error:', err);
      setErrorMsg(err.message || 'Failed to edit image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;

    if (generatedImage === 'fallback-svg') {
      const svg = document.getElementById('ro-ai-gen-preview-svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ro-generated-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ro-ai-image-${Date.now()}.png`;
    link.click();
  };

  const handleCopyImage = async () => {
    if (!generatedImage) return;
    try {
      if (generatedImage === 'fallback-svg') {
        navigator.clipboard.writeText(promptUsed || prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard.writeText(promptUsed || prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="modal-ai-image-gen-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="modal-ai-image-gen-card"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-indigo-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Wand2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Create & Edit Images</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                  gemini-3.1-flash-image-preview
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate fresh graphics or upload an image to edit with AI instructions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLogoStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLogoStudio();
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Official Brand Kit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 pb-0 flex gap-2 border-b border-slate-800/80 bg-slate-950/50">
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              tab === 'create'
                ? 'border-purple-500 text-purple-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Image</span>
          </button>
          <button
            onClick={() => setTab('edit')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              tab === 'edit'
                ? 'border-purple-500 text-purple-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Edit Existing Image</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls Column (Left) */}
          <div className="md:col-span-6 space-y-4">
            {tab === 'create' ? (
              <>
                {/* Prompt Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Image Prompt</span>
                    <span className="text-[10px] text-slate-500 font-mono">gemini-3.1-flash-image-preview</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder="Describe what you want to generate..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-slate-100 placeholder-slate-500 outline-hidden resize-none"
                  />
                </div>

                {/* Aspect Ratio & Style Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setAspectRatio('1:1')}
                        className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                          aspectRatio === '1:1'
                            ? 'bg-purple-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        1:1
                      </button>
                      <button
                        onClick={() => setAspectRatio('16:9')}
                        className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                          aspectRatio === '16:9'
                            ? 'bg-purple-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        16:9
                      </button>
                      <button
                        onClick={() => setAspectRatio('9:16')}
                        className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                          aspectRatio === '9:16'
                            ? 'bg-purple-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        9:16
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Aesthetic Style</label>
                    <select
                      value={stylePreset}
                      onChange={(e) => setStylePreset(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-hidden"
                    >
                      <option value="3D Cyberpunk">3D Cyberpunk Neon</option>
                      <option value="Minimalist Vector">Minimalist Vector Icon</option>
                      <option value="Hyper-realistic Octane">Hyper-realistic Octane 8K</option>
                      <option value="Anime Mecha">Anime Stylized Mecha</option>
                      <option value="Dark Glossy Glass">Dark Glossy Glassmorphism</option>
                    </select>
                  </div>
                </div>

                {/* Quick Inspiration Prompts */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Quick Ro Brand Presets</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {PRESET_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(p.prompt);
                          setAspectRatio(p.ratio as any);
                          handleGenerate(p.prompt);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-purple-950/40 border border-slate-800/80 hover:border-purple-500/40 transition-colors text-xs flex items-center justify-between group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-200 group-hover:text-purple-300 truncate">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">{p.prompt}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-purple-500/30 group-hover:text-purple-300 shrink-0 font-mono">
                          {p.ratio}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Action Button */}
                <button
                  id="btn-generate-ai-image"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Synthesizing Image with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Generate Image Asset</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Upload Section */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Base Image to Edit</label>
                  {editImageBase64 ? (
                    <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center gap-3">
                      <img
                        src={editImageBase64}
                        alt="Image to edit"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">Image loaded</p>
                        <p className="text-[11px] text-slate-400">Describe what you want to add or change below</p>
                      </div>
                      <button
                        onClick={() => setEditImageBase64(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-950/50 hover:bg-purple-950/10"
                    >
                      <Upload className="w-6 h-6 mx-auto mb-1.5 text-purple-400" />
                      <p className="text-xs font-semibold text-slate-200">Upload image to edit</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WebP supported</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Edit Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Editing Instructions</label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g. Add neon cat ears, change background to a cyberpunk Tokyo street, adjust lighting to golden sunset..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-slate-100 placeholder-slate-500 outline-hidden resize-none"
                  />
                </div>

                {/* Edit Action Button */}
                <button
                  onClick={handleEditImage}
                  disabled={isGenerating || !editImageBase64 || !editPrompt.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Editing Image with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-purple-200" />
                      <span>Apply AI Image Edit</span>
                    </>
                  )}
                </button>
              </>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Preview Column (Right) */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div
              className={`w-full rounded-2xl border border-slate-800 bg-[#060913] flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-2xl ${
                aspectRatio === '16:9'
                  ? 'aspect-video'
                  : aspectRatio === '9:16'
                  ? 'aspect-[9/16] max-h-[380px]'
                  : 'aspect-square'
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-pulse">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white">Synthesizing Creative Canvas...</div>
                    <div className="text-[11px] text-slate-400">Rendering visual composition with gemini-3.1-flash-image-preview</div>
                  </div>
                </div>
              ) : generatedImage ? (
                generatedImage === 'fallback-svg' ? (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <RoOfficialLogo
                      id="ro-ai-gen-preview-svg"
                      size={aspectRatio === '16:9' ? 'lg' : 'xl'}
                      variant="full"
                      glow={true}
                    />
                  </div>
                ) : (
                  <img
                    src={generatedImage}
                    alt={promptUsed || 'Generated graphic'}
                    className="w-full h-full object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                )
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <RoOfficialLogo size="md" variant="icon-only" glow={false} />
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-300">Ready to Generate & Edit</div>
                    <div className="text-[11px] text-slate-500 max-w-xs">
                      Enter a custom prompt or upload an image to edit with gemini-3.1-flash-image-preview.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generated Image Actions */}
            {generatedImage && !isGenerating && (
              <div className="flex items-center gap-2 mt-3 w-full">
                <button
                  onClick={handleDownloadImage}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleCopyImage}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {onSendToChat && (
                  <button
                    onClick={() => {
                      onSendToChat(
                        `Here is a generated graphic: "${promptUsed || prompt}". What do you think?`,
                        generatedImage !== 'fallback-svg' ? generatedImage : undefined
                      );
                      onClose();
                    }}
                    className="py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Ro</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
