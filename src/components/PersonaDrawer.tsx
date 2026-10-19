import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Bot,
  Code2,
  GraduationCap,
  Zap,
  Feather,
  Check,
  RotateCcw,
  Info,
  Mic,
  Volume2,
  Globe,
  Radio,
  Sparkle,
  SlidersHorizontal,
  Video,
  PlaySquare,
  BookOpen,
  Send,
  Wand2,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Settings2,
  ShieldCheck,
  FileCode,
  Flame,
  Target,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { BotPersona, VoiceInputSettings, DEFAULT_VOICE_SETTINGS } from '../types';
import { PERSONAS } from '../data/personas';

interface PersonaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: BotPersona;
  onSelectPersona: (persona: BotPersona) => void;
  systemInstruction: string;
  onUpdateSystemInstruction: (instruction: string) => void;
  temperature: number;
  onUpdateTemperature: (temp: number) => void;
  voiceSettings: VoiceInputSettings;
  onUpdateVoiceSettings: (settings: VoiceInputSettings) => void;
  onSendPrompt?: (prompt: string) => void;
  onOpenThumbnailStudio?: () => void;
  onOpenPrepModules?: () => void;
  onOpenImageGen?: () => void;
}

export const PersonaDrawer: React.FC<PersonaDrawerProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
  systemInstruction,
  onUpdateSystemInstruction,
  temperature,
  onUpdateTemperature,
  voiceSettings,
  onUpdateVoiceSettings,
  onSendPrompt,
  onOpenThumbnailStudio,
  onOpenPrepModules,
  onOpenImageGen,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState(currentPersona.id);
  const [editedInstruction, setEditedInstruction] = useState(systemInstruction);
  const [editedTemp, setEditedTemp] = useState(temperature);
  const [editedVoice, setEditedVoice] = useState<VoiceInputSettings>(voiceSettings || DEFAULT_VOICE_SETTINGS);
  const [activeTab, setActiveTab] = useState<'persona' | 'voice'>('persona');

  // Specific Feature Options State
  const [humanTone, setHumanTone] = useState<'warm' | 'direct' | 'philosophical' | 'witty'>('warm');
  const [codeStack, setCodeStack] = useState<'ts' | 'python' | 'go' | 'node' | 'systems'>('ts');
  const [codeDeliveryMode, setCodeDeliveryMode] = useState<'full' | 'hook' | 'rfc' | 'audit'>('full');
  const [mentalModel, setMentalModel] = useState<'first_principles' | 'feynman' | 'socratic' | '5whys' | 'inversion'>('first_principles');
  const [briefFormat, setBriefFormat] = useState<'3bullets' | 'onepager' | 'checklist' | 'matrix'>('3bullets');
  const [creativeGenre, setCreativeGenre] = useState<'scifi' | 'poetry' | 'copy' | 'dialogue' | 'screenplay'>('scifi');
  const [creatorNiche, setCreatorNiche] = useState<'tech' | 'finance' | 'essay' | 'gaming' | 'education'>('tech');
  const [creatorTool, setCreatorTool] = useState<'titles' | 'hooks' | 'thumbnails'>('titles');
  const [examDomain, setExamDomain] = useState<'stem' | 'cs' | 'med' | 'interview'>('stem');

  // Keep internal state in sync with props
  useEffect(() => {
    setSelectedPersonaId(currentPersona.id);
  }, [currentPersona.id]);

  useEffect(() => {
    setEditedInstruction(systemInstruction);
  }, [systemInstruction]);

  useEffect(() => {
    setEditedTemp(temperature);
  }, [temperature]);

  useEffect(() => {
    if (voiceSettings) {
      setEditedVoice(voiceSettings);
    }
  }, [voiceSettings]);

  if (!isOpen) return null;

  const activePersonaObj = PERSONAS.find((p) => p.id === selectedPersonaId) || currentPersona;

  const handleSelectAndApplyPersona = (persona: BotPersona) => {
    setSelectedPersonaId(persona.id);
    onSelectPersona(persona);
    setEditedInstruction(persona.systemInstruction);
  };

  const handleSave = () => {
    const targetPersona = PERSONAS.find((p) => p.id === selectedPersonaId) || currentPersona;
    if (targetPersona.id !== currentPersona.id) {
      onSelectPersona(targetPersona);
    }
    onUpdateSystemInstruction(editedInstruction);
    onUpdateTemperature(editedTemp);
    onUpdateVoiceSettings(editedVoice);
    onClose();
  };

  const handleResetToPersonaDefault = () => {
    setEditedInstruction(activePersonaObj.systemInstruction);
  };

  const handleResetVoiceDefaults = () => {
    setEditedVoice({ ...DEFAULT_VOICE_SETTINGS });
  };

  const handleLaunchPrompt = (promptText: string) => {
    const targetPersona = PERSONAS.find((p) => p.id === selectedPersonaId) || currentPersona;
    if (targetPersona.id !== currentPersona.id) {
      onSelectPersona(targetPersona);
    }
    onUpdateSystemInstruction(editedInstruction);
    onUpdateTemperature(editedTemp);
    onClose();
    if (onSendPrompt) {
      onSendPrompt(promptText);
    }
  };

  const insertDirective = (text: string) => {
    setEditedInstruction((prev) => (prev ? `${prev}\n- ${text}` : `- ${text}`));
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-4 h-4 text-indigo-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-blue-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Feather':
        return <Feather className="w-4 h-4 text-pink-400" />;
      case 'Video':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'Sliders':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bot className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0D131F] h-full shadow-2xl flex flex-col z-10 border-l border-slate-800 text-slate-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0B0E14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-medium shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>Bot Persona & System Settings</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  {activePersonaObj.badge}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose a role preset to unlock its specific specialized toolkit
              </p>
            </div>
          </div>
          <button
            id="btn-close-persona-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs in Drawer */}
        <div className="flex items-center border-b border-slate-800 bg-[#090D15] px-5 pt-2">
          <button
            id="tab-btn-persona-settings"
            onClick={() => setActiveTab('persona')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'persona'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Persona & Specific Features</span>
          </button>

          <button
            id="tab-btn-voice-settings"
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'voice'
                ? 'border-red-500 text-red-300 bg-red-950/20 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-red-400" />
            <span>Voice & Dictation</span>
            {editedVoice.continuousListening && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'voice' ? (
            /* Voice-to-Text & SpeechRecognition Settings Section */
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Section Header */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-900 to-indigo-950/40 border border-red-500/30 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    Voice Dictation & SpeechRecognition
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Fine-tune continuous audio capture, sensitivity gain, and multilingual recognition for peak transcription reliability.
                  </p>
                </div>
              </div>

              {/* 1. Continuous Listening Toggle */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-red-400 shrink-0" />
                      <label htmlFor="toggle-continuous-listening" className="text-xs font-bold text-slate-200 cursor-pointer">
                        Continuous Listening Mode
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Keeps listening and capturing spoken words across natural pauses until you explicitly stop recording. Prevents premature cut-offs while thinking.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    id="toggle-continuous-listening"
                    type="button"
                    role="switch"
                    aria-checked={editedVoice.continuousListening}
                    onClick={() =>
                      setEditedVoice((prev) => ({
                        ...prev,
                        continuousListening: !prev.continuousListening,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      editedVoice.continuousListening ? 'bg-red-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        editedVoice.continuousListening ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      editedVoice.continuousListening
                        ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {editedVoice.continuousListening ? 'Continuous (Recommended)' : 'Single Phrase Only'}
                  </span>
                </div>
              </div>

              {/* 2. Voice Input Sensitivity Slider */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
                    <label htmlFor="slider-voice-sensitivity" className="text-xs font-bold text-slate-200 cursor-pointer">
                      Voice Input Sensitivity &amp; Gain
                    </label>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                    {editedVoice.sensitivity}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Adjust microphone amplification and silence thresholds. Boost for whisper/soft voices or distant microphones; decrease to reject ambient background noise.
                </p>

                {/* Slider */}
                <input
                  id="slider-voice-sensitivity"
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={editedVoice.sensitivity}
                  onChange={(e) =>
                    setEditedVoice((prev) => ({
                      ...prev,
                      sensitivity: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                {/* Sensitivity labels */}
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>20% (Noise Filtered)</span>
                  <span>60% (Balanced)</span>
                  <span>100% (High Gain / Soft Voice)</span>
                </div>

                {/* Dynamic Sensitivity Rating Badge */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Microphone Profile:</span>
                  <span className="font-medium text-slate-200">
                    {editedVoice.sensitivity <= 40
                      ? '🛡️ High Noise Suppression (Cafe / Office)'
                      : editedVoice.sensitivity <= 75
                      ? '🎙️ Balanced Standard (Room / Headset)'
                      : '🔊 High Sensitivity (Quiet Room / Soft Voice)'}
                  </span>
                </div>
              </div>

              {/* 3. Dictation Language Selection */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <label htmlFor="select-voice-language" className="text-xs font-bold text-slate-200 cursor-pointer">
                    Speech Recognition Language &amp; Accent
                  </label>
                </div>

                <p className="text-[11px] text-slate-400">
                  Sets the primary phonetic dictionary used by speech recognition engines for accent matching.
                </p>

                <select
                  id="select-voice-language"
                  value={editedVoice.language}
                  onChange={(e) =>
                    setEditedVoice((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="auto">🌐 Auto-Detect (System &amp; Browser Language)</option>
                  <option value="en-US">🇺🇸 English (United States)</option>
                  <option value="en-GB">🇬🇧 English (United Kingdom)</option>
                  <option value="en-IN">🇮🇳 English (India)</option>
                  <option value="en-AU">🇦🇺 English (Australia)</option>
                  <option value="en-CA">🇨🇦 English (Canada)</option>
                  <option value="es-ES">🇪🇸 Spanish (Español)</option>
                  <option value="fr-FR">🇫🇷 French (Français)</option>
                  <option value="de-DE">🇩🇪 German (Deutsch)</option>
                  <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
                  <option value="zh-CN">🇨🇳 Chinese (Mandarin / 普通话)</option>
                  <option value="ja-JP">🇯🇵 Japanese (日本語)</option>
                  <option value="pt-BR">🇧🇷 Portuguese (Brasil)</option>
                  <option value="it-IT">🇮🇹 Italian (Italiano)</option>
                  <option value="ru-RU">🇷🇺 Russian (Русский)</option>
                  <option value="ar-SA">🇸🇦 Arabic (العربية)</option>
                </select>
              </div>

              {/* 4. AI Multimodal Audio Fallback & Auto-Send */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3.5 shadow-xs">
                {/* Fallback switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <label htmlFor="toggle-ai-fallback" className="text-xs font-bold text-slate-200 cursor-pointer">
                        Gemini Multimodal AI Audio Fallback
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      If browser SpeechRecognition fails or is restricted in the iframe, automatically captures audio via MediaRecorder and transcribes with Gemini AI.
                    </p>
                  </div>

                  <button
                    id="toggle-ai-fallback"
                    type="button"
                    role="switch"
                    aria-checked={editedVoice.useAiFallback}
                    onClick={() =>
                      setEditedVoice((prev) => ({
                        ...prev,
                        useAiFallback: !prev.useAiFallback,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      editedVoice.useAiFallback ? 'bg-amber-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        editedVoice.useAiFallback ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    id="btn-reset-voice-settings"
                    type="button"
                    onClick={handleResetVoiceDefaults}
                    className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Voice Settings to Default</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Persona & System Instruction Section */
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 1. ROLE PRESETS SELECTION */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Role Presets
                  </label>
                  <span className="text-[11px] text-indigo-400 font-medium">
                    Click any preset to unlock its specific tools
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {PERSONAS.map((persona) => {
                    const isSelected = persona.id === selectedPersonaId;
                    return (
                      <button
                        key={persona.id}
                        id={`btn-select-persona-${persona.id}`}
                        onClick={() => handleSelectAndApplyPersona(persona)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-slate-100 shadow-md ring-1 ring-indigo-500/40'
                            : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
                        }`}>
                          {getPersonaIcon(persona.iconName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-100 truncate">
                              {persona.name}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 font-medium rounded-full shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {persona.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {persona.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-indigo-400 shrink-0 mt-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SPECIFIC FEATURE TOOLKIT FOR THE SPECIFIC OPTION */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/30 via-slate-900 to-slate-900/90 border border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in duration-200">
                {/* Header for Specific Option */}
                <div className="flex items-center justify-between pb-2.5 border-b border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <span>Specific Feature: {activePersonaObj.name}</span>
                      </h4>
                      <p className="text-[10.5px] text-indigo-300/80">
                        Specialized controls and 1-click generators for this role
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Active Toolkit
                  </span>
                </div>

                {/* Dynamic Content depending on which specific persona is selected */}
                {selectedPersonaId === 'ro-human-companion' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        🌱 Human Tone &amp; Cadence Profile:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'warm', label: 'Warm & Empathetic', desc: 'Supportive & grounded' },
                          { id: 'direct', label: 'Direct & Unvarnished', desc: 'Clear, candid truth' },
                          { id: 'philosophical', label: 'Philosophical', desc: 'Nuanced deep thinker' },
                          { id: 'witty', label: 'Playful & Witty', desc: 'Smart & conversational' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setHumanTone(item.id as any);
                              insertDirective(`Adopt a ${item.label.toLowerCase()} conversational tone.`);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              humanTone === item.id
                                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="text-[11px] font-bold text-slate-200">{item.label}</div>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Human Voice Protections Active:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          ✓ Banned Robotic Preambles
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          ✓ High Perplexity Sentence Burstiness
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          ✓ Zero AI Clichés
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPersonaId === 'ro-engineer' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        💻 Target Ecosystem &amp; Language:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'ts', label: 'TypeScript / React 19' },
                          { id: 'python', label: 'Python / FastAPI' },
                          { id: 'go', label: 'Go / Rust' },
                          { id: 'node', label: 'Node.js / PostgreSQL' },
                          { id: 'systems', label: 'C++ / Systems' },
                        ].map((stack) => (
                          <button
                            key={stack.id}
                            type="button"
                            onClick={() => {
                              setCodeStack(stack.id as any);
                              insertDirective(`Focus on production-grade ${stack.label} conventions with strict typing.`);
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-all cursor-pointer ${
                              codeStack === stack.id
                                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            {stack.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        ⚙️ Engineering Delivery Mode:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'full', label: 'Full Production Module', desc: 'Strict types & defensive guards' },
                          { id: 'hook', label: 'Micro-Utility / Hook', desc: 'Zero-boilerplate helper' },
                          { id: 'rfc', label: 'Architecture RFC', desc: 'Data flows & trade-off analysis' },
                          { id: 'audit', label: 'Code Review & Audit', desc: 'Find memory leaks & bottlenecks' },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => {
                              setCodeDeliveryMode(mode.id as any);
                              insertDirective(`Output format: ${mode.label} with architectural rationales.`);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              codeDeliveryMode === mode.id
                                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="text-[11px] font-bold text-slate-200">{mode.label}</div>
                            <div className="text-[10px] text-slate-400">{mode.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPersonaId === 'ro-mentor' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        🧠 Mental Model &amp; Socratic Framework:
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { id: 'first_principles', name: 'First Principles Thinking', desc: 'Deconstruct assumptions to fundamental axioms' },
                          { id: 'feynman', name: 'Feynman 5-Level Technique', desc: 'Explain concepts simply from child to advanced level' },
                          { id: 'socratic', name: 'Socratic Questioning', desc: 'Guide through deep inquiry and dialectic questions' },
                          { id: '5whys', name: '5 Whys Root Cause', desc: 'Drill down to the core underlying cause' },
                          { id: 'inversion', name: 'Inversion (Antifragility)', desc: 'Think in reverse: analyze how failure occurs first' },
                        ].map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setMentalModel(model.id as any);
                              insertDirective(`Use the ${model.name} framework to guide my understanding.`);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                              mentalModel === model.id
                                ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <div>
                              <div className="text-[11px] font-bold text-slate-200">{model.name}</div>
                              <div className="text-[10px] text-slate-400">{model.desc}</div>
                            </div>
                            {mentalModel === model.id && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPersonaId === 'ro-summarizer' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        ⚡ Output Brief Structure:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: '3bullets', label: 'Strict 3-Bullet TL;DR', desc: 'Ultra-compressed takeaways' },
                          { id: 'onepager', label: 'Executive One-Pager', desc: 'High-level executive summary' },
                          { id: 'checklist', label: 'Action Items & Owners', desc: 'Next steps with deadlines' },
                          { id: 'matrix', label: 'Decision Grid', desc: 'Pros, cons & final verdict' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => {
                              setBriefFormat(fmt.id as any);
                              insertDirective(`Format response strictly as a ${fmt.label}.`);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              briefFormat === fmt.id
                                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="text-[11px] font-bold text-slate-200">{fmt.label}</div>
                            <div className="text-[10px] text-slate-400">{fmt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPersonaId === 'ro-writer' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        🖋️ Narrative Style &amp; Genre:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'scifi', label: 'Atmospheric Sci-Fi' },
                          { id: 'poetry', label: 'Poetic & Lyrical' },
                          { id: 'copy', label: 'Brand Copy & Story' },
                          { id: 'dialogue', label: 'High-Tension Dialogue' },
                          { id: 'screenplay', label: 'Cinematic Script' },
                        ].map((genre) => (
                          <button
                            key={genre.id}
                            type="button"
                            onClick={() => {
                              setCreativeGenre(genre.id as any);
                              insertDirective(`Write in a vivid ${genre.label} style with rich sensory immersion.`);
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-all cursor-pointer ${
                              creativeGenre === genre.id
                                ? 'bg-pink-950/60 border-pink-500 text-pink-200'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            {genre.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPersonaId === 'ro-youtube-creator' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        🎬 Creator Toolkit &amp; Niche:
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          { id: 'tech', label: 'Tech & Coding' },
                          { id: 'finance', label: 'Finance & Growth' },
                          { id: 'essay', label: 'Video Essays' },
                          { id: 'gaming', label: 'Gaming' },
                          { id: 'education', label: 'Tutorials' },
                        ].map((niche) => (
                          <button
                            key={niche.id}
                            type="button"
                            onClick={() => {
                              setCreatorNiche(niche.id as any);
                              insertDirective(`Optimize YouTube packaging for the ${niche.label} niche.`);
                            }}
                            className={`px-2 py-0.5 text-[10px] rounded-lg border font-medium transition-all cursor-pointer ${
                              creatorNiche === niche.id
                                ? 'bg-red-950/80 border-red-500 text-red-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            {niche.label}
                          </button>
                        ))}
                      </div>

                      {/* Direct Launch to Thumbnail Studio */}
                      {onOpenThumbnailStudio && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenThumbnailStudio();
                          }}
                          className="w-full mt-2 p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                        >
                          <PlaySquare className="w-4 h-4" />
                          <span>Open Visual Thumbnail Studio Modal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {selectedPersonaId === 'ro-exam-prep' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                        🎓 Academic Focus &amp; Prep Tool:
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          { id: 'stem', label: 'STEM & Math' },
                          { id: 'cs', label: 'Computer Science' },
                          { id: 'med', label: 'Medical & Bio' },
                          { id: 'interview', label: 'STAR Interviews' },
                        ].map((dom) => (
                          <button
                            key={dom.id}
                            type="button"
                            onClick={() => {
                              setExamDomain(dom.id as any);
                              insertDirective(`Focus coaching on ${dom.label} with high-yield active recall questions.`);
                            }}
                            className={`px-2 py-0.5 text-[10px] rounded-lg border font-medium transition-all cursor-pointer ${
                              examDomain === dom.id
                                ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            {dom.label}
                          </button>
                        ))}
                      </div>

                      {/* Direct Launch to Prep Modules */}
                      {onOpenPrepModules && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenPrepModules();
                          }}
                          className="w-full mt-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Open High-Yield Prep Modules</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {selectedPersonaId === 'custom-role' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      🛠️ Custom Role Quick Starters:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Mock Technical Interviewer',
                        'Spanish Language Practice Partner',
                        'Product Manager & RFC Reviewer',
                        'Venture Capital Pitch Coach',
                      ].map((roleText) => (
                        <button
                          key={roleText}
                          type="button"
                          onClick={() => insertDirective(`Act as a ${roleText}.`)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 hover:border-indigo-500 cursor-pointer"
                        >
                          + {roleText}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Click Actionable Prompts for the Specific Selected Persona */}
                <div className="pt-2 border-t border-indigo-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                      <Send className="w-3 h-3 text-indigo-400" />
                      <span>1-Click Launch with this Feature:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Instant Chat Action</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {activePersonaObj.suggestedPrompts.slice(0, 3).map((promptText, pIdx) => (
                      <button
                        key={pIdx}
                        id={`btn-launch-prompt-${pIdx}`}
                        type="button"
                        onClick={() => handleLaunchPrompt(promptText)}
                        className="w-full text-left p-2 rounded-xl bg-slate-950/80 hover:bg-indigo-950/50 border border-slate-800/90 hover:border-indigo-500/60 text-slate-300 hover:text-white text-xs transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate pr-2">{promptText}</span>
                        <div className="flex items-center gap-1 text-[10px] text-indigo-400 group-hover:text-indigo-300 font-semibold shrink-0">
                          <span>Send</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. SYSTEM INSTRUCTION EDITOR */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="system-instruction-textarea"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1"
                  >
                    <span>Refined System Instruction</span>
                  </label>
                  <button
                    id="btn-reset-system-instruction"
                    onClick={handleResetToPersonaDefault}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                    title="Reset to preset default"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Preset Default</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Defines the AI's core behavior, tone, constraints, and output formatting.
                </p>

                <textarea
                  id="system-instruction-textarea"
                  rows={5}
                  value={editedInstruction}
                  onChange={(e) => setEditedInstruction(e.target.value)}
                  placeholder="e.g. You are a Senior TypeScript Architect. Always output strict types..."
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed text-slate-200 bg-slate-900/90 placeholder-slate-600"
                />

                {/* Quick Directive Injectors */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-400">
                    Quick Directives &amp; Craft Rules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Organic burstiness (vary sentence lengths)',
                      'Ban robotic AI filler words and clichés',
                      'Production-ready idiomatic code with architectural comments',
                      'Direct, candid, human-grounded tone',
                      'Always format key points in bullet lists',
                      'Provide code samples with type definitions',
                    ].map((rule, idx) => (
                      <button
                        key={idx}
                        id={`btn-rule-${idx}`}
                        onClick={() => insertDirective(rule)}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-900 hover:bg-indigo-950 hover:text-indigo-300 text-slate-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        + {rule}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. TEMPERATURE SETTING */}
              <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Creativity &amp; Temperature</span>
                  <span className="font-mono text-indigo-400">{editedTemp.toFixed(2)}</span>
                </div>
                <input
                  id="input-temperature-slider"
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={editedTemp}
                  onChange={(e) => setEditedTemp(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.0 (Strict / Deterministic)</span>
                  <span>0.7 (Balanced)</span>
                  <span>1.5 (Creative)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0E14] flex items-center gap-2 justify-end">
          <button
            id="btn-cancel-persona"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-persona"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-colors cursor-pointer"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

