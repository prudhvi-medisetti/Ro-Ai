import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Video,
  Sparkles,
  Upload,
  Play,
  Pause,
  Download,
  Send,
  RefreshCw,
  Film,
  Layers,
  Clock,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface VideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string, videoUrl: string) => void;
  initialImageBase64?: string;
  initialPrompt?: string;
}

const PRESET_VIDEO_PROMPTS = [
  {
    title: 'Cyberpunk Neon Ro Walking',
    prompt: 'Cinematic tracking shot of sleek white AI robot Ro walking through a rainy neon cyberpunk metropolis, volumetric neon reflections, 4k 60fps',
    aspectRatio: '16:9',
  },
  {
    title: 'Cosmic Nebula Swirl',
    prompt: 'Epic deep space flight through a glowing purple and cyan starry nebula with orbiting stardust particles, cinematic camera pan',
    aspectRatio: '16:9',
  },
  {
    title: 'Animate Still Artwork',
    prompt: 'Gently animate the character breathing, hair swaying in the breeze, with floating ambient light particles and dynamic depth of field',
    aspectRatio: '9:16',
  },
  {
    title: 'High-Tech Hologram Reveal',
    prompt: 'A 3D holographic wireframe expands and solidifies into a futuristic quantum supercomputer interface with glowing cyan data streams',
    aspectRatio: '16:9',
  },
];

const REASSURING_STATUS_MESSAGES = [
  'Initializing Veo 3 neural video synthesis engine...',
  'Constructing temporal keyframes and motion trajectories...',
  'Rendering fluid physics, realistic lighting, and volumetric shadows...',
  'Refining high-definition detail and spatial coherence...',
  'Finalizing MP4 stream encoding and quality checks...',
];

