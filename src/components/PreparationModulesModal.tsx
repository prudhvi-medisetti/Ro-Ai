import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Code2,
  Video,
  Flame,
  FileText,
  Target,
  Layers,
  ArrowRight,
  Brain,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import { PrepModuleOption } from '../types';

interface PreparationModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (prompt: string, moduleTitle: string) => void;
}

const PREP_MODULES: PrepModuleOption[] = [
  // YOUTUBE & CREATOR MODULES
  {
    id: 'yt-viral-hook',
    category: 'youtube',
    title: 'Viral YouTube Hook & Retention Architect',
    badge: '3-Sec Hook',
    iconName: 'Flame',
    description:
      'Engineers high-retention video intros. Formulates the visual hook, audio hook, curiosity gap, and first-60-seconds retention defense.',
    samplePrompt:
      'Build a high-retention YouTube video intro and first-60-seconds script for a video about [TOPIC]. Include visual cues, B-roll directions, and the exact curiosity gap phrasing.',
    fields: [
      { key: 'topic', label: 'Video Subject / Big Idea', placeholder: 'e.g. How I Built an Automated AI Newsletter with $0' },
      { key: 'targetAudience', label: 'Target Viewer Demographics', placeholder: 'e.g. Aspiring solo entrepreneurs, developers' },
    ],
  },
  {
    id: 'yt-full-script',
    category: 'youtube',
    title: 'Full Video Script & Story Arc Builder',
    badge: 'Complete Script',
    iconName: 'Video',
    description:
      'Structures the complete 8-15 minute narrative arc: Hook -> Premise -> 3 Key Chapters with retention resets -> Emotional Climax -> Seamless CTA.',
    samplePrompt:
      'Write a comprehensive YouTube video script outline for: [TOPIC]. Structure it into chapters with timestamps, engagement hooks, and retention resets every 90 seconds.',
    fields: [
      { key: 'topic', label: 'Video Title & Objective', placeholder: 'e.g. Why Most Programmers Never Get Promoted in 2026' },
      { key: 'videoLength', label: 'Target Video Length', placeholder: 'e.g. 10-12 minutes' },
    ],
  },
  {
    id: 'yt-seo-titles',
    category: 'youtube',
    title: 'YouTube Title & High-Search SEO Engine',
    badge: 'A/B Testing',
    iconName: 'Target',
    description:
      'Generates 5 psychological Title variations (Curiosity, Fear of Missing Out, Data/Numbers, Challenge, Transformation) + YouTube Description & Search Tags.',
    samplePrompt:
      'Generate 5 A/B testable high-CTR YouTube titles for [TOPIC]. Categorize by psychological angle and provide optimized SEO search tags and a video description.',
    fields: [
      { key: 'topic', label: 'Core Video Topic', placeholder: 'e.g. Master TypeScript in 30 Days' },
    ],
  },
  {
    id: 'yt-shorts-repurpose',
    category: 'youtube',
    title: 'Shorts / TikTok 60-Sec Repurposing Blueprint',
    badge: 'Short-Form',
    iconName: 'Zap',
    description:
      'Extracts 3 viral 45-60 second vertical short scripts from any long-form video or idea with fast-paced caption cues.',
    samplePrompt:
      'Create 3 viral 60-second YouTube Shorts / Reels scripts extracted from this concept: [TOPIC]. Include on-screen text instructions and pacing.',
    fields: [
      { key: 'topic', label: 'Main Concept to Repurpose', placeholder: 'e.g. The 3 rules of clean architecture' },
    ],
  },

  // EXAM & ACADEMIC PREPARATION MODULES
  {
    id: 'exam-cheat-sheet',
    category: 'exam',
    title: 'High-Yield Exam Blueprint & Cheat Sheet',
    badge: 'Exam Prep',
    iconName: 'GraduationCap',
    description:
      'Distills complex syllabus topics into high-yield summaries, critical formulas, edge-case theorems, and common examiner traps.',
    samplePrompt:
      'Create a comprehensive high-yield exam preparation study guide for [TOPIC]. Include core formulas, mnemonic memory aids, common pitfalls, and 5 likely exam questions with solutions.',
    fields: [
      { key: 'topic', label: 'Subject / Exam Title', placeholder: 'e.g. University Calculus II, AP Physics, AWS Solutions Architect' },
      { key: 'focusAreas', label: 'Difficult Topics / Focus Areas', placeholder: 'e.g. Integration by parts, Taylor Series' },
    ],
  },
  {
    id: 'exam-feynman-concept',
    category: 'exam',
    title: 'Feynman 5-Level Concept Explainer',
    badge: 'Deep Learning',
    iconName: 'Brain',
    description:
      'Breaks down any tough concept across 5 escalating levels of mastery: 5-Year-Old, High Schooler, Undergrad, Senior Practitioner, and Edge-Case Master.',
    samplePrompt:
      'Explain [TOPIC] using the Feynman Learning Technique across 5 levels of depth: 1) Child (simple analogy), 2) High School, 3) Undergrad, 4) Industry Practitioner, 5) Deep Technical Nuance.',
    fields: [
      { key: 'topic', label: 'Concept or Theory', placeholder: 'e.g. Quantum Entanglement, Transformer Self-Attention, TCP/IP Handshake' },
    ],
  },
  {
    id: 'exam-active-recall',
    category: 'exam',
    title: 'Active Recall Flashcards & Quiz Drills',
    badge: 'Memory Drill',
    iconName: 'HelpCircle',
    description:
      'Generates 10 spaced-repetition Q&A flashcards designed to test deep conceptual understanding rather than rote memorization.',
    samplePrompt:
      'Generate 10 high-yield active recall flashcards for [TOPIC]. Format each with a challenging scenario question, hint, and detailed solution explanation.',
    fields: [
      { key: 'topic', label: 'Topic to Memorize & Master', placeholder: 'e.g. Data Structures & Algorithms, Biochem Metabolic Pathways' },
    ],
  },

  // INTERVIEW & CAREER MODULES
  {
    id: 'interview-star-drill',
    category: 'interview',
    title: 'Behavioral STAR Method Interview Simulator',
    badge: 'Interviews',
    iconName: 'Briefcase',
    description:
      'Simulates tough behavioral questions (Leadership, Conflict, Failure, Tight Deadlines) and frames responses into the Situation, Task, Action, Result framework.',
    samplePrompt:
      'Act as an Executive Hiring Manager interviewing me for a [TOPIC] role. Give me 3 tough behavioral questions and critique my answers using the STAR method.',
    fields: [
      { key: 'topic', label: 'Job Role & Company Type', placeholder: 'e.g. Senior Frontend Engineer at a Fintech scale-up' },
    ],
  },
  {
    id: 'interview-tech-system-design',
    category: 'coding',
    title: 'System Design & Architecture Prep',
    badge: 'Architecture',
    iconName: 'Code2',
    description:
      'Walks through end-to-end system design: Requirements -> Scale Calculations -> Data Models -> Microservices -> Bottlenecks & Caching.',
    samplePrompt:
      'Guide me step-by-step through designing a scalable system for: [TOPIC]. Cover capacity estimation, API contracts, database schema, caching layers, and high-availability trade-offs.',
    fields: [
      { key: 'topic', label: 'System to Design', placeholder: 'e.g. Real-Time Collaborative Canvas, Global Video Streaming Service' },
    ],
  },
];

