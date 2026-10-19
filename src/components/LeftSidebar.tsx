import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  FolderGit2,
  BookOpen,
  Settings,
  LogOut,
  ChevronRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  Check,
  X,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  BarChart3,
  User,
  Sparkles,
} from 'lucide-react';
import { ChatSession, UserAccount } from '../types';
import { RoOfficialLogo } from './RoOfficialLogo';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions?: () => void;
  onOpenProjects: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  theme: 'light' | 'dark' | string;
  onToggleTheme: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onOpenProjects,
  onOpenLibrary,
  onOpenSettings,
  onOpenAnalytics,
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuSessionId, setMenuSessionId] = useState<string | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const sessionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
      if (
        sessionMenuRef.current &&
        !sessionMenuRef.current.contains(e.target as Node)
      ) {
        setMenuSessionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          onToggle();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Helper to execute an action and auto-close drawer on mobile
  const handleNavAction = (action: () => void) => {
    action();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase().trim();
    return sessions.filter((s) => s.title.toLowerCase().includes(query));
  }, [sessions, searchQuery]);

  // Group conversations by Today, Yesterday, Previous 7 Days, Older
  const groupedSessions = useMemo(() => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const previous7Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = todayStart - 7 * 86400000;

    filteredSessions.forEach((s) => {
      const time = s.updatedAt || s.createdAt || Date.now();
      if (time >= todayStart) {
        today.push(s);
      } else if (time >= yesterdayStart) {
        yesterday.push(s);
      } else if (time >= sevenDaysStart) {
        previous7Days.push(s);
      } else {
        older.push(s);
      }
    });

    return [
      { label: 'Today', list: today },
      { label: 'Yesterday', list: yesterday },
      { label: 'Previous 7 Days', list: previous7Days },
      { label: 'Older', list: older },
    ].filter((g) => g.list.length > 0);
  }, [filteredSessions]);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setMenuSessionId(null);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(id);
    setMenuSessionId(null);
  };

  const userInitial = (currentUser?.name || currentUser?.email || 'P')
    .trim()
    .charAt(0)
    .toUpperCase();
  const userName = currentUser?.name || 'Pardhu Pavan';

  return (
    <>
      {/* Mobile & Tablet Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onToggle}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        id="app-left-sidebar"
        aria-label="Application sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r select-none h-full ${
          isOpen
            ? 'w-[280px] sm:w-[260px] max-w-[85vw] translate-x-0 shadow-2xl lg:shadow-none'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none'
        } ${
          isLight
            ? 'bg-[#F9F9F9] border-[#E5E5E5] text-[#202123]'
            : 'bg-[#171717] border-[#2A2A2A] text-[#ECECEC]'
        }`}
      >
        {/* Top Header: Logo, Name, Subtitle and Sidebar Collapse button */}
        <div className="p-3.5 pb-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <RoOfficialLogo customSize={24} variant="icon-only" showText={false} className="shrink-0" />
            <div className="min-w-0 flex flex-col">
              <span className="font-semibold text-sm tracking-tight leading-tight truncate">
                RO
              </span>
              <span className={`text-[10px] leading-tight truncate ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Personal AI Assistant
              </span>
            </div>
          </div>

          <button
            onClick={onToggle}
            title="Close sidebar"
            aria-label="Close sidebar drawer"
            className={`p-2 rounded-lg transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
              isLight
                ? 'hover:bg-neutral-200 text-neutral-600'
                : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-white'
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Prominent New Chat Button */}
        <div className="px-3 pt-1 pb-2">
          <button
            id="btn-sidebar-new-chat"
            onClick={() => handleNavAction(onNewSession)}
            className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border shadow-xs min-h-[40px] ${
              isLight
                ? 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                : 'bg-[#212121] hover:bg-[#2A2A2A] border-[#2F2F2F] text-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>New chat</span>
            </div>
            <span className={`text-[10px] font-mono opacity-60 hidden sm:inline ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Ctrl+K
            </span>
          </button>
        </div>

        {/* Main Navigation - ONLY: Chat, Search, Projects, Library */}
        <nav aria-label="Sidebar navigation" className="px-3 py-1 space-y-0.5 shrink-0">
          <button
            onClick={() => {
              handleNavAction(() => {
                if (sessions.length === 0 || !currentSessionId) {
                  onNewSession();
                }
              });
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
              !isSearchActive
                ? isLight
                  ? 'bg-neutral-200/80 text-neutral-900 font-semibold'
                  : 'bg-[#2A2A2A] text-white font-semibold'
                : isLight
                ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-400 hover:bg-[#212121] hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setIsSearchActive((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
              isSearchActive
                ? isLight
                  ? 'bg-neutral-200/80 text-neutral-900'
                  : 'bg-[#2A2A2A] text-white'
                : isLight
                ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-400 hover:bg-[#212121] hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search conversations</span>
            </div>
          </button>

          {/* Inline Search Bar */}
          {isSearchActive && (
            <div className="pt-1 pb-1 px-1">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${
                  isLight ? 'bg-white border-neutral-300' : 'bg-[#1F1F1F] border-[#333333]'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter chat titles..."
                  className="w-full bg-transparent outline-none text-xs text-inherit placeholder-neutral-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-400 hover:text-neutral-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => handleNavAction(onOpenProjects)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
              isLight
                ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-400 hover:bg-[#212121] hover:text-neutral-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>Projects</span>
          </button>

          <button
            onClick={() => handleNavAction(onOpenLibrary)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
              isLight
                ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-400 hover:bg-[#212121] hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Prompt Library</span>
          </button>
        </nav>

        {/* Separator */}
        <div className="px-4 py-2">
          <div className={`h-px w-full ${isLight ? 'bg-neutral-200' : 'bg-[#2A2A2A]'}`} />
        </div>

        {/* Conversation List Grouped by Time */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 py-1 text-xs scrollbar-thin">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 px-2 text-neutral-400">
              <p className="text-xs">No conversations found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-400 hover:underline mt-1 text-[11px]"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.label} className="space-y-1">
                <div
                  className={`px-2 py-1 text-[11px] font-medium tracking-wider uppercase ${
                    isLight ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  {group.label}
                </div>

                <div className="space-y-0.5">
                  {group.list.map((session) => {
                    const isActive = session.id === currentSessionId;
                    const isEditing = editingSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                          isActive
                            ? isLight
                              ? 'bg-neutral-200/90 text-neutral-900 font-medium'
                              : 'bg-[#2A2A2A] text-white font-medium'
                            : isLight
                            ? 'text-neutral-700 hover:bg-neutral-100'
                            : 'text-neutral-300 hover:bg-[#212121]'
                        }`}
                        onClick={() => handleNavAction(() => onSelectSession(session.id))}
                      >
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(session.id, e)}
                            className="flex items-center gap-1.5 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editTitle}
                              autoFocus
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={`w-full bg-transparent px-1.5 py-0.5 text-xs outline-none rounded border ${
                                isLight
                                  ? 'border-indigo-400 text-neutral-900 bg-white'
                                  : 'border-indigo-500 text-white bg-[#1A1A1A]'
                              }`}
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSessionId(null)}
                              className="p-1 text-neutral-400 hover:text-neutral-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <>
                            <span className="truncate flex-1 pr-2 text-xs">
                              {session.title || 'Untitled conversation'}
                            </span>

                            {/* Actions on hover or active */}
                            <div
                              className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
                                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleStartRename(session, e)}
                                title="Rename conversation"
                                className={`p-1 rounded transition-colors ${
                                  isLight ? 'hover:bg-neutral-300 text-neutral-500' : 'hover:bg-[#333333] text-neutral-400 hover:text-neutral-200'
                                }`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(session.id, e)}
                                title="Delete conversation"
                                className={`p-1 rounded transition-colors ${
                                  isLight ? 'hover:bg-neutral-300 text-neutral-500 hover:text-red-600' : 'hover:bg-[#333333] text-neutral-400 hover:text-red-400'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Section: Settings & Account Menu */}
        <div
          className={`p-3 border-t shrink-0 ${
            isLight ? 'border-neutral-200 bg-[#F4F4F4]' : 'border-[#262626] bg-[#141414]'
          }`}
        >
          {/* Settings Nav Item */}
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2.5 px-3 py-2 mb-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'text-neutral-700 hover:bg-neutral-200'
                : 'text-neutral-300 hover:bg-[#212121]'
            }`}
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Settings</span>
          </button>

          {/* User Account Bar with Popover Trigger */}
          <div className="relative" ref={accountMenuRef}>
            <button
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                isLight ? 'hover:bg-neutral-200' : 'hover:bg-[#222222]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                  {userInitial}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-semibold truncate leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-medium leading-tight">
                    Pro • Active
                  </span>
                </div>
              </div>

              <MoreHorizontal className="w-4 h-4 text-neutral-400 shrink-0" />
            </button>

            {/* Account Popover Menu */}
            {isAccountMenuOpen && (
              <div
                className={`absolute bottom-full left-0 right-0 mb-2 p-1.5 rounded-xl border shadow-xl z-50 text-xs space-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-800'
                    : 'bg-[#1E1E1E] border-[#333333] text-neutral-200'
                }`}
              >
                <div className="px-2.5 py-1.5 border-b border-neutral-700/20 text-[11px] text-neutral-400 truncate">
                  {currentUser?.email || 'pardhupavan457@gmail.com'}
                </div>

                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    handleNavAction(onOpenAnalytics);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Usage Analytics (D3.js)</span>
                </button>

                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    handleNavAction(onOpenSettings);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Profile &amp; Preferences</span>
                </button>

                <button
                  onClick={() => {
                    onToggleTheme();
                    setIsAccountMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isLight ? (
                      <Moon className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Theme: {isLight ? 'Dark mode' : 'Light mode'}</span>
                  </div>
                </button>

                <div className={`h-px my-1 ${isLight ? 'bg-neutral-100' : 'bg-[#2A2A2A]'}`} />

                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
