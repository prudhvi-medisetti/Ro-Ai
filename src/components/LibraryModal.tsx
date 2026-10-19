import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Code,
  Image as ImageIcon,
  Check,
  Search,
  Plus,
  Sparkles,
  Layers,
} from 'lucide-react';
import { MessageAttachment } from '../types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAttachments: (attachments: MessageAttachment[]) => void;
  theme?: 'light' | 'dark' | string;
}

interface LibraryDocItem {
  id: string;
  name: string;
  type: string;
  size: string;
  category: 'documentation' | 'code' | 'sample' | 'data';
  description: string;
  contentSnippet: string;
  icon: React.ReactNode;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectAttachments,
  theme = 'dark',
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isLight = theme === 'light';

  const libraryItems: LibraryDocItem[] = [
    {
      id: 'doc-ai-prompting',
      name: 'System Prompt Engineering Best Practices.md',
      type: 'text/markdown',
      size: '14.2 KB',
      category: 'documentation',
      description: 'Comprehensive guide to multi-turn prompting, chain-of-thought, and system instructions.',
      contentSnippet: '# Prompt Engineering Guide\n1. Be direct and specific\n2. Provide examples (few-shot)\n3. Constrain output format (JSON/Markdown)',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'doc-react-ts',
      name: 'React 18 & TypeScript Cheatsheet.tsx',
      type: 'text/typescript',
      size: '22.8 KB',
      category: 'code',
      description: 'Modern React patterns, custom hooks, typed refs, and clean state reducer architecture.',
      contentSnippet: 'import React, { useState, useEffect, useCallback } from "react";\n\nexport const useAsyncAction = <T,>(fn: () => Promise<T>) => { ... }',
      icon: <Code className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'doc-data-schema',
      name: 'User Analytics & Session Event Schema.json',
      type: 'application/json',
      size: '8.4 KB',
      category: 'data',
      description: 'JSON Schema definition for tracking chat sessions, tokens, and multi-modal tool calls.',
      contentSnippet: '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "title": "ChatEvent",\n  "type": "object",\n  "properties": {\n    "sessionId": { "type": "string" }\n  }\n}',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'doc-deep-research',
      name: 'Quantum Computing Landscape 2026.pdf',
      type: 'application/pdf',
      size: '145 KB',
      category: 'sample',
      description: 'Deep research paper overview covering fault-tolerant qubits and neutral atom processors.',
      contentSnippet: 'Quantum Computing Executive Summary 2026: Advances in logical qubits, quantum error mitigation, and hybrid classical-quantum algorithms.',
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'doc-api-specs',
      name: 'Gemini REST & Streaming Protocol.md',
      type: 'text/markdown',
      size: '18.6 KB',
      category: 'documentation',
      description: 'Server-sent events (SSE) specification and structured JSON schemas for multimodal models.',
      contentSnippet: '## Streaming Protocol (SSE)\nFormat: `data: {"text": "...", "done": false}`\nEndpoint: `/api/chat`',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
    },
  ];

  const filteredItems = libraryItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const chosen = libraryItems.filter((item) => selectedIds.includes(item.id));
    const createdAttachments: MessageAttachment[] = chosen.map((item) => ({
      id: `lib-${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      type: item.type,
      size: item.contentSnippet.length,
      dataUrl: `data:${item.type};base64,${btoa(unescape(encodeURIComponent(item.contentSnippet)))}`,
      isImage: false,
      textContent: item.contentSnippet,
    }));

    onSelectAttachments(createdAttachments);
    setSelectedIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E1422] border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Add from Document &amp; File Library</h2>
              <p className="text-xs text-slate-400">Select files, code templates, and research guides to attach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Filter */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search library documents, guides, and templates..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-hidden ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                    : 'bg-slate-900/90 border-slate-700 text-slate-100 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['all', 'documentation', 'code', 'sample', 'data'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredItems.map((doc) => {
              const isSelected = selectedIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleSelect(doc.id)}
                  className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="shrink-0 mt-0.5">{doc.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold truncate">{doc.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {doc.size}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{doc.description}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
          <span className="text-xs text-slate-400">
            {selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
