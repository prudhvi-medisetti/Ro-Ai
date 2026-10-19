import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  UserCheck,
  Settings,
  FileText,
  Globe,
  FolderGit2,
  GraduationCap,
  Code2,
  BookOpen,
  Paperclip,
  PlaySquare,
  Workflow,
  Sparkles,
  Github,
  Search,
  Check,
  Hash,
  Sliders,
  Palette,
  Terminal,
  Video,
  Music,
  Mic,
} from 'lucide-react';

export interface AtSuggestionItem {
  id: string;
  command: string; // e.g. "@image", "@video", "@music", "@transcribe", "@persona", "@settings"
  insertText: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: 'core' | 'tools' | 'skills' | 'files' | 'integrations';
  actionType:
    | 'image-gen'
    | 'video-gen'
    | 'music-gen'
    | 'transcribe'
    | 'persona'
    | 'settings'
    | 'pdf'
    | 'web-search'
    | 'projects'
    | 'prep'
    | 'code'
    | 'library'
    | 'upload'
    | 'thumbnails'
    | 'visualize'
    | 'deep-research'
    | 'openai'
    | 'canva'
    | 'github';
  tag?: string;
  hasConnectButton?: boolean;
}

export const AT_SUGGESTION_ITEMS: AtSuggestionItem[] = [
  {
    id: 'mention-image',
    command: '@image',
    insertText: '@image ',
    title: '@image',
    subtitle: 'Create & edit images using gemini-3.1-flash-image-preview',
    category: 'core',
    actionType: 'image-gen',
    tag: 'Image Studio',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
        <ImageIcon className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-video',
    command: '@video',
    insertText: '@video ',
    title: '@video',
    subtitle: 'Generate text-to-video & animate images with Veo 3 (veo-3.1-fast-generate-preview)',
    category: 'core',
    actionType: 'video-gen',
    tag: 'Veo Video',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
        <Video className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-music',
    command: '@music',
    insertText: '@music ',
    title: '@music',
    subtitle: 'Generate AI music clips and tracks with Lyria (lyria-3-clip / pro)',
    category: 'core',
    actionType: 'music-gen',
    tag: 'Lyria Music',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xs shrink-0">
        <Music className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-transcribe',
    command: '@transcribe',
    insertText: '@transcribe ',
    title: '@transcribe',
    subtitle: 'High-accuracy audio voice transcription using gemini-3.5-flash',
    category: 'core',
    actionType: 'transcribe',
    tag: 'Voice to Text',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
        <Mic className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-persona',
    command: '@persona',
    insertText: '@persona ',
    title: '@persona',
    subtitle: 'Switch mentor personalities, tone, and deep teaching modes',
    category: 'core',
    actionType: 'persona',
    tag: 'Mentor AI',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
        <UserCheck className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-settings',
    command: '@settings',
    insertText: '@settings ',
    title: '@settings',
    subtitle: 'Manage Gemini models, API keys, audio voice, and UI themes',
    category: 'core',
    actionType: 'settings',
    tag: 'Config',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-600 to-slate-800 flex items-center justify-center text-slate-200 border border-slate-600/40 shadow-xs shrink-0">
        <Settings className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-pdf',
    command: '@pdf',
    insertText: '@pdf ',
    title: '@pdf',
    subtitle: 'Generate structured PDF speeches, comparison tables, and study guides',
    category: 'tools',
    actionType: 'pdf',
    tag: 'Export PDF',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
        <FileText className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-web',
    command: '@web',
    insertText: '@web ',
    title: '@web',
    subtitle: 'Live real-time Google search grounding with verified sources',
    category: 'tools',
    actionType: 'web-search',
    tag: 'Live Web',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
        <Globe className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-projects',
    command: '@projects',
    insertText: '@projects ',
    title: '@projects',
    subtitle: 'Senior Architect guidance to design and build production software',
    category: 'skills',
    actionType: 'projects',
    tag: 'Senior Dev',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xs shrink-0">
        <FolderGit2 className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-prep',
    command: '@prep',
    insertText: '@prep ',
    title: '@prep',
    subtitle: 'Interview preparation, DSA, System Design, and STEM concepts',
    category: 'skills',
    actionType: 'prep',
    tag: 'Learning',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
        <GraduationCap className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-code',
    command: '@code',
    insertText: '@code ',
    title: '@code',
    subtitle: 'High-precision algorithmic code review, refactoring, and test suites',
    category: 'skills',
    actionType: 'code',
    tag: 'Architecture',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs shrink-0">
        <Code2 className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-library',
    command: '@library',
    insertText: '@library ',
    title: '@library',
    subtitle: 'Search and attach reference documents, notes, and previous files',
    category: 'files',
    actionType: 'library',
    tag: 'Files',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-300 shadow-xs shrink-0">
        <BookOpen className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-upload',
    command: '@upload',
    insertText: '@upload ',
    title: '@upload',
    subtitle: 'Upload images, PDFs, code files, and documents from your computer',
    category: 'files',
    actionType: 'upload',
    tag: 'Device Files',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-xs shrink-0">
        <Paperclip className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-thumbnails',
    command: '@thumbnails',
    insertText: '@thumbnails ',
    title: '@thumbnails',
    subtitle: 'YouTube Creator Studio for viral thumbnails, titles, and scripts',
    category: 'tools',
    actionType: 'thumbnails',
    tag: 'YouTube Studio',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white shadow-xs shrink-0">
        <PlaySquare className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-visualize',
    command: '@visualize',
    insertText: '@visualize ',
    title: '@visualize',
    subtitle: 'Generate charts, diagrams, mind maps, and interactive tools',
    category: 'skills',
    actionType: 'visualize',
    tag: 'Charts',
    icon: (
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-xs shrink-0">
        <Workflow className="w-4 h-4" />
      </div>
    ),
  },
  {
    id: 'mention-github',
    command: '@github',
    insertText: '@github ',
    title: '@github',
    subtitle: 'Triage repositories, PRs, commit histories, and deployment flows',
    category: 'integrations',
    actionType: 'github',
    tag: 'DevOps',
    hasConnectButton: true,
    icon: (
      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-xs shrink-0">
        <Github className="w-4 h-4" />
      </div>
    ),
  },
];