export const PreparationModulesModal: React.FC<PreparationModulesModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'youtube' | 'exam' | 'interview' | 'coding'>('all');
  const [activeModule, setActiveModule] = useState<PrepModuleOption>(PREP_MODULES[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const filteredModules =
    selectedCategory === 'all'
      ? PREP_MODULES
      : PREP_MODULES.filter((m) => m.category === selectedCategory);

  const handleLaunch = () => {
    let finalPrompt = activeModule.samplePrompt;
    for (const field of activeModule.fields) {
      const val = formValues[field.key] || field.placeholder.replace('e.g. ', '');
      finalPrompt = finalPrompt.replace('[TOPIC]', val);
    }
    onSelectModule(finalPrompt, activeModule.title);
    onClose();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'youtube':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'exam':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'interview':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'coding':
        return <Code2 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#090D16] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                  Preparation & Mastery Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                  STRUCTURED BLUEPRINTS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Turnkey study roadmaps, YouTube script engines, and technical interview simulations
              </p>
            </div>
          </div>

          <button
            id="btn-close-prep-modules"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-slate-800/60 bg-slate-950/30 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'youtube', label: 'YouTube & Creator' },
            { id: 'exam', label: 'Exams & Academic' },
            { id: 'interview', label: 'Job & Interviews' },
            { id: 'coding', label: 'Architecture & Code' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Split (Module List + Config & Launch Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Module Cards (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-800/80 p-4 space-y-2 overflow-y-auto max-h-[50vh] lg:max-h-full">
            {filteredModules.map((module) => {
              const isSelected = activeModule.id === module.id;
              return (
                <div
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module);
                    setFormValues({});
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(module.category)}
                      <span className="font-bold text-xs text-slate-200">{module.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 font-mono">
                      {module.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Customizer & Quick Launch (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-6 bg-slate-950/20">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                    {activeModule.category.toUpperCase()} PREPARATION
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-medium">{activeModule.badge}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">{activeModule.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeModule.description}
                </p>
              </div>

              {/* Dynamic Field Inputs */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Customize Session Parameters
                </div>
                {activeModule.fields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">{field.label}</label>
                    <input
                      type="text"
                      value={formValues[field.key] || ''}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>

              {/* Prompt Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Base Prompt Structure for Ro
                </span>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 font-mono leading-relaxed">
                  {activeModule.samplePrompt}
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Launches interactive guided session in chat
              </span>
              <button
                id="btn-launch-prep-module"
                onClick={handleLaunch}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <span>Launch Prep Session with Ro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
