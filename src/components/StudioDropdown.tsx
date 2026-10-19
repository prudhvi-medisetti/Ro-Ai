import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Play,
  BookOpen,
  FolderGit2,
  Image as ImageIcon,
  Palette,
  Globe,
  Share2,
  ChevronDown,
  Wand2,
  ShieldCheck,
  Zap,
  Video,
  Music,
} from 'lucide-react';
import { RoOfficialLogo } from './RoOfficialLogo';

interface StudioDropdownProps {
  onOpenLogoStudio: () => void;
  onOpenImageGen: () => void;
  onOpenVideoStudio?: () => void;
  onOpenMusicStudio?: () => void;
  onOpenThumbnailStudio: () => void;
  onOpenPrepModules: () => void;
  onOpenProjectsStudio?: () => void;
  onOpenAutonomousBuilder?: () => void;
  useSearchGrounding: boolean;
  onToggleSearchGrounding: () => void;
}

export const StudioDropdown: React.FC<StudioDropdownProps> = ({
  onOpenLogoStudio,
  onOpenImageGen,
  onOpenVideoStudio,
  onOpenMusicStudio,
  onOpenThumbnailStudio,
  onOpenPrepModules,
  onOpenProjectsStudio,
  onOpenAutonomousBuilder,
  useSearchGrounding,
  onToggleSearchGrounding,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sleek, Beautiful Studio & Tools Button */}
      <button
        id="btn-studio-suite-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm group ${
          isOpen
            ? 'bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-slate-900 border-indigo-500/60 text-white shadow-indigo-500/20'
            : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-500/40 text-slate-200'
        }`}
        title="Creation Studio & High-Yield Tools (Logo, Image Gen, YouTube Thumbnails, Prep Hub)"
      >
        <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
          <Sparkles className="w-3 h-3 fill-white text-white" />
        </div>
        <span className="font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
          Studio Hub
        </span>
        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold hidden sm:inline">
          Tools
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Studio Tools Dropdown Card */}
      {isOpen && (
        <div
          id="dropdown-studio-menu"
          className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#0B0F19]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Title */}
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Creative & Growth Suite
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Gemini AI</span>
          </div>

          <div className="space-y-1">
            {/* Tool 1: Ro Official Logo & Brand Assets */}
            <button
              id="btn-tool-logo-studio"
              onClick={() => {
                setIsOpen(false);
                onOpenLogoStudio();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30 transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                    Ro Logo & Brand Assets
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Share logo, download HD vectors, copy PNG
                </p>
              </div>
            </button>

            {/* Tool 2: AI Graphic & Image Generator */}
            <button
              id="btn-tool-image-gen"
              onClick={() => {
                setIsOpen(false);
                onOpenImageGen();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-purple-500/30 transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 group-hover:border-purple-400 transition-all">
                <Wand2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-purple-300">
                    AI Graphic & Mascot Studio
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-semibold">
                    In-App
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Create & edit images with gemini-3.1-flash-image
                </p>
              </div>
            </button>

            {/* Tool 2.5: Veo 3 Video Studio */}
            {onOpenVideoStudio && (
              <button
                id="btn-tool-video-gen"
                onClick={() => {
                  setIsOpen(false);
                  onOpenVideoStudio();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-rose-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 group-hover:border-rose-400 transition-all">
                  <Video className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-rose-300">
                      Veo 3 Video Studio
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono font-semibold">
                      Veo 3.1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Text-to-video & animate images with Veo
                  </p>
                </div>
              </button>
            )}

            {/* Tool 2.6: Lyria Music Studio */}
            {onOpenMusicStudio && (
              <button
                id="btn-tool-music-gen"
                onClick={() => {
                  setIsOpen(false);
                  onOpenMusicStudio();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-emerald-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 group-hover:border-emerald-400 transition-all">
                  <Music className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">
                      Lyria AI Music Studio
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                      Lyria 3
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Generate melodic tracks & soundtracks
                  </p>
                </div>
              </button>
            )}

            {/* Tool 3: YouTube Thumbnail Studio */}
            <button
              id="btn-tool-yt-thumbnails"
              onClick={() => {
                setIsOpen(false);
                onOpenThumbnailStudio();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-red-500/30 transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 group-hover:border-red-400 transition-all">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-red-300">
                    YouTube Thumbnail Studio
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono font-semibold">
                    16:9 Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  AI ideation, CTR critique & banner editor
                </p>
              </div>
            </button>

            {/* Tool 4: Preparation Hub & Blueprints */}
            <button
              id="btn-tool-prep-hub"
              onClick={() => {
                setIsOpen(false);
                onOpenPrepModules();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-indigo-500/30 transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 group-hover:border-indigo-400 transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300">
                    Prep Hub & Blueprints
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono font-semibold">
                    High Yield
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Exam cheatsheets, STAR interview & scripts
                </p>
              </div>
            </button>

            {/* Tool 4.5: Autonomous Project Builder (AI Software Engineer) */}
            {onOpenAutonomousBuilder && (
              <button
                id="btn-tool-autonomous-builder"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAutonomousBuilder();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/40 hover:border-indigo-400 transition-all text-left group cursor-pointer shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-105 group-hover:border-amber-400 transition-all shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4 fill-amber-300/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-200">
                      Autonomous Project Builder
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                      Autonomous
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">
                    Plan, generate, test, debug &amp; live preview full apps
                  </p>
                </div>
              </button>
            )}

            {/* Tool 5: Student Projects Studio (Senior Developer Mode) */}
            {onOpenProjectsStudio && (
              <button
                id="btn-tool-projects-studio"
                onClick={() => {
                  setIsOpen(false);
                  onOpenProjectsStudio();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-emerald-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 group-hover:border-emerald-400 transition-all">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">
                      Student Projects Studio
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                      Senior Dev
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Build real apps with Senior Architect AI guidance
                  </p>
                </div>
              </button>
            )}

            {/* Tool 6: Google Web Search Grounding Toggle */}
            <div className="pt-1.5 mt-1 border-t border-slate-800/80">
              <button
                id="btn-tool-toggle-search"
                onClick={onToggleSearchGrounding}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                  useSearchGrounding
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe
                    className={`w-4 h-4 shrink-0 ${
                      useSearchGrounding ? 'text-indigo-400 animate-pulse' : 'text-slate-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200">
                      Live Web Search Grounding
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {useSearchGrounding ? 'Active • Real-time search enabled' : 'Disabled • Pure model responses'}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                    useSearchGrounding ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      useSearchGrounding ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