interface AtSuggestionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: AtSuggestionItem) => void;
  searchQuery?: string;
  theme?: 'light' | 'dark' | string;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
}

export const AtSuggestionsPopup: React.FC<AtSuggestionsPopupProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  searchQuery = '',
  theme = 'dark',
  selectedIndex: controlledIndex,
  onSelectedIndexChange,
}) => {
  const [localIndex, setLocalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : localIndex;

  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ro_connected_apps_v1');
      return saved ? JSON.parse(saved) : { github: false };
    } catch {
      return { github: false };
    }
  });

  const popupRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  // Filter items based on searchQuery
  const filteredItems = AT_SUGGESTION_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
    const cleanCmd = item.command.toLowerCase().replace(/^@/, '');
    return (
      cleanCmd.includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.tag && item.tag.toLowerCase().includes(q)) ||
      item.actionType.toLowerCase().includes(q)
    );
  });

  const setIndexSafe = (newIdx: number) => {
    if (onSelectedIndexChange) {
      onSelectedIndexChange(newIdx);
    } else {
      setLocalIndex(newIdx);
    }
  };

  // Reset index when search query changes
  useEffect(() => {
    setIndexSafe(0);
  }, [searchQuery]);

  // Keep selected item visible in scroll container
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const selectedEl = listRef.current.querySelector(`[data-at-index="${activeIndex}"]`) as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex, isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const toggleConnect = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    const nextState = !connectedApps[appId];
    const updated = { ...connectedApps, [appId]: nextState };
    setConnectedApps(updated);
    try {
      localStorage.setItem('ro_connected_apps_v1', JSON.stringify(updated));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      id="at-suggestions-popup-menu"
      className={`absolute bottom-full left-0 mb-3 w-full max-w-[560px] rounded-2xl shadow-2xl border z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.12)]'
          : 'bg-[#121622]/95 border-slate-700/80 text-slate-100 shadow-[0_16px_50px_rgba(0,0,0,0.6)]'
      }`}
      style={{
        maxHeight: '440px',
      }}
    >
      {/* Top Header Label */}
      <div
        className={`px-3.5 py-2 border-b flex items-center justify-between text-xs font-semibold select-none ${
          isLight ? 'bg-slate-50/90 border-slate-200 text-slate-600' : 'bg-[#0e121d]/90 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
            @
          </span>
          <span>Mention Commands &amp; Tools</span>
        </div>
        {searchQuery ? (
          <span className="text-[11px] font-normal text-indigo-400">
            Filtering by &ldquo;{searchQuery}&rdquo;
          </span>
        ) : (
          <span className="text-[11px] font-normal text-slate-400">
            Select to insert command
          </span>
        )}
      </div>

      {/* Scrollable Items List */}
      <div
        ref={listRef}
        className="py-1.5 px-1.5 overflow-y-auto max-h-[320px] scrollbar-thin scrollbar-thumb-slate-700"
      >
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Search className="w-5 h-5 mx-auto mb-2 opacity-50 text-indigo-400" />
            <span>No matching commands or tools found for &quot;{searchQuery}&quot;</span>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isSelected = index === activeIndex;
            const isConnected = connectedApps[item.actionType];

            return (
              <div
                key={item.id}
                data-at-index={index}
                id={`at-item-${item.id}`}
                onClick={() => onSelectItem(item)}
                onMouseEnter={() => setIndexSafe(index)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer select-none group my-0.5 ${
                  isSelected
                    ? isLight
                      ? 'bg-indigo-50 border border-indigo-200/80 text-slate-900 shadow-xs'
                      : 'bg-indigo-950/50 border border-indigo-500/40 text-white shadow-xs'
                    : isLight
                    ? 'hover:bg-slate-100/70 border border-transparent text-slate-700'
                    : 'hover:bg-slate-800/40 border border-transparent text-slate-200'
                }`}
              >
                {/* Left Icon & Text */}
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div className="shrink-0 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-[13px] font-bold font-mono text-indigo-500 dark:text-indigo-300">
                        {item.command}
                      </span>
                      {item.tag && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${
                            isLight
                              ? 'bg-slate-200/80 text-slate-700'
                              : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                          }`}
                        >
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Badge / Connect Button */}
                {item.hasConnectButton ? (
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={(e) => toggleConnect(e, item.actionType)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isConnected ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      Tab ↵
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Helper Note */}
      <div
        className={`px-3.5 py-2 border-t text-[11px] font-medium flex items-center justify-between select-none ${
          isLight
            ? 'bg-slate-50/80 border-slate-200/80 text-slate-400'
            : 'bg-[#0E121D]/90 border-slate-800 text-slate-400'
        }`}
      >
        <span className="truncate">Type <span className="font-mono text-indigo-400">@image</span>, <span className="font-mono text-indigo-400">@persona</span>, <span className="font-mono text-indigo-400">@settings</span>...</span>
        <span className="hidden sm:inline font-mono text-[10px] opacity-75 text-slate-400">
          ↑↓ Navigate • ↵ / Tab Insert • Esc
        </span>
      </div>
    </div>
  );
};
