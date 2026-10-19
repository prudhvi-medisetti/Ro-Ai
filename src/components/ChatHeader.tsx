import React, { useState, useRef, useEffect } from 'react';
import {
  PanelLeft,
  ChevronDown,
  Sparkles,
  Zap,
  Cpu,
  Brain,
  Download,
  Trash2,
  FileText,
  FileDown,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  MoreHorizontal,
  Plus,
  Cake,
  Check,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BotPersona, ChatMessage, UserAccount } from '../types';
import { AVAILABLE_MODELS } from '../data/personas';

interface ChatHeaderProps {
  currentPersona?: BotPersona;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  systemInstruction?: string;
  onOpenPersonaDrawer?: () => void;
  onOpenHistorySidebar?: () => void;
  onNewChat: () => void;
  onClearMessages: () => void;
  useSearchGrounding?: boolean;
  onToggleSearchGrounding?: () => void;
  messageCount: number;
  onExportMarkdown: () => void;
  onExportPdf?: () => void;
  messages: ChatMessage[];
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenThumbnailStudio?: () => void;
  onOpenPrepModules?: () => void;
  onOpenProjectsStudio?: () => void;
  onOpenAutonomousBuilder?: () => void;
  onOpenLogoStudio?: () => void;
  onOpenImageGen?: () => void;
  onOpenVideoStudio?: () => void;
  onOpenMusicStudio?: () => void;
  onOpenHelp?: () => void;
  onOpenUiCustomizer?: () => void;
  onOpenSettings?: () => void;
  onOpenAnalytics?: () => void;
  theme?: 'light' | 'dark' | string;
  onToggleTheme?: () => void;
  isBirthdayToday?: boolean;
  onOpenBirthdayCelebration?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  conversationTitle?: string;
  enableVoiceOutput?: boolean;
  onToggleVoiceOutput?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  onSelectModel,
  onNewChat,
  onClearMessages,
  messageCount,
  onExportMarkdown,
  onExportPdf,
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenAnalytics,
  theme = 'dark',
  onToggleTheme,
  isBirthdayToday = false,
  onOpenBirthdayCelebration,
  sidebarOpen = true,
  onToggleSidebar,
  conversationTitle = 'New chat',
  enableVoiceOutput = false,
  onToggleVoiceOutput,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const modelDropdownRef = useRef<HTMLDivElement | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const isLight = theme === 'light';

