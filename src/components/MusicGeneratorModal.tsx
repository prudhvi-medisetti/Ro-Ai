import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music,
  Sparkles,
  Play,
  Pause,
  Download,
  Send,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  FileMusic,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';

interface MusicGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string, audioUrl: string) => void;
}

const PRESET_MUSIC_GENRES = [
  {
    genre: 'Lo-Fi Chill Beats',
    prompt: 'Relaxing lo-fi hip hop beat with warm rhodes piano chords, vinyl crackle, mellow bassline, and subtle rain ambiance',
    model: 'lyria-3-clip-preview',
    duration: '30s',
  },
  {
    genre: 'Cinematic Orchestral',
    prompt: 'Epic Hans Zimmer style cinematic orchestral theme with soaring strings, deep brass horns, and thunderous taiko drums',
    model: 'lyria-3-clip-preview',
    duration: '30s',
  },
  {
    genre: 'Cyberpunk Synthwave',
    prompt: 'High-energy retro 80s synthwave track with driving arpeggiated analog synthesizers, neon bass, and punchy drums',
    model: 'lyria-3-pro-preview',
    duration: 'Full Track',
  },
  {
    genre: 'Acoustic Indie Folk',
    prompt: 'Warm fingerpicked acoustic guitar with gentle violin harmonies and soft indie campfire atmosphere',
    model: 'lyria-3-clip-preview',
    duration: '30s',
  },
];

export const MusicGeneratorModal: React.FC<MusicGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [prompt, setPrompt] = useState(
    'Relaxing lo-fi hip hop beat with warm rhodes piano chords, gentle vinyl crackle, and soft bassline for studying'
  );
  const [model, setModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string, customModel?: any) => {
    const finalPrompt = (customPrompt || prompt).trim();
    if (!finalPrompt || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          model: customModel || model,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate music');
      }

      setGeneratedAudioUrl(data.audioUrl);
      setLyrics(data.lyrics || '');
      setTitle(data.title || finalPrompt);
    } catch (err: any) {
      console.error('Music generation error:', err);
      setErrorMessage(err.message || 'Failed to generate music');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current && generatedAudioUrl) {
      audioRef.current = new Audio(generatedAudioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const handleDownload = () => {
    if (!generatedAudioUrl) return;
    const a = document.createElement('a');
    a.href = generatedAudioUrl;
    a.download = `ro-lyria-music-${Date.now()}.wav`;
    a.click();
  };

  return (
    <div
      id="modal-lyria-music-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="modal-lyria-music-card"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#080B13] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 border border-emerald-500/30 flex items-center justify-center text-white shadow-md">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Lyria AI Music Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  {model}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compose original acoustic tracks, lo-fi beats, synthwave, and cinematic themes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls (Left) */}
          <div className="md:col-span-6 space-y-4">
            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Generation Model</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setModel('lyria-3-clip-preview')}
                  className={`p-2 rounded-lg text-left transition-all cursor-pointer ${
                    model === 'lyria-3-clip-preview'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-bold">Lyria Clip (Fast)</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Up to 30s clips & loops</p>
                </button>
                <button
                  onClick={() => setModel('lyria-3-pro-preview')}
                  className={`p-2 rounded-lg text-left transition-all cursor-pointer ${
                    model === 'lyria-3-pro-preview'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-bold">Lyria Pro (Full)</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Full-length tracks & lyrics</p>
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Music Style & Instrument Prompt</span>
                <span className="text-[10px] text-slate-500 font-mono">Lyria 3</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe genre, tempo, instruments, mood, and chords..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-100 placeholder-slate-500 outline-hidden resize-none"
              />
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Sound Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_MUSIC_GENRES.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(g.prompt);
                      setModel(g.model as any);
                    }}
                    className="p-2 rounded-xl text-left bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
                  >
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                      {g.genre}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{g.duration}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-900/30'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Synthesizing Track with Lyria...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compose Music Track</span>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Music Visualizer & Player (Right) */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800/80 p-5 relative min-h-[300px]">
            {isGenerating ? (
              <div className="text-center p-6 space-y-4">
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {[40, 70, 30, 90, 50, 80, 60, 100, 45, 75].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s',
                      }}
                    ></div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Lyria is synthesizing acoustic harmonic waves...
                </p>
              </div>
            ) : generatedAudioUrl ? (
              <div className="w-full flex flex-col justify-between h-full space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{title || 'Generated Track'}</p>
                      <p className="text-xs text-emerald-400 font-mono">{model}</p>
                    </div>
                  </div>

                  {/* Dynamic waveform visualizer bars */}
                  <div className="flex items-center justify-center gap-1 h-16 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const barHeight = isPlaying
                        ? Math.sin(i * 0.5 + Date.now() * 0.005) * 40 + 50
                        : 20 + ((i * 7) % 35);
                      return (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            isPlaying ? 'bg-gradient-to-t from-emerald-500 to-cyan-400' : 'bg-slate-700'
                          }`}
                          style={{ height: `${Math.max(10, Math.min(100, barHeight))}%` }}
                        ></div>
                      );
                    })}
                  </div>

                  {/* Play / Pause button */}
                  <div className="flex items-center justify-center pt-1">
                    <button
                      onClick={handleTogglePlay}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                  </div>
                </div>

                {lyrics && (
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300 max-h-24 overflow-y-auto">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Generated Lyrics</p>
                    <p className="italic">{lyrics}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={handleDownload}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Audio</span>
                  </button>

                  {onSendToChat && (
                    <button
                      onClick={() => {
                        onSendToChat(prompt, generatedAudioUrl);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Chat</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <FileMusic className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Lyria Audio Canvas</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    Select a style or type a prompt to generate original music tracks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
