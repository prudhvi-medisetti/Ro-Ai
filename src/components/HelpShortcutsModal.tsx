import React, { useState } from 'react';
import {
  Keyboard,
  X,
  Command,
  CornerDownLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Mic,
  Image as ImageIcon,
  MessageSquarePlus,
  PanelLeft,
  Sliders,
  Trash2,
  Paperclip,
  Code2,
  FileText,
  Search,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { RoOfficialLogo } from './RoOfficialLogo';

interface HelpShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  onClearChat?: () => void;
  onToggleHistory?: () => void;
  onTogglePersona?: () => void;
  onOpenImageGen?: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'chat' | 'navigation' | 'tools' | 'craft';
  badge?: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['Ctrl', 'V'],
    description: 'Paste study matter, text, screenshots, or files directly into chat',
    category: 'chat',
    badge: 'Essential',
  },
  {
    keys: ['Ctrl', 'C'],
    description: 'Copy selected text, code snippets, or AI responses to clipboard',
    category: 'chat',
    badge: 'Essential',
  },
  {
    keys: ['Enter'],
    description: 'Send prompt in chat input',
    category: 'chat',
  },
  {
    keys: ['Ctrl', 'Enter'],
    description: 'Send prompt immediately (or ⌘+Enter on Mac)',
    category: 'chat',
  },
  {
    keys: ['Shift', 'Enter'],
    description: 'Insert new line without sending',
    category: 'chat',
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'Quick New Chat / Start clean session (⌘+K)',
    category: 'navigation',
    badge: 'Popular',
  },
  {
    keys: ['Ctrl', 'Shift', 'K'],
    description: 'Clear messages in current conversation',
    category: 'chat',
  },
  {
    keys: ['Ctrl', 'H'],
    description: 'Toggle Conversation History sidebar (⌘+H)',
    category: 'navigation',
  },
  {
    keys: ['Ctrl', 'B'],
    description: 'Toggle Ro Persona & System Craft drawer (⌘+B)',
    category: 'navigation',
  },
  {
    keys: ['Ctrl', '/'],
    description: 'Open this Help & Keyboard Shortcuts guide (or press ?)',
    category: 'navigation',
    badge: 'Global',
  },
  {
    keys: ['Esc'],
    description: 'Close open modal, drawer, or cancel action',
    category: 'navigation',
  },
  {
    keys: ['Alt', 'V'],
    description: 'Toggle Voice-to-Text Recording / Dictation',
    category: 'tools',
    badge: 'Voice',
  },
  {
    keys: ['Ctrl', 'Shift', 'E'],
    description: 'Export conversation history to formatted PDF document',
    category: 'tools',
    badge: 'PDF',
  },
  {
    keys: ['Ctrl', 'Shift', 'I'],
    description: 'Open AI Image & Graphic Asset Generator',
    category: 'tools',
  },
  {
    keys: ['Ctrl', 'Shift', 'L'],
    description: 'Open Ro Official Logo & Brand Assets Studio',
    category: 'tools',
  },
  {
    keys: ['Ctrl', 'Shift', 'T'],
    description: 'Open YouTube Thumbnail Studio',
    category: 'tools',
  },
  {
    keys: ['Ctrl', 'Shift', 'P'],
    description: 'Open Preparation & Practice Modules',
    category: 'tools',
  },
];

