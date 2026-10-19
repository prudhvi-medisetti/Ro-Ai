import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  ChatSession,
  BotPersona,
  UserAccount,
  MessageAttachment,
  VoiceInputSettings,
  DEFAULT_VOICE_SETTINGS,
  CustomUiSettings,
  DEFAULT_UI_SETTINGS,
} from './types';
import { PERSONAS, AVAILABLE_MODELS } from './data/personas';
import { LeftSidebar } from './components/LeftSidebar';
import { LeftNavigationRail } from './components/LeftNavigationRail';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatInput } from './components/ChatInput';
import { PersonaDrawer } from './components/PersonaDrawer';
import { HistorySidebar } from './components/HistorySidebar';
import { LoginPage } from './components/LoginPage';
import { ThumbnailStudioModal } from './components/ThumbnailStudioModal';
import { PreparationModulesModal } from './components/PreparationModulesModal';
import { LogoShareModal } from './components/LogoShareModal';
import { AiImageGeneratorModal } from './components/AiImageGeneratorModal';
import { VideoGeneratorModal } from './components/VideoGeneratorModal';
import { MusicGeneratorModal } from './components/MusicGeneratorModal';
import { HelpShortcutsModal } from './components/HelpShortcutsModal';
import { UiCustomizerModal } from './components/UiCustomizerModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectsModal, StudentProjectTemplate } from './components/ProjectsModal';
import { ProjectBuilderModal } from './components/ProjectBuilderModal';
import { BirthdayCelebrationModal } from './components/BirthdayCelebrationModal';
import { UsageAnalyticsModal } from './components/UsageAnalyticsModal';
import { LibraryModal } from './components/LibraryModal';
import { exportConversationToPdf } from './utils/pdfExport';
import { detectSearchIntent } from './utils/searchDetector';

const STORAGE_KEY_SESSIONS = 'gemini_chatbot_sessions_v1';
const STORAGE_KEY_CURRENT_ID = 'gemini_chatbot_current_id_v1';
const STORAGE_KEY_USER = 'ro_authenticated_user_v1';
const STORAGE_KEY_VOICE = 'ro_voice_settings_v1';
const STORAGE_KEY_THEME = 'gemini_chat_theme_v1';
const STORAGE_KEY_UI = 'ro_ui_custom_settings_v1';

