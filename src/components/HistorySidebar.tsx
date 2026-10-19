import React, { useState } from 'react';
import {
  X,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Search,
  PanelLeftClose,
  BookOpen,
  Folder,
  Clock,
  AtSign,
  Code2,
  MoreHorizontal,
  FileText,
  Settings,
  Sparkles,
  Play,
  Layers,
  Store,
  LogOut,
} from 'lucide-react';
import { ChatSession, UserAccount } from '../types';
import { ActivityBarChart } from './ActivityBarChart';
import { RoLogo } from './RoLogo';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  onExportSessionPdf?: (session: ChatSession) => void;
  onOpenThumbnailStudio?: () => void;
  onOpenPrepModules?: () => void;
  onOpenProjectsStudio?: () => void;
  onOpenLogoStudio?: () => void;
  onOpenImageGen?: () => void;
  currentUser?: UserAccount | null;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  onExportSessionPdf,
  onOpenThumbnailStudio,
  onOpenPrepModules,
  onOpenProjectsStudio,
  onOpenLogoStudio,
  onOpenImageGen,
  currentUser,
  onOpenSettings,
  onLogout,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!isOpen) return null;

  const startRenaming = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const userInitial = (currentUser?.name || currentUser?.email || 'pardhu pavan')
    .trim()
    .charAt(0)
    .toUpperCase();
  const userName = currentUser?.name || 'pardhu pavan';

  const filteredSessions = sessions.filter((s) =>
    searchQuery ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-150">
      <div className="relative w-full max-w-[280px] sm:max-w-[300px] bg-[#0E131F] h-full shadow-2xl flex flex-col z-10 border-r border-slate-800/80 text-slate-200">
        
        {/* TOP HEADER: Ro Brand Logo + Search + Collapse icon */}
        <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2 bg-[#0E131F]">
          <div className="flex items-center gap-2">
            <RoLogo size="xs" showText={false} />
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Ro</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
                AI
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="btn-sidebar-toggle-search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Search chats"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              id="btn-close-history-sidebar"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Search Box when toggled */}
        {isSearchOpen && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                autoFocus
                className="w-full pl-8 pr-6 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-slate-700 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* PRIMARY CHATGPT MENU ITEMS */}
        <div className="px-2.5 py-1.5 space-y-0.5 border-b border-slate-800/60">
          {/* New Chat Pill Button */}
          <button
            id="btn-sidebar-new-chat-pill"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-100 text-xs font-medium transition-colors cursor-pointer group"
          >
            <Edit2 className="w-4 h-4 text-slate-300 group-hover:text-white" />
            <span>New chat</span>
          </button>

          {/* Library */}
          <button
            id="btn-sidebar-library"
            onClick={() => {
              onOpenPrepModules?.();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Library</span>
          </button>

          {/* Projects (Student Projects & Senior Dev Mentorship) */}
          <button
            id="btn-sidebar-projects"
            onClick={() => {
              if (onOpenProjectsStudio) {
                onOpenProjectsStudio();
              } else {
                onOpenThumbnailStudio?.();
              }
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <Folder className="w-4 h-4 text-indigo-400" />
            <div className="flex items-center justify-between w-full">
              <span>Projects</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Senior Dev
              </span>
            </div>
          </button>

          {/* Scheduled */}
          <button
            id="btn-sidebar-scheduled"
            onClick={() => {
              onOpenSettings?.();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Scheduled</span>
          </button>

          {/* Plugins */}
          <button
            id="btn-sidebar-plugins"
            onClick={() => {
              onOpenSettings?.();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <AtSign className="w-4 h-4 text-slate-400" />
            <span>Plugins</span>
          </button>

          {/* Codex */}
          <button
            id="btn-sidebar-codex"
            onClick={() => {
              onOpenImageGen?.();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-slate-400" />
            <span>Codex</span>
          </button>

          {/* More */}
          <div className="relative">
            <button
              id="btn-sidebar-more"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
              <span>More</span>
            </button>

            {showMoreMenu && (
              <div className="absolute left-2 top-full mt-1 w-48 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl z-30 text-xs space-y-1">
                {onOpenLogoStudio && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenLogoStudio();
                      onClose();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Brand &amp; Logo Hub</span>
                  </button>
                )}
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenSettings();
                      onClose();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings Dialog</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION HEADER: RECENTS */}
        <div className="px-3.5 pt-3 pb-1 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Recents</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {filteredSessions.length}
          </span>
        </div>

        {/* RECENTS SESSIONS LIST */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 px-4">
              <MessageSquare className="w-6 h-6 mx-auto mb-1.5 opacity-30 text-slate-400" />
              <p className="text-xs text-slate-400">No conversations</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = session.id === currentSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectSession(session.id);
                      onClose();
                    }
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/80 text-white font-medium'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(session.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full text-xs px-1.5 py-0.5 rounded border border-indigo-500 bg-slate-900 text-slate-100 focus:outline-hidden"
                        />
                        <button
                          type="submit"
                          className="p-1 text-indigo-400 hover:text-indigo-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <p className="truncate text-xs text-slate-200">
                        {session.title || 'Untitled Conversation'}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onExportSessionPdf && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportSessionPdf(session);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-800"
                          title="Export to PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => startRenaming(session, e)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM USER PROFILE FOOTER: Avatar "PP", "pardhu pavan", "Go", Store/Settings Icon */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0B0E14] flex items-center justify-between">
          <button
            id="btn-sidebar-user-profile"
            onClick={() => {
              onOpenSettings?.();
              onClose();
            }}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-opacity cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#334155] text-white font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-600">
              {userInitial === 'P' ? 'PP' : userInitial}
            </div>
            <div className="truncate min-w-0">
              <div className="text-xs font-semibold text-slate-100 truncate group-hover:text-white">
                {userName}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">Go</div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button
              id="btn-sidebar-open-store-settings"
              onClick={() => {
                onOpenSettings?.();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Settings &amp; Features"
            >
              <Store className="w-4 h-4" />
            </button>
            {onLogout && (
              <button
                id="btn-sidebar-quick-logout"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                title="Log Out of Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