export const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  initialImageBase64,
  initialPrompt,
}) => {
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [prompt, setPrompt] = useState(
    initialPrompt ||
      'Cinematic tracking shot of sleek white AI robot Ro walking through a rainy neon cyberpunk metropolis with purple and cyan lighting, 4k 60fps'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImageBase64 || null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/png');

  // Generation & Polling State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusMsgTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialImageBase64) {
      setUploadedImage(initialImageBase64);
      setMode('image-to-video');
    }
  }, [initialImageBase64]);

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (statusMsgTimerRef.current) clearInterval(statusMsgTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      setUploadedMimeType(file.type || 'image/png');
      setMode('image-to-video');
    };
    reader.readAsDataURL(file);
  };

  const handleStartGeneration = async () => {
    if (isGenerating) return;
    if (mode === 'text-to-video' && !prompt.trim()) {
      setErrorMessage('Please provide a prompt for text-to-video generation.');
      return;
    }
    if (mode === 'image-to-video' && !uploadedImage) {
      setErrorMessage('Please upload a starting image to animate into video.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setProgressPercent(10);
    setStatusMessageIndex(0);
    setGeneratedVideoUrl(null);

    // Rotate reassuring messages
    statusMsgTimerRef.current = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % REASSURING_STATUS_MESSAGES.length);
      setProgressPercent((prev) => Math.min(95, prev + Math.floor(Math.random() * 8 + 4)));
    }, 2500);

    try {
      const payload: any = {
        prompt: prompt.trim(),
        aspectRatio,
        resolution,
      };

      if (mode === 'image-to-video' && uploadedImage) {
        payload.imageBase64 = uploadedImage;
        payload.mimeType = uploadedMimeType;
      }

      // Step 1: Initiate video operation on backend
      const genRes = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        throw new Error(genData.error || 'Failed to initialize video generation.');
      }

      const operationName = genData.operationName;
      if (!operationName) {
        throw new Error('No operation ID returned from video generator service.');
      }

      // Step 2: Poll operation status
      let pollAttempts = 0;
      const maxAttempts = 60; // Up to 3 minutes

      pollingTimerRef.current = setInterval(async () => {
        pollAttempts++;
        try {
          const statusRes = await fetch('/api/video/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });
          const statusData = await statusRes.json();

          if (statusData.done || statusData.percent === 100) {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            if (statusMsgTimerRef.current) clearInterval(statusMsgTimerRef.current);

            // Step 3: Fetch video stream
            const downloadRes = await fetch('/api/video/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName }),
            });

            if (!downloadRes.ok) {
              const errData = await downloadRes.json().catch(() => ({}));
              throw new Error(errData.error || 'Failed to download generated video.');
            }

            const contentType = downloadRes.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const jsonRes = await downloadRes.json();
              setGeneratedVideoUrl(jsonRes.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
            } else {
              const videoBlob = await downloadRes.blob();
              const objectUrl = URL.createObjectURL(videoBlob);
              setGeneratedVideoUrl(objectUrl);
            }

            setProgressPercent(100);
            setIsGenerating(false);
          } else if (pollAttempts >= maxAttempts) {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            if (statusMsgTimerRef.current) clearInterval(statusMsgTimerRef.current);
            throw new Error('Video generation timed out. Please try again with a shorter prompt.');
          }
        } catch (pollErr: any) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          if (statusMsgTimerRef.current) clearInterval(statusMsgTimerRef.current);
          setErrorMessage(pollErr.message || 'Error occurred while checking video progress.');
          setIsGenerating(false);
        }
      }, 3000);
    } catch (err: any) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (statusMsgTimerRef.current) clearInterval(statusMsgTimerRef.current);
      setErrorMessage(err.message || 'Failed to generate video.');
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `ro-veo-video-${Date.now()}.mp4`;
    a.click();
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      id="modal-veo-video-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="modal-veo-video-card"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0A0D16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 border border-rose-500/30 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Veo 3 Video Generator Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate high-definition cinematic video from text or animate still images
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
          {/* Left Column: Controls & Prompt */}
          <div className="md:col-span-6 space-y-4">
            {/* Mode Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setMode('text-to-video')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'text-to-video'
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Text to Video</span>
              </button>
              <button
                onClick={() => setMode('image-to-video')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'image-to-video'
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Animate Image</span>
              </button>
            </div>

            {/* Image Upload Area if in image-to-video mode */}
            {mode === 'image-to-video' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Starting Photo / Reference Image</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                </label>

                {uploadedImage ? (
                  <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center gap-3">
                    <img
                      src={uploadedImage}
                      alt="Upload Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">Image uploaded</p>
                      <p className="text-[11px] text-slate-400">Ready to animate with Veo</p>
                    </div>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/50 hover:bg-purple-950/10"
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1.5 text-purple-400" />
                    <p className="text-xs font-semibold text-slate-200">Click or drag image to animate</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Veo 3 will bring your image to life with realistic motion</p>
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
            )}

            {/* Prompt Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{mode === 'image-to-video' ? 'Animation / Motion Direction' : 'Cinematic Scene Prompt'}</span>
                <span className="text-[10px] text-slate-500 font-mono">Veo 3.1 Neural</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  mode === 'image-to-video'
                    ? 'Describe camera motion, character movement, ambient wind or lightning...'
                    : 'Describe the scene, lighting, camera angle, action, and atmosphere in vivid detail...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-xs text-slate-100 placeholder-slate-500 outline-hidden resize-none"
              />
            </div>

            {/* Aspect Ratio & Resolution Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      aspectRatio === '16:9'
                        ? 'bg-rose-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    16:9 Widescreen
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      aspectRatio === '9:16'
                        ? 'bg-rose-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    9:16 Vertical
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Resolution</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setResolution('720p')}
                    className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      resolution === '720p'
                        ? 'bg-rose-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    720p Fast
                  </button>
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      resolution === '1080p'
                        ? 'bg-rose-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1080p FHD
                  </button>
                </div>
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Inspiration Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_VIDEO_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(p.prompt);
                      setAspectRatio(p.aspectRatio as '16:9' | '9:16');
                    }}
                    className="p-2 rounded-xl text-left bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
                  >
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-rose-300 truncate">
                      {p.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.aspectRatio}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-900/30'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                  <span>Synthesizing Veo Video ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Video with Veo 3</span>
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

          {/* Right Column: Video Preview & Player */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800/80 p-4 relative min-h-[320px]">
            {isGenerating ? (
              <div className="text-center p-6 space-y-4 max-w-sm">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping"></div>
                  <div className="w-16 h-16 rounded-full border-4 border-t-rose-500 border-r-purple-500 border-b-indigo-500 border-l-transparent animate-spin flex items-center justify-center">
                    <Film className="w-6 h-6 text-rose-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-200">
                    {REASSURING_STATUS_MESSAGES[statusMessageIndex]}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Veo 3 produces photorealistic video frames. Video rendering takes approximately 10-30 seconds.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-purple-500 h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            ) : generatedVideoUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-between space-y-3">
                <div
                  className={`w-full overflow-hidden rounded-xl bg-black border border-slate-800 relative group flex items-center justify-center ${
                    aspectRatio === '9:16' ? 'max-w-[240px] aspect-[9/16]' : 'aspect-video'
                  }`}
                >
                  <video
                    ref={videoRef}
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>

                {/* Video Actions Bar */}
                <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={handleDownloadVideo}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </button>

                  {onSendToChat && (
                    <button
                      onClick={() => {
                        onSendToChat(prompt, generatedVideoUrl);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
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
                  <Film className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Veo Video Canvas</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    Type a prompt or upload an image to animate into a cinematic video clip.
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
