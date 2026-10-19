import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Code2,
  FolderGit2,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  Send,
  Terminal,
  Database,
  Globe,
  Bot,
  ShieldCheck,
  Zap,
  BookOpen,
  Boxes,
  Compass,
  FileCode2,
  Flame,
  Layout,
  Server,
  Workflow,
  Lightbulb,
} from 'lucide-react';
import { BotPersona, MessageAttachment } from '../types';

export interface StudentProjectTemplate {
  id: string;
  title: string;
  badge: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Production / Capstone';
  category: 'Full-Stack Web' | 'AI & LLM Systems' | 'Backend & Cloud' | 'Mobile & Realtime';
  architecture: string;
  description: string;
  seniorDevAdvice: string;
  techStack: string[];
  milestones: {
    title: string;
    description: string;
    keyDecisions: string;
  }[];
  seniorReviewQuestions: string[];
  promptTemplate: string;
}

export const STUDENT_PROJECT_TEMPLATES: StudentProjectTemplate[] = [
  {
    id: 'proj-ai-assistant-platform',
    title: 'Multi-Modal AI Companion & Chat Studio (Like Ro AI)',
    badge: 'Build This Applet',
    difficulty: 'Production / Capstone',
    category: 'AI & LLM Systems',
    architecture: 'Vite + React 18 + TypeScript + Express Backend + Gemini 3.7 Flash Streaming + SSE',
    description:
      'Build a production-grade full-stack conversational AI platform identical to Ro with streaming responses, audio transcribing, system persona switches, and document grounding.',
    seniorDevAdvice:
      'Always separate UI rendering from AI streaming chunk buffer handlers. Never expose your Gemini API key on the browser client — proxy through an Express `/api/chat` endpoint with AbortController lifecycle management.',
    techStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Express.js', 'Google GenAI SDK', 'Web Audio API'],
    milestones: [
      {
        title: 'Phase 1: Architecture & Server-Side Token Security',
        description: 'Set up Express proxy with Server-Sent Events (SSE) and lazy initialized GoogleGenAI client.',
        keyDecisions: 'Streaming chunks via `text/event-stream` ensures sub-100ms first token latency (TTFT).',
      },
      {
        title: 'Phase 2: Resilient Client-Side State Reducer',
        description: 'Store multi-session history, custom personas, and voice configurations in persistent storage.',
        keyDecisions: 'Decouple message state from modal overlays to prevent needless re-renders during active generation.',
      },
      {
        title: 'Phase 3: Multi-Modal Attachments & Grounding',
        description: 'Process PDFs, base64 images, and real-time Google search grounding sources.',
        keyDecisions: 'Sanitize base64 payloads to stay within token limits and handle binary payload chunking.',
      },
      {
        title: 'Phase 4: Senior Code Review & Polish',
        description: 'Refactor components into modular files, add keyboard shortcuts, and enforce strict accessibility.',
        keyDecisions: 'Zero AI slop in code or design; strict mathematical typography scales and dark-mode contrast AA.',
      },
    ],
    seniorReviewQuestions: [
      'How does your backend handle client disconnects or aborted streams to prevent wasted API tokens?',
      'Why should you prefer SSE over WebSockets for one-way LLM text streaming?',
      'How are you handling rate limiting and defensive fallback if a model times out?',
    ],
    promptTemplate:
      'Hey Ro, act as a Staff Software Engineer & System Architect. I want to build a Multi-Modal AI Companion platform like Ro from scratch. Guide me step-by-step through the architecture, backend Express SSE proxy, React streaming hooks, and senior code review criteria.',
  },
  {
    id: 'proj-saas-task-engine',
    title: 'Real-Time Collaborative Kanban & Task Workflow Engine',
    badge: 'High-Yield SaaS',
    difficulty: 'Intermediate',
    category: 'Full-Stack Web',
    architecture: 'React + Node.js + WebSocket / Supabase Realtime + Optimistic UI Mutations',
    description:
      'Develop a high-performance Jira/Linear style project board with drag-and-drop, instant multi-user synchronization, and offline-first state sync.',
    seniorDevAdvice:
      'Avoid naive optimistic updates without rollback rollback handlers. Use normalized data stores (keyed by ID) instead of nested arrays for O(1) drag-and-drop updates.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand / Redux Toolkit', 'dnd-kit', 'PostgreSQL'],
    milestones: [
      {
        title: 'Phase 1: Normalized State Machine',
        description: 'Design normalized relational state for Columns, Tasks, and Audit Logs.',
        keyDecisions: 'Avoid deep object mutation to prevent layout stutter during 60fps drag actions.',
      },
      {
        title: 'Phase 2: Optimistic UI & Reordering Algorithm',
        description: 'Implement lexicographical rank keys (fractional indexing) for seamless reordering.',
        keyDecisions: 'Fractional indexing avoids batch updating every task row index on single reorders.',
      },
      {
        title: 'Phase 3: Real-Time Broadcast & Conflict Resolution',
        description: 'Sync collaborator cursor positions and lock cards undergoing edits.',
        keyDecisions: 'Last-write-wins with server timestamp verification.',
      },
    ],
    seniorReviewQuestions: [
      'How do you avoid race conditions when two users drag the same card simultaneously?',
      'Why is fractional indexing superior to simple integer array sorting in relational databases?',
    ],
    promptTemplate:
      'Hey Ro, as a Senior Architect, teach me how to build an enterprise Linear-style Kanban board. Focus on fractional indexing, optimistic UI rollbacks, and clean state normalization.',
  },
  {
    id: 'proj-rag-doc-engine',
    title: 'Enterprise RAG Document Search & Q&A Engine',
    badge: 'Enterprise AI',
    difficulty: 'Advanced',
    category: 'AI & LLM Systems',
    architecture: 'FastAPI / Express + Vector Embeddings + Hybrid Semantic Search + Citations',
    description:
      'A knowledge-base engine allowing users to upload technical PDFs, code repos, and markdown docs, querying them with exact page citations and source snippets.',
    seniorDevAdvice:
      'Chunking strategy makes or breaks RAG. Do not blindly chunk by 500 characters. Use recursive AST/markdown splitters with 15% overlap to preserve semantic boundaries.',
    techStack: ['Node.js / Python', 'Vector Store / pgvector', 'Text Embeddings', 'Gemini API', 'React'],
    milestones: [
      {
        title: 'Phase 1: Ingestion & Smart Document Chunking',
        description: 'Extract text, preserve header hierarchies, and compute embedding vectors.',
        keyDecisions: 'Hybrid search (BM25 keyword + cosine vector similarity) yields superior recall for technical terms.',
      },
      {
        title: 'Phase 2: Prompt Synthesis with Exact Source Citations',
        description: 'Inject top-k chunks into model context with strict anti-hallucination constraints.',
        keyDecisions: 'Enforce structured JSON output format containing exact citation IDs.',
      },
    ],
    seniorReviewQuestions: [
      'How do you prevent context window overflow when users query broad multi-chapter topics?',
      'What evaluation metrics (e.g. RAGAS, precision@k) are you using to measure retrieval quality?',
    ],
    promptTemplate:
      'Act as a Principal AI Engineer. Guide me through architecting an enterprise RAG system with document chunking, hybrid semantic search, and hallucination-free citation generation.',
  },
  {
    id: 'proj-event-driven-api',
    title: 'High-Throughput Distributed Payment & Webhook Service',
    badge: 'Backend Core',
    difficulty: 'Advanced',
    category: 'Backend & Cloud',
    architecture: 'Node.js / Go + Redis Queue + PostgreSQL + Idempotency Keys + Docker',
    description:
      'Design a resilient financial transaction & webhook processor capable of handling burst traffic with zero duplicate charges and strict audit trails.',
    seniorDevAdvice:
      'Idempotency is non-negotiable in fintech. Every transaction must require an `Idempotency-Key` header cached with atomic distributed locks before hitting ledger tables.',
    techStack: ['Node.js', 'PostgreSQL', 'Redis / BullMQ', 'Docker', 'Jest / Supertest'],
    milestones: [
      {
        title: 'Phase 1: Atomic Ledger & Idempotency Key Pipeline',
        description: 'Build idempotency middleware and double-entry bookkeeping ledger.',
        keyDecisions: 'Use database transactions with `SERIALIZABLE` or pessimistic locking on balance checks.',
      },
      {
        title: 'Phase 2: Asynchronous Webhook Retries & Exponential Backoff',
        description: 'Queue webhook delivery with exponential jitter retries and dead-letter queues.',
        keyDecisions: 'Dead-letter queues (DLQ) isolate corrupted payloads without blocking healthy traffic.',
      },
    ],
    seniorReviewQuestions: [
      'How does your system guarantee no double deductions occur during a network timeout retry?',
      'Why is double-entry bookkeeping required rather than a single `user_balance` column?',
    ],
    promptTemplate:
      'Act as a Senior Staff Backend Engineer. Help me design an idempotent payment processing and webhook retry service with database transactions and Redis queues.',
  },
  {
    id: 'proj-interactive-compiler',
    title: 'In-Browser Interactive Code Sandbox & Test Runner',
    badge: 'Developer Tools',
    difficulty: 'Production / Capstone',
    category: 'Full-Stack Web',
    architecture: 'React + Monaco Editor + Web Workers / WebContainers / Sandboxed iFrame + AST',
    description:
      'Build a zero-latency code playground where students can write TypeScript/JavaScript, run live unit tests, and inspect AST parse trees safely in the browser.',
    seniorDevAdvice:
      'Never use raw `eval()` in the main thread. Always isolate student code execution inside isolated Web Workers or cross-origin sandbox iframes with CPU execution timeout guards.',
    techStack: ['React', 'Monaco Editor', 'Web Workers', 'esbuild-wasm', 'Tailwind CSS'],
    milestones: [
      {
        title: 'Phase 1: In-Browser Bundling with esbuild-wasm',
        description: 'Compile TypeScript and JSX on the fly directly inside browser memory.',
        keyDecisions: 'Eliminates server execution costs and provides instant 16ms re-compilation.',
      },
      {
        title: 'Phase 2: Sandboxed Execution & Test Harness',
        description: 'Intercept console logs and run Jest-like test assertions safely.',
        keyDecisions: 'Worker timeout killer prevents infinite `while(true)` loops from freezing the browser.',
      },
    ],
    seniorReviewQuestions: [
      'How do you stop malicious code from accessing `window.localStorage` or parent DOM?',
      'What strategy handles third-party NPM package imports inside the browser sandbox?',
    ],
    promptTemplate:
      'Hey Ro, as a Senior Developer Tooling Engineer, walk me through creating an in-browser code editor and sandboxed test runner using Web Workers and esbuild-wasm.',
  },
];

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchProjectSession: (project: StudentProjectTemplate, customScope?: string) => void;
  onOpenAutonomousBuilder?: (initialPrompt?: string) => void;
  theme?: 'light' | 'dark' | string;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  onLaunchProjectSession,
  onOpenAutonomousBuilder,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<StudentProjectTemplate>(
    STUDENT_PROJECT_TEMPLATES[0]
  );
  const [customGoal, setCustomGoal] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'review'>('overview');

  const isLight = theme === 'light';

  const categories = ['All', 'AI & LLM Systems', 'Full-Stack Web', 'Backend & Cloud'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Production / Capstone'];

  const filteredProjects = STUDENT_PROJECT_TEMPLATES.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    return matchCat && matchDiff;
  });

  if (!isOpen) return null;

  const handleStartSession = () => {
    onLaunchProjectSession(selectedProject, customGoal.trim());
    onClose();
  };

  return (
    <div
      id="modal-student-projects-studio"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        className={`relative w-full max-w-5xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0D121F] border-slate-800 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.7)]'
        }`}
      >
        {/* MODAL HEADER */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0A0E18]/80 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Student Project Studio &amp; Senior Architect Mentorship
                </h2>
                <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Senior Dev Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Architect real production systems, practice senior technical trade-offs, and receive code reviews
              </p>
            </div>
          </div>

          <button
            id="btn-close-projects-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Autonomous Project Builder Feature Callout */}
        {onOpenAutonomousBuilder && (
          <div className={`px-6 py-2.5 flex items-center justify-between gap-3 border-b text-xs ${
            isLight
              ? 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
              : 'bg-indigo-950/40 border-indigo-500/20 text-indigo-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="font-semibold truncate">
                ⚡ Want an AI Software Engineer to build, test &amp; run this autonomously?
              </span>
              <span className="hidden md:inline text-slate-400">• Generates spec, plan, code, automated self-tests &amp; live preview</span>
            </div>
            <button
              id="btn-projects-modal-launch-builder"
              onClick={() => {
                onClose();
                onOpenAutonomousBuilder(`Build me a ${selectedProject.title} with ${selectedProject.techStack.join(', ')} and production-grade features.`);
              }}
              className="shrink-0 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MAIN BODY: 2-Column Split */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* LEFT SIDEBAR: Filters & Project Directory (5 Cols) */}
          <div
            className={`lg:col-span-5 p-4 border-r flex flex-col min-h-0 overflow-y-auto ${
              isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-[#0B0F1C]/60 border-slate-800/70'
            }`}
          >
            {/* Category Filter Pills */}
            <div className="space-y-2 mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight
                        ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800/70 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Curated Capstones ({filteredProjects.length})
              </span>
              {filteredProjects.map((proj) => {
                const isSelected = selectedProject.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    id={`project-card-${proj.id}`}
                    onClick={() => setSelectedProject(proj)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-indigo-950/30 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40 text-white'
                        : isLight
                        ? 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-xs sm:text-sm font-bold line-clamp-1 leading-snug">
                        {proj.title}
                      </h3>
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        {proj.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {proj.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isLight
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                      {proj.techStack.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{proj.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT MAIN PANEL: Active Project Details & Senior Dev Plan (7 Cols) */}
          <div className="lg:col-span-7 p-5 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-4">
              {/* Project Title Banner */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedProject.category}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {selectedProject.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
                    {selectedProject.title}
                  </h2>
                </div>
              </div>

              {/* Senior Developer Mindset Callout */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isLight
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-amber-950/25 border-amber-500/30 text-amber-200'
                }`}
              >
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block mb-0.5 text-amber-300">
                    Senior Architect Advice &amp; Production Principle:
                  </span>
                  {selectedProject.seniorDevAdvice}
                </div>
              </div>

              {/* Sub-Tabs: Overview vs. Milestones vs. Senior Review */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  System Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('milestones')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'milestones'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Step-by-Step Milestones ({selectedProject.milestones.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('review')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'review'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Architect Review Questions
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-3 animate-in fade-in duration-100 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Architecture Blueprint
                    </span>
                    <div
                      className={`p-3 rounded-xl font-mono text-xs border ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-slate-900 border-slate-800 text-indigo-300'
                      }`}
                    >
                      {selectedProject.architecture}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Full Technology Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Custom Student Goal or Specific Question (Optional)
                    </span>
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="e.g. Focus specifically on handling audio input streaming or optimizing SSE buffers"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-hidden ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                          : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Milestones */}
              {activeTab === 'milestones' && (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 animate-in fade-in duration-100">
                  {selectedProject.milestones.map((m, idx) => (
                    <div
                      key={m.title}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{m.title}</span>
                      </div>
                      <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
                        {m.description}
                      </p>
                      <div className="pl-7 text-[11px] text-emerald-400 font-mono">
                        Key Architecture Decision: {m.keyDecisions}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Senior Review Questions */}
              {activeTab === 'review' && (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 animate-in fade-in duration-100">
                  <p className="text-xs text-slate-400 mb-2">
                    In your senior developer session, Ro will interrogate your architecture with these high-level system design questions:
                  </p>
                  {selectedProject.seniorReviewQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Launches a dedicated conversation with Ro in <strong className="text-slate-200">Senior Architect Mode</strong>
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-launch-senior-dev-session"
                  type="button"
                  onClick={handleStartSession}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Bot className="w-4 h-4" />
                  <span>Launch Senior Dev Project Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