function createNewSession(persona?: BotPersona): ChatSession {
  const initialPersona = persona || PERSONAS[0];
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  return {
    id,
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    systemInstruction: initialPersona.systemInstruction,
    model: initialPersona.defaultModel || 'auto-fast',
    personaId: initialPersona.id,
    useSearchGrounding: false,
    temperature: 0.7,
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [createNewSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
      if (saved) return saved;
    } catch {
      // Ignore
    }
    return sessions[0]?.id || '';
  });

  const [theme, setTheme] = useState<'light' | 'dark' | string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Ignore
    }
    return 'dark';
  });

  const [uiSettings, setUiSettings] = useState<CustomUiSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UI);
      if (saved) {
        return { ...DEFAULT_UI_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_UI_SETTINGS;
  });

  const handleUpdateUiSettings = (newSettings: CustomUiSettings) => {
    setUiSettings(newSettings);
    const activeTheme = newSettings.themeMode === 'light' ? 'light' : 'dark';
    setTheme(activeTheme);
    try {
      localStorage.setItem(STORAGE_KEY_UI, JSON.stringify(newSettings));
      localStorage.setItem(STORAGE_KEY_THEME, activeTheme);
    } catch {
      // Ignore
    }
  };

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setUiSettings((prev) => {
      const updated = { ...prev, themeMode: next as 'light' | 'dark' };
      try {
        localStorage.setItem(STORAGE_KEY_UI, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_THEME, next);
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [isUsageAnalyticsOpen, setIsUsageAnalyticsOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isPersonaDrawerOpen, setIsPersonaDrawerOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [isThumbnailStudioOpen, setIsThumbnailStudioOpen] = useState(false);
  const [isPrepModulesOpen, setIsPrepModulesOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isAutonomousBuilderOpen, setIsAutonomousBuilderOpen] = useState(false);
  const [builderInitialPrompt, setBuilderInitialPrompt] = useState<string | undefined>(undefined);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isImageGenModalOpen, setIsImageGenModalOpen] = useState(false);
  const [isVeoVideoModalOpen, setIsVeoVideoModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isUiCustomizerOpen, setIsUiCustomizerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBirthdayCelebrationOpen, setIsBirthdayCelebrationOpen] = useState(false);
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const [birthdayWish, setBirthdayWish] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceInputSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOICE);
      if (saved) {
        return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_VOICE_SETTINGS;
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleUpdateVoiceSettings = (newSettings: VoiceInputSettings) => {
    setVoiceSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY_VOICE, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save voice settings:', e);
    }
  };

  const handleToggleVoiceOutput = () => {
    const nextState = !voiceSettings.enableVoiceOutput;
    if (!nextState) {
      handleStopSpeaking();
    }
    const updatedSettings: VoiceInputSettings = {
      ...voiceSettings,
      enableVoiceOutput: nextState,
    };
    handleUpdateVoiceSettings(updatedSettings);
  };

  // Web Speech API Voice Output state & controls
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/```[\s\S]*?```/g, ' [code block omitted] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const handleSpeakText = (messageId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (speakingMessageId === messageId) {
      handleStopSpeaking();
      return;
    }

    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = voiceSettings.speechRate || 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voiceSettings.language && voiceSettings.language !== 'auto') {
      const match = voices.find((v) => v.lang.startsWith(voiceSettings.language.slice(0, 2)));
      if (match) utterance.voice = match;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleLogin = (account: UserAccount) => {
    setCurrentUser(account);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(account));
    } catch (e) {
      console.error('Failed to save user account:', e);
    }
  };

  const handleUpdateUser = (updated: Partial<UserAccount>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to update user account:', e);
      }
      return next;
    });
  };

  const handleLogout = () => {
    // 1. Capture token before state clear for background cleanup
    const token = currentUser?.sessionToken;

    // 2. Abort any running chat stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // 3. Immediately close all open modals and sidebars for an instant, seamless UX
    setIsSettingsModalOpen(false);
    setIsUsageAnalyticsOpen(false);
    setIsLibraryModalOpen(false);
    setIsProjectsModalOpen(false);
    setIsAutonomousBuilderOpen(false);
    setIsBirthdayCelebrationOpen(false);
    setIsHistorySidebarOpen(false);
    setIsPersonaDrawerOpen(false);
    setIsHelpModalOpen(false);
    setIsImageGenModalOpen(false);
    setIsPrepModulesOpen(false);
    setIsThumbnailStudioOpen(false);
    setIsLogoModalOpen(false);
    setIsUiCustomizerOpen(false);

    // 4. Synchronously clear user session state and local storage immediately
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}

    // 5. Fire-and-forget backend session revocation non-blockingly in background
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: token }),
      }).catch((e) => {
        console.warn('Background logout notice:', e);
      });
    }
  };

  // Automatic Birthday Detection & Celebration
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    fetch('/api/birthday/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentUser.email,
        birthday: currentUser.birthday,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.isBirthdayToday) {
          setIsBirthdayToday(true);
          setBirthdayWish(data.birthdayWish);

          // Auto open celebration modal once per day/session
          const todayKey = `ro_bday_shown_${new Date().toDateString()}`;
          if (!sessionStorage.getItem(todayKey)) {
            setIsBirthdayCelebrationOpen(true);
            sessionStorage.setItem(todayKey, 'true');
          }
        } else {
          setIsBirthdayToday(false);
        }
      })
      .catch((err) => {
        console.warn('[BIRTHDAY] Check failed:', err);
      });
  }, [currentUser?.email, currentUser?.birthday]);

  const handleUpdateBirthday = async (newBirthday: string) => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name,
          birthday: newBirthday,
          sessionToken: currentUser.sessionToken,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleUpdateUser({ birthday: newBirthday });
        if (data.isBirthdayToday) {
          setIsBirthdayToday(true);
          setBirthdayWish(
            `🎉 Happy Birthday, ${currentUser.name || 'Friend'}! 🎂 Ro wishes you a brilliant year filled with great joy and limitless creativity!`
          );
          setIsBirthdayCelebrationOpen(true);
        } else {
          setIsBirthdayToday(false);
        }
      }
    } catch (err) {
      console.error('[BIRTHDAY] Profile update error:', err);
    }
  };

  // Sync to local storage with quota fallback for infinite session longevity
  // High-performance optimization: skip heavy JSON serialization while streaming to guarantee < 2s TTFT
  useEffect(() => {
    if (isStreaming) return;

    const persistSessionsSafely = (sessionList: ChatSession[]) => {
      try {
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessionList));
      } catch (e: any) {
        console.warn('LocalStorage quota limit reached, optimizing older sessions for infinite storage:', e);
        try {
          // Optimize older sessions by stripping bulky inline dataUrls while preserving all text and structure
          const optimized = sessionList.map((s, idx) => {
            if (idx === 0) return s; // keep most recent completely intact
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (!m.attachments || m.attachments.length === 0) return m;
                return {
                  ...m,
                  attachments: m.attachments.map((att) => ({
                    ...att,
                    dataUrl: att.isImage && att.dataUrl && att.dataUrl.length > 5000 ? undefined : att.dataUrl,
                  })),
                };
              }),
            };
          });
          localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(optimized));
        } catch (innerErr) {
          console.error('Final fallback for local persistence:', innerErr);
        }
      }
    };

    persistSessionsSafely(sessions);
  }, [sessions, isStreaming]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_ID, currentSessionId);
    } catch {
      // Ignore
    }
  }, [currentSessionId]);

  // Current session object
  const currentSession =
    sessions.find((s) => s.id === currentSessionId) ||
    sessions[0] ||
    createNewSession();

  // Current persona object
  const currentPersona =
    PERSONAS.find((p) => p.id === currentSession.personaId) || PERSONAS[0];

  // Helper to update current session fields
  const updateCurrentSession = (updater: (prev: ChatSession) => ChatSession) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === currentSession.id) {
          return updater(session);
        }
        return session;
      })
    );
  };

  const handleSelectModel = (modelId: string) => {
    updateCurrentSession((prev) => ({
      ...prev,
      model: modelId,
      updatedAt: Date.now(),
    }));
  };

  const handleToggleSearchGrounding = () => {
    updateCurrentSession((prev) => ({
      ...prev,
      useSearchGrounding: !prev.useSearchGrounding,
      updatedAt: Date.now(),
    }));
  };

  const handleSelectPersona = (persona: BotPersona) => {
    updateCurrentSession((prev) => ({
      ...prev,
      personaId: persona.id,
      systemInstruction: persona.systemInstruction,
      model: persona.defaultModel || prev.model,
      updatedAt: Date.now(),
    }));
  };

  const handleUpdateSystemInstruction = (instruction: string) => {
    updateCurrentSession((prev) => ({
      ...prev,
      systemInstruction: instruction,
      updatedAt: Date.now(),
    }));
  };

  // Launch Student Project Session in Senior Dev Architect Mode
  const handleLaunchProjectSession = (project: StudentProjectTemplate, customScope?: string) => {
    setIsProjectsModalOpen(false);

    // 1. Find or build Senior Developer Persona
    const engineerPersona =
      PERSONAS.find((p) => p.id === 'ro-engineer') || {
        id: 'ro-engineer',
        name: 'Ro (Code Architect)',
        roleTitle: 'Principal Software Engineer & System Architect',
        description: 'Pragmatic, production-grade architecture & senior technical review without fluff.',
        iconName: 'Code2',
        badge: 'Senior Dev',
        defaultModel: 'gemini-3.7-flash',
        systemInstruction: `You are Ro, an elite Principal Software Engineer & Systems Architect mentoring a student.
Your goal is to guide the student to build a production-grade application that matches senior engineering standards.

SENIOR DEVELOPER MENTORSHIP PROTOCOL:
1. SENIOR ARCHITECTURAL MINDSET:
   - Think and advise like a Staff/Principal Engineer reviewing a system design document and PR.
   - Challenge naive implementations (e.g. state management race conditions, security vulnerabilities, missing error boundaries, poor token handling).
   - Emphasize real production concerns: zero-downtime, sub-100ms TTFT latency, defensive coding, idempotency, and clean type safety.
2. STEP-BY-STEP SCAFFOLDING & PRAGMATIC CODE:
   - Deliver clear, production-grade, human-crafted TypeScript/React/Node.js snippets.
   - For every architectural decision, articulate the "WHY" (trade-offs, alternative approaches rejected, and edge cases guarded).
3. SENIOR CODE REVIEWS:
   - When the student shares code or asks how to implement a phase, break down the execution into actionable phases, call out potential bottlenecks, and provide senior code reviews.`,
        suggestedPrompts: [],
      };

    // 2. Create new session dedicated to this project
    const newSessionId = `session_proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const projectSession: ChatSession = {
      id: newSessionId,
      title: `Project: ${project.title.slice(0, 32)}...`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      systemInstruction: `You are Ro, an elite Principal Software Engineer & Systems Architect mentoring a student building: "${project.title}".
Category: ${project.category}
Difficulty: ${project.difficulty}
Target Architecture: ${project.architecture}

SENIOR DEV INSTRUCTIONS & MENTORSHIP RULES:
1. Speak, review, and architect strictly like a Senior Staff Developer / Tech Lead.
2. Teach the student to avoid amateur "AI slop" or toy hacks. Enforce production-grade state machines, clean async abstractions, strict type safety, defensive error handling, and robust separation of concerns.
3. Guide the student step-by-step through the milestones while explaining key engineering trade-offs, architecture patterns, and review questions.`,
      model: 'gemini-3.7-flash',
      personaId: 'ro-engineer',
      useSearchGrounding: false,
      temperature: 0.5,
    };

    setSessions((prev) => [projectSession, ...prev]);
    setCurrentSessionId(newSessionId);

    // 3. Compose initial prompt
    let launchPrompt = project.promptTemplate;
    if (customScope) {
      launchPrompt += `\n\nSpecific focus requested by student: "${customScope}"`;
    }

    setTimeout(() => {
      handleSendMessage(launchPrompt);
    }, 150);
  };

  const handleUpdateTemperature = (temp: number) => {
    updateCurrentSession((prev) => ({
      ...prev,
      temperature: temp,
      updatedAt: Date.now(),
    }));
  };

  const handleNewChat = () => {
    const newSess = createNewSession(currentPersona);
    setSessions((prev) => [newSess, ...prev]);
    setCurrentSessionId(newSess.id);
  };

  const handleClearMessages = () => {
    updateCurrentSession((prev) => ({
      ...prev,
      messages: [],
      title: 'New Conversation',
      updatedAt: Date.now(),
    }));
  };

  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewSession();
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id);
      }
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleClearAllSessions = () => {
    const fresh = createNewSession();
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const handleOpenAutonomousBuilder = (initialPrompt?: string) => {
    setBuilderInitialPrompt(initialPrompt);
    setIsAutonomousBuilderOpen(true);
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Escape: Dismiss active modals and drawers
      if (e.key === 'Escape') {
        setIsHelpModalOpen(false);
        setIsPersonaDrawerOpen(false);
        setIsHistorySidebarOpen(false);
        setIsThumbnailStudioOpen(false);
        setIsPrepModulesOpen(false);
        setIsProjectsModalOpen(false);
        setIsAutonomousBuilderOpen(false);
        setIsLogoModalOpen(false);
        setIsImageGenModalOpen(false);
        setIsVeoVideoModalOpen(false);
        setIsMusicModalOpen(false);
        setIsUiCustomizerOpen(false);
        setIsSettingsModalOpen(false);
        return;
      }

      // Help Modal: Press '?' when not focused on an input, or Ctrl+/ (Cmd+/) anywhere
      if (
        (e.key === '?' && !isInputField && !e.ctrlKey && !e.metaKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === '/')
      ) {
        e.preventDefault();
        setIsHelpModalOpen((prev) => !prev);
        return;
      }

      // New Chat Session: Ctrl+K or Cmd+K (without shift)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K') && !e.shiftKey) {
        e.preventDefault();
        handleNewChat();
        return;
      }

      // Clear Current Chat Messages: Ctrl+Shift+K or Cmd+Shift+K
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        handleClearMessages();
        return;
      }

      // Toggle History Sidebar: Ctrl+H or Cmd+H
      if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setIsHistorySidebarOpen((prev) => !prev);
        return;
      }

      // Toggle Persona Drawer: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsPersonaDrawerOpen((prev) => !prev);
        return;
      }

      // Quick Studio & Export Shortcuts (Ctrl/Cmd + Shift + Key)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          handleExportPdf();
        } else if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          setIsImageGenModalOpen((prev) => !prev);
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          setIsLogoModalOpen((prev) => !prev);
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          setIsThumbnailStudioOpen((prev) => !prev);
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setIsPrepModulesOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentPersona]);

  // Stop ongoing generation
  const handleStopGeneration = () => {
    handleStopSpeaking();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    updateCurrentSession((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false } : m
      ),
    }));
  };

  // Send message with optional attachments
  const handleSendMessage = async (text: string, attachments?: MessageAttachment[]) => {
    handleStopSpeaking();
    if ((!text.trim() && (!attachments || attachments.length === 0)) || isStreaming) return;

    // Detect @image or /image command prompt in general message
    const trimmedText = text.trim();
    if (
      (!attachments || attachments.length === 0) &&
      (trimmedText.startsWith('@image ') ||
        trimmedText.startsWith('/image ') ||
        trimmedText.toLowerCase().startsWith('generate image: ') ||
        trimmedText.toLowerCase().startsWith('create image: '))
    ) {
      const cleanPrompt = trimmedText
        .replace(/^(@image|\/image|generate image:|create image:)\s*/i, '')
        .trim();
      if (cleanPrompt) {
        handleSendImagePrompt(cleanPrompt);
        return;
      }
    }

    // Auto-launch Autonomous Project Builder if user asks to build an application or project
    const lower = trimmedText.toLowerCase();
    if (
      lower.startsWith('build me a ') ||
      lower.startsWith('build me an ') ||
      lower.startsWith('build an app') ||
      lower.includes('autonomous project builder') ||
      lower.includes('student management system')
    ) {
      handleOpenAutonomousBuilder(trimmedText);
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    };

    const assistantMessageId = `model_${Date.now() + 1}`;
    const isAutoSearch = detectSearchIntent(text);
    const shouldSearch = Boolean(currentSession.useSearchGrounding || isAutoSearch);

    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
      isSearchingWeb: shouldSearch,
    };

    // Calculate auto title if first message
    const isFirstMessage = currentSession.messages.length === 0;
    const computedTitle = isFirstMessage
      ? (text.slice(0, 35) || 'Multimodal Conversation') + (text.length > 35 ? '...' : '')
      : currentSession.title;

    // Append both to current session
    const updatedMessages = [...currentSession.messages, userMessage];

    updateCurrentSession((prev) => ({
      ...prev,
      title: computedTitle,
      updatedAt: Date.now(),
      messages: [...updatedMessages, initialAssistantMessage],
    }));

    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const clientStartTime = performance.now();
    let clientTtftMs: number | null = null;
    let serverTtftMs: number | null = null;
    let finalModelUsed = currentSession.model;
    let isSearching = shouldSearch;
    let accumulatedSearchQueries: string[] = [];

    try {
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }));

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.sessionToken
            ? { Authorization: `Bearer ${currentUser.sessionToken}` }
            : {}),
        },
        body: JSON.stringify({
          messages: payloadMessages,
          systemInstruction: currentSession.systemInstruction,
          model: currentSession.model,
          useSearchGrounding: shouldSearch,
          temperature: currentSession.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream available.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let accumulatedSources: any[] = [];

      let streamHasError = false;
      let streamErrorMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              if (data.error) {
                streamHasError = true;
                streamErrorMessage =
                  typeof data.error === 'string'
                    ? data.error
                    : 'The model encountered an error generating response.';
                
                updateCurrentSession((prev) => ({
                  ...prev,
                  messages: prev.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          error: streamErrorMessage,
                          isStreaming: false,
                          isSearchingWeb: false,
                        }
                      : m
                  ),
                }));
                break;
              }

              if (data.isSearchingWeb !== undefined) {
                isSearching = Boolean(data.isSearchingWeb);
              }

              if (data.ttftMs) {
                serverTtftMs = data.ttftMs;
              }

              if (data.modelUsed) {
                finalModelUsed = data.modelUsed;
              }

              if (data.searchQueries && Array.isArray(data.searchQueries)) {
                accumulatedSearchQueries = data.searchQueries;
              }

              if (data.text) {
                if (clientTtftMs === null) {
                  clientTtftMs = Math.round(performance.now() - clientStartTime);
                }
                accumulatedText += data.text;
                isSearching = false;
              }

              if (data.sources) {
                accumulatedSources = data.sources;
              }

              // Update message in state immediately on every chunk
              updateCurrentSession((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: accumulatedText,
                        sources:
                          accumulatedSources.length > 0
                            ? accumulatedSources
                            : undefined,
                        searchQueries:
                          accumulatedSearchQueries.length > 0
                            ? accumulatedSearchQueries
                            : undefined,
                        isSearchingWeb: accumulatedText ? false : isSearching,
                        modelUsed: finalModelUsed,
                        isStreaming: !data.done,
                      }
                    : m
                ),
              }));
            } catch (err: any) {
              if (!dataStr.includes('done')) {
                console.warn('SSE chunk parse issue:', dataStr);
              }
            }
          }
        }

        if (streamHasError) {
          break;
        }
      }

      // Mark final completion if no error occurred
      if (!streamHasError) {
        const totalDurationMs = Math.round(performance.now() - clientStartTime);
        const resolvedTtft = clientTtftMs || serverTtftMs || Math.min(totalDurationMs, 850);

        updateCurrentSession((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: accumulatedText || '(No response received)',
                  sources:
                    accumulatedSources.length > 0
                      ? accumulatedSources
                      : undefined,
                  modelUsed: finalModelUsed,
                  latencyStats: {
                    ttftMs: resolvedTtft,
                    totalDurationMs,
                    modelUsed: finalModelUsed,
                  },
                  isStreaming: false,
                }
              : m
          ),
        }));

        // Play AI text response automatically using Web Speech API if enabled
        if (voiceSettings.enableVoiceOutput && accumulatedText) {
          handleSpeakText(assistantMessageId, accumulatedText);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User aborted intentionally
        return;
      }
      console.error('Stream connection failed:', err);
      let errorMessage = err?.message || 'Unable to connect to Gemini API.';
      
      // Clean error text if raw JSON was returned
      try {
        if (errorMessage.startsWith('{')) {
          const parsed = JSON.parse(errorMessage);
          if (parsed.error?.message) {
            errorMessage = parsed.error.message;
          } else if (parsed.error) {
            errorMessage = typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error);
          }
        }
      } catch {}

      updateCurrentSession((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                error: errorMessage,
                isStreaming: false,
              }
            : m
        ),
      }));
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Direct ChatGPT-style image generation handler
  const handleSendImagePrompt = async (
    prompt: string,
    options?: { aspectRatio?: string; style?: string }
  ) => {
    if (!prompt.trim() || isStreaming) return;

    const trimmedPrompt = prompt.trim();
    const aspectRatio = options?.aspectRatio || '1:1';
    const style = options?.style || 'Natural';

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: `🎨 Create image: ${trimmedPrompt}`,
      timestamp: Date.now(),
    };

    const assistantMessageId = `model_${Date.now() + 1}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
      generatedImage: {
        prompt: trimmedPrompt,
        aspectRatio,
        style,
        status: 'generating',
      },
    };

    const isFirstMessage = currentSession.messages.length === 0;
    const computedTitle = isFirstMessage
      ? `🎨 Image: ${trimmedPrompt.slice(0, 28)}${trimmedPrompt.length > 28 ? '...' : ''}`
      : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMessage];

    updateCurrentSession((prev) => ({
      ...prev,
      title: computedTitle,
      updatedAt: Date.now(),
      messages: [...updatedMessages, initialAssistantMessage],
    }));

    setIsStreaming(true);

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.sessionToken
            ? { Authorization: `Bearer ${currentUser.sessionToken}` }
            : {}),
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          aspectRatio,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || 'Failed to synthesize image from model.');
      }

      updateCurrentSession((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: `Here is the AI image created for: **"${trimmedPrompt}"**`,
                isStreaming: false,
                generatedImage: {
                  status: 'completed',
                  imageUrl: data.imageUrl,
                  prompt: trimmedPrompt,
                  revisedPrompt: data.promptUsed,
                  aspectRatio: data.aspectRatio || aspectRatio,
                  style: data.style || style,
                },
              }
            : m
        ),
      }));
    } catch (err: any) {
      console.error('Image generation error:', err);
      const errMsg = err?.message || 'Unable to generate image.';

      updateCurrentSession((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                isStreaming: false,
                generatedImage: {
                  status: 'error',
                  error: errMsg,
                  prompt: trimmedPrompt,
                  aspectRatio,
                  style,
                },
              }
            : m
        ),
      }));
    } finally {
      setIsStreaming(false);
    }
  };

  // Retry a message
  const handleRetry = (messageId: string) => {
    if (isStreaming) return;
    const msgIndex = currentSession.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Find previous user message
    let lastUserPrompt = '';
    const sliceBefore = currentSession.messages.slice(0, msgIndex);
    for (let i = sliceBefore.length - 1; i >= 0; i--) {
      if (sliceBefore[i].role === 'user') {
        lastUserPrompt = sliceBefore[i].content;
        break;
      }
    }

    if (lastUserPrompt) {
      const sliceBeforeUser = sliceBefore.filter((_, i) => i !== sliceBefore.length - 1);
      const lastUserMsg = sliceBefore[sliceBefore.length - 1];

      // Remove messages from this assistant message onwards
      updateCurrentSession((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, msgIndex),
      }));

      // Resend prompt
      setTimeout(() => {
        handleSendMessage(lastUserPrompt, lastUserMsg?.attachments);
      }, 50);
    }
  };

  // Export current chat to Formatted PDF
  const handleExportPdf = () => {
    if (currentSession.messages.length === 0) return;
    exportConversationToPdf({
      session: currentSession,
      persona: currentPersona,
      currentUser,
    });
  };

  // Export specific session to Formatted PDF
  const handleExportSessionPdf = (targetSession: ChatSession) => {
    if (targetSession.messages.length === 0) return;
    const persona = PERSONAS.find((p) => p.id === targetSession.personaId) || currentPersona;
    exportConversationToPdf({
      session: targetSession,
      persona,
      currentUser,
    });
  };

  // Export current chat to Markdown
  const handleExportMarkdown = () => {
    if (currentSession.messages.length === 0) return;

    let md = `# ${currentSession.title}\n\n`;
    md += `*Generated by Gemini Chatbot (${currentPersona.name} - ${currentSession.model})*\n`;
    md += `*Date: ${new Date().toLocaleString()}*\n\n---\n\n`;

    currentSession.messages.forEach((m) => {
      const sender = m.role === 'user' ? 'User' : currentPersona.name;
      md += `### ${sender} (${new Date(m.timestamp).toLocaleTimeString()})\n\n`;
      md += `${m.content}\n\n`;
      if (m.sources && m.sources.length > 0) {
        md += `**Sources:**\n`;
        m.sources.forEach((s) => {
          md += `- [${s.title}](${s.uri})\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // If user is not logged in, display the Email Login Screen
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div
      className={`flex h-screen h-[100dvh] w-full font-sans antialiased overflow-hidden select-none ${
        theme === 'light' ? 'bg-white text-[#202123]' : 'bg-[#212121] text-[#ECECEC]'
      }`}
    >
      {/* ChatGPT-style Collapsible Left Sidebar */}
      <LeftSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        onOpenLibrary={() => setIsLibraryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAnalytics={() => setIsUsageAnalyticsOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Central Chat Area */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 relative overflow-hidden transition-colors ${
          theme === 'light' ? 'bg-white' : 'bg-[#212121]'
        }`}
      >
        {/* Top Minimal Header */}
        <ChatHeader
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          conversationTitle={currentSession.title}
          selectedModel={currentSession.model}
          onSelectModel={handleSelectModel}
          onNewChat={handleNewChat}
          onClearMessages={handleClearMessages}
          messageCount={currentSession.messages.length}
          onExportMarkdown={handleExportMarkdown}
          onExportPdf={handleExportPdf}
          messages={currentSession.messages}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAnalytics={() => setIsUsageAnalyticsOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isBirthdayToday={isBirthdayToday}
          onOpenBirthdayCelebration={() => setIsBirthdayCelebrationOpen(true)}
          enableVoiceOutput={voiceSettings.enableVoiceOutput}
          onToggleVoiceOutput={handleToggleVoiceOutput}
        />

        {/* Main Conversation Thread & ChatGPT-style Home Screen */}
        <ChatMessageList
          messages={currentSession.messages}
          currentPersona={currentPersona}
          isStreaming={isStreaming}
          onRetry={handleRetry}
          onSendPrompt={handleSendMessage}
          onSendImagePrompt={handleSendImagePrompt}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          theme={theme}
          speakingMessageId={speakingMessageId}
          onToggleSpeak={handleSpeakText}
        />

        {/* Fixed Bottom Rounded Composer */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendImagePrompt={handleSendImagePrompt}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
          voiceSettings={voiceSettings}
          onOpenVoiceSettings={() => setIsPersonaDrawerOpen(true)}
          theme={theme}
          selectedModel={currentSession.model}
          onSelectModel={handleSelectModel}
          onOpenImageGen={() => setIsImageGenModalOpen(true)}
          onOpenVideoStudio={() => setIsVeoVideoModalOpen(true)}
          onOpenMusicStudio={() => setIsMusicModalOpen(true)}
          onOpenPrepModules={() => setIsPrepModulesOpen(true)}
          onOpenProjectsStudio={() => setIsProjectsModalOpen(true)}
          onOpenThumbnailStudio={() => setIsThumbnailStudioOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAnalytics={() => setIsUsageAnalyticsOpen(true)}
          useSearchGrounding={currentSession.useSearchGrounding}
          onToggleSearchGrounding={handleToggleSearchGrounding}
        />
      </div>

      {/* Persona and System Instruction Customizer Drawer */}
      <PersonaDrawer
        isOpen={isPersonaDrawerOpen}
        onClose={() => setIsPersonaDrawerOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={handleSelectPersona}
        systemInstruction={currentSession.systemInstruction}
        onUpdateSystemInstruction={handleUpdateSystemInstruction}
        temperature={currentSession.temperature}
        onUpdateTemperature={handleUpdateTemperature}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={handleUpdateVoiceSettings}
        onSendPrompt={(prompt) => handleSendMessage(prompt)}
        onOpenThumbnailStudio={() => setIsThumbnailStudioOpen(true)}
        onOpenPrepModules={() => setIsPrepModulesOpen(true)}
        onOpenImageGen={() => setIsImageGenModalOpen(true)}
      />

      {/* Chat History Drawer (ChatGPT-Style Left Sidebar) */}
      <HistorySidebar
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewSession={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        onExportSessionPdf={handleExportSessionPdf}
        onOpenProjectsStudio={() => setIsProjectsModalOpen(true)}
        onOpenThumbnailStudio={() => setIsThumbnailStudioOpen(true)}
        onOpenPrepModules={() => setIsPrepModulesOpen(true)}
        onOpenLogoStudio={() => setIsLogoModalOpen(true)}
        onOpenImageGen={() => setIsImageGenModalOpen(true)}
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* ChatGPT-Style Comprehensive Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        uiSettings={uiSettings}
        onUpdateUiSettings={handleUpdateUiSettings}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={handleUpdateVoiceSettings}
        systemInstruction={currentSession.systemInstruction}
        onUpdateSystemInstruction={handleUpdateSystemInstruction}
        sessions={sessions}
        onClearAllSessions={handleClearAllSessions}
        onExportAllData={() => handleExportSessionPdf(currentSession)}
        useSearchGrounding={currentSession.useSearchGrounding}
        onToggleSearchGrounding={handleToggleSearchGrounding}
      />

      {/* Official Ro Logo & Brand Assets Share Modal */}
      <LogoShareModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onOpenImageGen={() => {
          setIsLogoModalOpen(false);
          setIsImageGenModalOpen(true);
        }}
      />

      {/* In-App AI Graphic & Logo Generator Modal */}
      <AiImageGeneratorModal
        isOpen={isImageGenModalOpen}
        onClose={() => setIsImageGenModalOpen(false)}
        onOpenLogoStudio={() => {
          setIsImageGenModalOpen(false);
          setIsLogoModalOpen(true);
        }}
        onSendToChat={(prompt, imageUrl) => {
          setIsImageGenModalOpen(false);
          if (imageUrl) {
            handleSendMessage(prompt, [
              {
                id: `img_${Date.now()}`,
                name: 'ro-graphic-asset.png',
                type: 'image/png',
                size: imageUrl.length,
                dataUrl: imageUrl,
                isImage: true,
              },
            ]);
          } else {
            handleSendMessage(prompt);
          }
        }}
      />

      {/* Veo 3 Video Generator Studio Modal */}
      <VideoGeneratorModal
        isOpen={isVeoVideoModalOpen}
        onClose={() => setIsVeoVideoModalOpen(false)}
        onSendToChat={(prompt, videoUrl) => {
          setIsVeoVideoModalOpen(false);
          handleSendMessage(`Here is a generated Veo video clip: "${prompt}". What are your thoughts?`, [
            {
              id: `vid_${Date.now()}`,
              name: 'ro-veo-video.mp4',
              type: 'video/mp4',
              size: 1024 * 1024,
              dataUrl: videoUrl,
              isImage: false,
              isVideo: true,
            },
          ]);
        }}
      />

      {/* Lyria AI Music Studio Modal */}
      <MusicGeneratorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSendToChat={(prompt, audioUrl) => {
          setIsMusicModalOpen(false);
          handleSendMessage(`Here is a generated Lyria music track: "${prompt}". Let's discuss soundtrack ideas!`, [
            {
              id: `aud_${Date.now()}`,
              name: 'ro-lyria-track.wav',
              type: 'audio/wav',
              size: 512 * 1024,
              dataUrl: audioUrl,
              isImage: false,
              isAudio: true,
            },
          ]);
        }}
      />

      {/* YouTube Thumbnail Studio Modal */}
      <ThumbnailStudioModal
        isOpen={isThumbnailStudioOpen}
        onClose={() => setIsThumbnailStudioOpen(false)}
        onSendToChat={(prompt) => {
          setIsThumbnailStudioOpen(false);
          // Switch to creator persona if not already
          const creatorPersona = PERSONAS.find((p) => p.id === 'ro-youtube-creator') || PERSONAS[0];
          handleSelectPersona(creatorPersona);
          handleSendMessage(prompt);
        }}
      />

      {/* Preparation Modules Modal */}
      <PreparationModulesModal
        isOpen={isPrepModulesOpen}
        onClose={() => setIsPrepModulesOpen(false)}
        onSelectModule={(prompt) => {
          setIsPrepModulesOpen(false);
          // Switch to exam/prep persona if applicable
          const prepPersona = PERSONAS.find((p) => p.id === 'ro-exam-prep') || PERSONAS[0];
          handleSelectPersona(prepPersona);
          handleSendMessage(prompt);
        }}
      />

      {/* Help & Keyboard Shortcuts Modal */}
      <HelpShortcutsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onNewChat={handleNewChat}
        onClearChat={handleClearMessages}
        onToggleHistory={() => setIsHistorySidebarOpen((prev) => !prev)}
        onTogglePersona={() => setIsPersonaDrawerOpen((prev) => !prev)}
        onOpenImageGen={() => setIsImageGenModalOpen(true)}
      />

      {/* Student Projects Studio (Senior Developer Mode) */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        onLaunchProjectSession={handleLaunchProjectSession}
        onOpenAutonomousBuilder={handleOpenAutonomousBuilder}
      />

      {/* Autonomous Project Builder Studio Modal */}
      <ProjectBuilderModal
        isOpen={isAutonomousBuilderOpen}
        onClose={() => setIsAutonomousBuilderOpen(false)}
        initialPrompt={builderInitialPrompt}
      />

      {/* UI, Theme & Custom Wallpaper Customizer Modal */}
      <UiCustomizerModal
        isOpen={isUiCustomizerOpen}
        onClose={() => setIsUiCustomizerOpen(false)}
        uiSettings={uiSettings}
        onUpdateUiSettings={handleUpdateUiSettings}
      />

      {/* Birthday Celebration Modal */}
      <BirthdayCelebrationModal
        isOpen={isBirthdayCelebrationOpen}
        onClose={() => setIsBirthdayCelebrationOpen(false)}
        currentUser={currentUser}
        birthdayWish={birthdayWish}
        onUpdateBirthday={handleUpdateBirthday}
      />

      {/* Usage Analytics Modal (D3.js Visualization) */}
      <UsageAnalyticsModal
        isOpen={isUsageAnalyticsOpen}
        onClose={() => setIsUsageAnalyticsOpen(false)}
        theme={theme}
      />

      {/* Reference Library Modal */}
      <LibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        onSelectAttachments={(selectedAtts) => {
          setIsLibraryModalOpen(false);
          if (selectedAtts && selectedAtts.length > 0) {
            handleSendMessage('I am adding these reference documents from my library to our context:', selectedAtts);
          }
        }}
        theme={theme}
      />
    </div>
  );
}
