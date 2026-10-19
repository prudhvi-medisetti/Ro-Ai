import React from 'react';
import {
  SquarePen,
  Search,
  GraduationCap,
  PlaySquare,
  Image as ImageIcon,
  MessageSquare,
  FolderGit2,
  Settings,
  Sun,
  Moon,
  Palette,
  Video,
  Music,
  Sparkles,
  Bot,
  Terminal,
} from 'lucide-react';
import { UserAccount } from '../types';
import { RoLogo } from './RoLogo';

interface LeftNavigationRailProps {
  onNewChat: () => void;
  onOpenHistorySidebar?: () => void;
  onOpenHistory?: () => void;
  onOpenPersonaDrawer: () => void;
  onOpenAutonomousBuilder?: () => void;
  onOpenPrepModules: () => void;
  onOpenProjectsStudio?: () => void;
  onOpenThumbnailStudio: () => void;
  onOpenImageGen: () => void;
  onOpenVideoStudio?: () => void;
  onOpenMusicStudio?: () => void;
  onOpenLogoStudio: () => void;
  onOpenUiCustomizer?: () => void;
  onOpenHelp?: () => void;
  theme: 'light' | 'dark' | string;
  onToggleTheme: () => void;
  currentUser?: UserAccount | null;
  onOpenSettings?: () => void;
  useSearchGrounding: boolean;
  onToggleSearchGrounding: () => void;
  sessionCount?: number;
  currentPersona?: any;
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;
  onLogout?: () => void;
  onExportPdf?: () => void;
  onExportMarkdown?: () => void;
}