  // Handle outside click to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(e.target as Node)
      ) {
        setIsActionsMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find model metadata
  const currentModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel.replace(/-/g, ' '),
    tag: 'General',
    description: 'High intelligence and speed',
  };

  const userInitial = (currentUser?.name || currentUser?.email || 'P')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header
      id="app-chat-header"
      className={`h-14 px-2.5 sm:px-4 flex items-center justify-between border-b shrink-0 z-20 transition-colors select-none ${
        isLight
          ? 'bg-white border-[#E5E5E5] text-[#202123]'
          : 'bg-[#212121] border-[#2A2A2A] text-[#ECECEC]'
      }`}
    >
      {/* Left: Sidebar Toggle, Model Selector & Conversation Title */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 sm:flex-initial">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            aria-label="Toggle navigation drawer"
            className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center ${
              isLight
                ? 'hover:bg-neutral-100 text-neutral-600'
                : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-white'
            }`}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Minimal ChatGPT-Style Model Selector Dropdown */}
        <div className="relative min-w-0" ref={modelDropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer max-w-[125px] xs:max-w-[170px] sm:max-w-none ${
              isLight
                ? 'hover:bg-neutral-100 text-neutral-800'
                : 'hover:bg-[#2A2A2A] text-neutral-200 hover:text-white'
            }`}
          >
            <span className="truncate">{currentModelObj.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </button>

          {/* Model Dropdown Menu */}
          {isModelDropdownOpen && (
            <div
              className={`absolute top-full left-0 mt-1.5 w-64 sm:w-72 max-w-[calc(100vw-2rem)] p-1.5 rounded-xl border shadow-xl z-50 text-xs space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isLight
                  ? 'bg-white border-neutral-200 text-neutral-800'
                  : 'bg-[#1E1E1E] border-[#333333] text-neutral-200'
              }`}
            >
              <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Model Intelligence
              </div>

              {AVAILABLE_MODELS.map((m) => {
                const isSelected = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-indigo-50 text-indigo-900 font-semibold'
                          : 'bg-indigo-950/40 text-indigo-200 font-semibold'
                        : isLight
                        ? 'hover:bg-neutral-100'
                        : 'hover:bg-[#2A2A2A]'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold">{m.name}</span>
                        {m.tag && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-normal ${
                              isSelected
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-neutral-500/20 text-neutral-400'
                            }`}
                          >
                            {m.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-normal leading-tight line-clamp-2">
                        {m.description}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversation Title (Subtle, truncated, tablet & desktop) */}
        {conversationTitle && (
          <span
            className={`hidden md:inline-block text-xs truncate max-w-[180px] lg:max-w-[300px] font-normal ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            · {conversationTitle}
          </span>
        )}
      </div>

      {/* Right: Actions, Analytics, Theme & User Menu */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Birthday Indicator if applicable (desktop & tablet) */}
        {isBirthdayToday && onOpenBirthdayCelebration && (
          <button
            onClick={onOpenBirthdayCelebration}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium transition-colors cursor-pointer animate-pulse shrink-0"
          >
            <Cake className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Birthday Today!</span>
          </button>
        )}

        {/* Persistent Global Voice Output (TTS) Toggle (sm+ desktop/tablet button) */}
        {onToggleVoiceOutput && (
          <button
            onClick={onToggleVoiceOutput}
            title={
              enableVoiceOutput
                ? 'Voice Output: ON (Text-to-Speech active - click to mute)'
                : 'Voice Output: OFF (Click to enable text-to-speech auto-read)'
            }
            aria-label={enableVoiceOutput ? 'Disable Voice Output' : 'Enable Voice Output'}
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              enableVoiceOutput
                ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25'
                : isLight
                ? 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 border border-transparent'
                : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-neutral-200 border border-transparent'
            }`}
          >
            {enableVoiceOutput ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="hidden md:inline text-[11px] font-semibold text-indigo-300">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-neutral-400" />
                <span className="hidden md:inline text-[11px] text-neutral-400">Voice OFF</span>
              </>
            )}
          </button>
        )}

        {/* Theme Toggle Button (sm+ desktop/tablet button) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
            aria-label="Toggle color theme"
            className={`hidden sm:flex p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'hover:bg-neutral-100 text-neutral-600'
                : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-white'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        )}

        {/* Compact Conversation Actions Menu (3-dots) - ALWAYS VISIBLE */}
        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={() => setIsActionsMenuOpen((prev) => !prev)}
            title="Conversation options & more"
            aria-label="More options"
            className={`p-2 rounded-lg transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
              isLight
                ? 'hover:bg-neutral-100 text-neutral-600'
                : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isActionsMenuOpen && (
            <div
              className={`absolute top-full right-0 mt-1.5 w-56 max-w-[calc(100vw-1.5rem)] p-1.5 rounded-xl border shadow-xl z-50 text-xs space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isLight
                  ? 'bg-white border-neutral-200 text-neutral-800'
                  : 'bg-[#1E1E1E] border-[#333333] text-neutral-200'
              }`}
            >
              {/* Voice Output toggle in menu */}
              {onToggleVoiceOutput && (
                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onToggleVoiceOutput();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {enableVoiceOutput ? (
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>Voice Output (TTS)</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      enableVoiceOutput
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : isLight
                        ? 'bg-neutral-200 text-neutral-600'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {enableVoiceOutput ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {/* Theme toggle on mobile */}
              {onToggleTheme && (
                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onToggleTheme();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer sm:hidden ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span>Theme Appearance</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400">
                    {isLight ? 'Light' : 'Dark'}
                  </span>
                </button>
              )}

              {/* Birthday button on mobile if today */}
              {isBirthdayToday && onOpenBirthdayCelebration && (
                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onOpenBirthdayCelebration();
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer sm:hidden text-amber-400 ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <Cake className="w-4 h-4" />
                  <span>Birthday Celebration</span>
                </button>
              )}

              {onOpenAnalytics && (
                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onOpenAnalytics();
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Usage Analytics (D3.js)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onExportMarkdown();
                }}
                disabled={messageCount === 0}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Export as Markdown</span>
              </button>

              {onExportPdf && (
                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onExportPdf();
                  }}
                  disabled={messageCount === 0}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <FileDown className="w-4 h-4 text-emerald-400" />
                  <span>Export as PDF</span>
                </button>
              )}

              <div className={`h-px my-1 ${isLight ? 'bg-neutral-100' : 'bg-[#2A2A2A]'}`} />

              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onClearMessages();
                }}
                disabled={messageCount === 0}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear messages</span>
              </button>
            </div>
          )}
        </div>

        {/* User Account Avatar Trigger */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            title="Account menu"
            aria-label="User account menu"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer hover:ring-2 hover:ring-indigo-400/50 transition-all shrink-0"
          >
            {userInitial}
          </button>

          {isUserMenuOpen && (
            <div
              className={`absolute top-full right-0 mt-1.5 w-56 max-w-[calc(100vw-1.5rem)] p-1.5 rounded-xl border shadow-xl z-50 text-xs space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isLight
                  ? 'bg-white border-neutral-200 text-neutral-800'
                  : 'bg-[#1E1E1E] border-[#333333] text-neutral-200'
              }`}
            >
              <div className="px-2.5 py-1.5 border-b border-neutral-700/20 text-[11px] text-neutral-400 truncate">
                <div className="font-semibold text-neutral-200 truncate">
                  {currentUser?.name || 'Pardhu Pavan'}
                </div>
                <div className="text-[10px] opacity-70 truncate">
                  {currentUser?.email || 'pardhupavan457@gmail.com'}
                </div>
              </div>

              {onOpenAnalytics && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenAnalytics();
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Usage Analytics (D3.js)</span>
                </button>
              )}

              {onOpenSettings && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenSettings();
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Settings</span>
                </button>
              )}

              <div className={`h-px my-1 ${isLight ? 'bg-neutral-100' : 'bg-[#2A2A2A]'}`} />

              {onLogout && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