export const HelpShortcutsModal: React.FC<HelpShortcutsModalProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onClearChat,
  onToggleHistory,
  onTogglePersona,
  onOpenImageGen,
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'human_craft' | 'tips'>('shortcuts');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const formatKey = (key: string) => {
    if (key === 'Ctrl' && isMac) return '⌘';
    if (key === 'Alt' && isMac) return '⌥';
    if (key === 'Shift') return '⇧';
    if (key === 'Enter') return '↵';
    return key;
  };

  const filteredShortcuts = SHORTCUTS.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.description.toLowerCase().includes(q) ||
      s.keys.some((k) => k.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0C101A] border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-inner text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                  Help &amp; Navigation Shortcuts
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Efficiency
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Keyboard control, navigation hotkeys &amp; Ro's Human Crafting Engine
              </p>
            </div>
          </div>

          <button
            id="btn-close-help-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close Help (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-0 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              id="tab-help-shortcuts"
              onClick={() => setActiveTab('shortcuts')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'shortcuts'
                  ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Shortcuts</span>
            </button>

            <button
              id="tab-help-human-craft"
              onClick={() => setActiveTab('human_craft')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'human_craft'
                  ? 'border-emerald-500 text-emerald-300 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Human Craft &amp; Anti-AI Detection</span>
            </button>

            <button
              id="tab-help-tips"
              onClick={() => setActiveTab('tips')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'tips'
                  ? 'border-purple-500 text-purple-300 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Power Tips</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              {/* Search filter bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shortcuts (e.g., chat, voice, clear, history)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Shortcuts Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredShortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 leading-snug">
                          {item.description}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider capitalize">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 rounded-lg bg-slate-800/90 border border-slate-700/90 text-slate-200 font-mono text-[11px] font-bold shadow-xs min-w-[24px] text-center"
                        >
                          {formatKey(k)}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pro Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] border border-slate-700">?</kbd> anywhere to open this menu</span>
                </div>
                <div className="flex items-center gap-2">
                  {onNewChat && (
                    <button
                      onClick={() => {
                        onNewChat();
                        onClose();
                      }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      New Chat
                    </button>
                  )}
                  <span>•</span>
                  {onClearChat && (
                    <button
                      onClick={() => {
                        onClearChat();
                        onClose();
                      }}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      Clear Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'human_craft' && (
            <div className="space-y-4 text-left">
              {/* Human Craft Hero Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 border border-emerald-500/40 shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
                      Zero AI Detection &amp; Natural Human Craftsmanship
                    </h3>
                    <p className="text-[11px] text-emerald-300">
                      Engineered to generate genuine human prose, natural sentence rhythm &amp; authentic production code
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  AI detectors (GPTZero, Turnitin, Copyleaks, ZeroGPT) flag content by scanning for uniform sentence lengths (low burstiness), predictable word transitions (low perplexity), and generic AI boilerplate phrases. Ro’s Human Companion Engine is built to completely eliminate these signatures.
                </p>
              </div>

              {/* The 4 Human Craft Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1. Organic Burstiness &amp; Flow</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Varies sentence lengths dynamically. Uses sharp 4-word punchlines alongside rich multi-clause explanatory paragraphs with natural conversational cadence.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>2. Banished AI Clichés</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Strictly bans repetitive robotic words: <em>"Certainly!", "Delve into", "Tapestry", "Beacon", "In today's fast-paced world", "It is crucial to remember"</em>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>3. Senior Human Code Architecture</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Writes realistic, production-tested code. Contextual variable names, defensive error guards, modern idioms, and comments that explain <strong>why</strong> rather than obvious syntax.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>4. Genuine Grounded Tone</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Speaks like an experienced colleague writing directly in Slack or a collaborative doc — warm, candid, direct, and free of artificial corporate cheerleading.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Human Craft Mode: Active across all models &amp; personas</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">100% Un-templated</span>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 mb-0.5">Dual-Engine Voice Dictation</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Click the microphone or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">Alt+V</kbd>. Speak naturally with automatic continuous speech listening and Gemini multimodal AI fallback transcription.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 mb-0.5">Drag &amp; Drop Multimodal Attachments</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Drag and drop UI screenshots, code files, or documents directly into the chat input. Ro analyzes them directly in your conversation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 mb-0.5">Studio Dropdown Hub</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Use the top navigation Studio dropdown to launch the AI Image Generator, Official Ro Vector Brand Assets, YouTube Thumbnail Designer, and Prep Modules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RoOfficialLogo size="xs" variant="icon-only" glow={false} />
            <span>Ro AI Assistant • Human Companion</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