export const LeftNavigationRail: React.FC<LeftNavigationRailProps> = ({
  onNewChat,
  onOpenHistorySidebar,
  onOpenHistory,
  onOpenPersonaDrawer,
  onOpenAutonomousBuilder,
  onOpenPrepModules,
  onOpenProjectsStudio,
  onOpenThumbnailStudio,
  onOpenImageGen,
  onOpenVideoStudio,
  onOpenMusicStudio,
  onOpenLogoStudio,
  onOpenUiCustomizer,
  onOpenHelp,
  theme,
  onToggleTheme,
  currentUser,
  onOpenSettings,
  useSearchGrounding,
  onToggleSearchGrounding,
  sessionCount = 0,
}) => {
  const isLight = theme === 'light';
  const handleOpenHistory = onOpenHistorySidebar || onOpenHistory || onOpenPersonaDrawer;

  // Get user initials or first letter
  const userInitial = (currentUser?.name || currentUser?.email || 'P')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <aside
      id="left-navigation-rail"
      aria-label="Navigation sidebar"
      className={`w-14 sm:w-16 shrink-0 flex flex-col items-center justify-between py-4 select-none z-30 transition-colors duration-200 border-r ${
        isLight
          ? 'bg-white border-slate-200 text-slate-700'
          : 'bg-[#0E131F]/90 backdrop-blur-md border-slate-800/80 text-slate-300'
      }`}
    >
      {/* Top Section: Official Ro Logo & Primary Action Icons */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Brand Icon: Ro Official Equalizer Icon */}
        <button
          id="btn-nav-brand-logo"
          onClick={onNewChat}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative group"
          title="Ro AI Companion • Start New Chat"
        >
          <RoLogo size="sm" showText={false} />
          <span className="sr-only">Home / New Chat</span>
        </button>

        <div className={`w-6 h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

        {/* New Chat Button */}
        <button
          id="btn-nav-new-chat"
          onClick={onNewChat}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            isLight
              ? 'hover:bg-slate-100 text-slate-700 hover:text-indigo-600'
              : 'hover:bg-slate-800 text-slate-300 hover:text-indigo-400'
          }`}
          title="New Chat (Ctrl+N)"
        >
          <SquarePen className="w-5 h-5 stroke-[1.8]" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            New Chat
          </span>
        </button>

        {/* Search / Google Grounding Toggle */}
        <button
          id="btn-nav-search-grounding"
          onClick={onToggleSearchGrounding}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            useSearchGrounding
              ? isLight
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/40'
                : 'bg-blue-950/60 text-blue-400 ring-1 ring-blue-500/40'
              : isLight
              ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={useSearchGrounding ? 'Google Live Search Grounding: ON' : 'Turn ON Google Search Grounding'}
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
          {useSearchGrounding && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          )}
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {useSearchGrounding ? 'Search Grounding (Active)' : 'Enable Search Grounding'}
          </span>
        </button>

        {/* Autonomous Project Builder (AI Software Engineer) */}
        {onOpenAutonomousBuilder && (
          <button
            id="btn-nav-autonomous-builder"
            onClick={onOpenAutonomousBuilder}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
              isLight
                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 ring-1 ring-indigo-500/30'
                : 'bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900/60 ring-1 ring-indigo-500/40'
            }`}
            title="Autonomous Project Builder (AI Software Engineer)"
          >
            <Sparkles className="w-5 h-5 stroke-[1.8] text-amber-400" />
            <span className="absolute -top-0.5 -right-0.5 px-1 bg-amber-500 text-[9px] font-extrabold text-slate-950 rounded-full leading-tight shadow-sm">
              AI
            </span>
            <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5 border border-indigo-500/40">
              <span className="font-bold text-amber-300">Autonomous Builder</span>
              <span className="text-[10px] text-slate-400">• Full-Stack Engineer</span>
            </span>
          </button>
        )}

        {/* Student Projects Studio & Senior Dev Mindset */}
        {onOpenProjectsStudio && (
          <button
            id="btn-nav-projects-studio"
            onClick={onOpenProjectsStudio}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
              isLight
                ? 'hover:bg-slate-100 text-indigo-600 hover:text-indigo-700'
                : 'hover:bg-slate-800 text-indigo-400 hover:text-indigo-300'
            }`}
            title="Student Projects Studio (Senior Dev Mode)"
          >
            <FolderGit2 className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5">
              <span>Projects (Senior Dev)</span>
            </span>
          </button>
        )}

        {/* Preparation Modules / Education */}
        <button
          id="btn-nav-prep-modules"
          onClick={onOpenPrepModules}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            isLight
              ? 'hover:bg-slate-100 text-slate-600 hover:text-purple-600'
              : 'hover:bg-slate-800 text-slate-400 hover:text-purple-400'
          }`}
          title="High-Yield Preparation Modules"
        >
          <GraduationCap className="w-5 h-5 stroke-[1.8]" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Prep Modules
          </span>
        </button>

        {/* YouTube Creator Studio */}
        <button
          id="btn-nav-thumbnail-studio"
          onClick={onOpenThumbnailStudio}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            isLight
              ? 'hover:bg-slate-100 text-slate-600 hover:text-red-600'
              : 'hover:bg-slate-800 text-slate-400 hover:text-red-400'
          }`}
          title="YouTube Thumbnail & Creator Studio"
        >
          <PlaySquare className="w-5 h-5 stroke-[1.8]" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            YouTube Studio
          </span>
        </button>

        {/* AI Image & Graphic Studio */}
        <button
          id="btn-nav-image-gen"
          onClick={onOpenImageGen}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            isLight
              ? 'hover:bg-slate-100 text-slate-600 hover:text-indigo-600'
              : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-400'
          }`}
          title="AI Graphic & Logo Generator"
        >
          <ImageIcon className="w-5 h-5 stroke-[1.8]" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Image Studio
          </span>
        </button>

        {/* Veo 3 Video Studio */}
        {onOpenVideoStudio && (
          <button
            id="btn-nav-video-studio"
            onClick={onOpenVideoStudio}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
              isLight
                ? 'hover:bg-slate-100 text-slate-600 hover:text-rose-600'
                : 'hover:bg-slate-800 text-slate-400 hover:text-rose-400'
            }`}
            title="Veo 3 Video Generator & Animator"
          >
            <Video className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Veo Video
            </span>
          </button>
        )}

        {/* Lyria Music Studio */}
        {onOpenMusicStudio && (
          <button
            id="btn-nav-music-studio"
            onClick={onOpenMusicStudio}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
              isLight
                ? 'hover:bg-slate-100 text-slate-600 hover:text-emerald-600'
                : 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
            }`}
            title="Lyria AI Music Studio"
          >
            <Music className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Lyria Music
            </span>
          </button>
        )}

        {/* Saved History Drawer */}
        <button
          id="btn-nav-history"
          onClick={handleOpenHistory}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            isLight
              ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={`Chat History (${sessionCount} sessions)`}
        >
          <MessageSquare className="w-5 h-5 stroke-[1.8]" />
          {sessionCount > 0 && (
            <span
              className={`absolute top-1.5 right-1.5 px-1 py-0.2 rounded-full text-[9px] font-bold ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {sessionCount > 9 ? '9+' : sessionCount}
            </span>
          )}
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            History ({sessionCount})
          </span>
        </button>
      </div>

      {/* Bottom Section: UI Customizer, Theme Switcher, Settings & User Avatar */}
      <div className="flex flex-col items-center gap-2.5 w-full px-2">
        {/* Customise UI & Background Wallpaper Modal Trigger */}
        {onOpenUiCustomizer && (
          <button
            id="btn-nav-customise-ui"
            onClick={onOpenUiCustomizer}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
              isLight
                ? 'hover:bg-slate-100 text-indigo-600'
                : 'hover:bg-slate-800 text-indigo-400'
            }`}
            title="Customise UI, Theme & Wallpapers"
          >
            <Palette className="w-4 h-4 stroke-[1.8]" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Customise UI &amp; Wallpapers
            </span>
          </button>
        )}

        {/* Quick Light / Dark Mode Toggle */}
        <button
          id="btn-nav-theme-toggle"
          onClick={onToggleTheme}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            isLight
              ? 'hover:bg-slate-100 text-amber-600'
              : 'hover:bg-slate-800 text-indigo-400'
          }`}
          title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {isLight ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>

        {/* Persona & System Settings */}
        <button
          id="btn-nav-settings"
          onClick={onOpenSettings || onOpenPersonaDrawer}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            isLight
              ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="ChatGPT / Ro Settings & System Configuration"
        >
          <Settings className="w-4 h-4 stroke-[1.8]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Settings &amp; Preferences
          </span>
        </button>

        {/* User Account Avatar */}
        <button
          id="btn-nav-user-avatar"
          onClick={onOpenSettings || onOpenPersonaDrawer}
          className="w-8 h-8 rounded-full bg-[#334155] text-white font-bold text-xs flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer relative group border border-slate-600"
          title={`Signed in as ${currentUser?.name || currentUser?.email || 'User'}`}
        >
          <span>{userInitial === 'P' ? 'PP' : userInitial}</span>
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {currentUser?.name || 'pardhu pavan'} (Settings)
          </span>
        </button>
      </div>
    </aside>
  );
};

