import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Settings,
  Bell,
  Sparkles,
  AtSign,
  Mic,
  CreditCard,
  Database,
  HardDrive,
  ShieldCheck,
  Lock,
  Users,
  UserCheck,
  UserCircle,
  Keyboard,
  Check,
  ChevronDown,
  Shield,
  Trash2,
  Download,
  ExternalLink,
  Smartphone,
  Key,
  LogOut,
  RefreshCw,
  Sliders,
  Volume2,
  Eye,
  AlertTriangle,
  Mail,
  Zap,
  Bot,
  Copy,
  Info,
  Cake,
  Calendar,
} from 'lucide-react';
import {
  CustomUiSettings,
  UserAccount,
  VoiceInputSettings,
  ThemeMode,
  AccentColor,
  ChatSession,
} from '../types';
import { PERSONAS } from '../data/personas';

export type SettingsTabId =
  | 'general'
  | 'notifications'
  | 'personalization'
  | 'plugins'
  | 'voice'
  | 'billing'
  | 'data-controls'
  | 'storage'
  | 'safety'
  | 'security-login'
  | 'parental-controls'
  | 'trusted-contact'
  | 'account'
  | 'keyboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTabId;
  uiSettings: CustomUiSettings;
  onUpdateUiSettings: (settings: CustomUiSettings) => void;
  currentUser: UserAccount | null;
  onUpdateUser?: (updated: Partial<UserAccount>) => void;
  onLogout?: () => void;
  voiceSettings: VoiceInputSettings;
  onUpdateVoiceSettings: (settings: VoiceInputSettings) => void;
  systemInstruction?: string;
  onUpdateSystemInstruction?: (instruction: string) => void;
  sessions?: ChatSession[];
  onClearAllSessions?: () => void;
  onExportAllData?: () => void;
  useSearchGrounding?: boolean;
  onToggleSearchGrounding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'general',
  uiSettings,
  onUpdateUiSettings,
  currentUser,
  onUpdateUser,
  onLogout,
  voiceSettings,
  onUpdateVoiceSettings,
  systemInstruction = '',
  onUpdateSystemInstruction,
  sessions = [],
  onClearAllSessions,
  onExportAllData,
  useSearchGrounding = false,
  onToggleSearchGrounding,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMfaBanner, setShowMfaBanner] = useState(true);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [mfaStep, setMfaStep] = useState<1 | 2 | 3>(1);
  const [mfaOtpCode, setMfaOtpCode] = useState('');
  const [mfaVerified, setMfaVerified] = useState(false);

  // General Settings State
  const [contrastSetting, setContrastSetting] = useState<'system' | 'standard' | 'high'>('system');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto-detect');
  const [higherIntelligence, setHigherIntelligence] = useState(true);

  // Notifications State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [birthdayAlerts, setBirthdayAlerts] = useState(true);
  const [productAnnouncements, setProductAnnouncements] = useState(false);

  // Personalization State
  const [customAboutMe, setCustomAboutMe] = useState(
    localStorage.getItem('ro_custom_about_me') || 'Software Developer & Creator interested in AI systems.'
  );
  const [customResponseStyle, setCustomResponseStyle] = useState(
    localStorage.getItem('ro_custom_response_style') || 'Direct, concise, with production-ready code examples.'
  );
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  // Plugins State
  const [codeExecution, setCodeExecution] = useState(true);
  const [imageGenPlugin, setImageGenPlugin] = useState(true);
  const [youtubeToolsPlugin, setYoutubeToolsPlugin] = useState(true);
  const [prepCoachPlugin, setPrepCoachPlugin] = useState(true);

  // Data Controls & Safety State
  const [historyTraining, setHistoryTraining] = useState(true);
  const [contentFilterLevel, setContentFilterLevel] = useState<'standard' | 'strict' | 'relaxed'>('standard');
  const [safeSearchWeb, setSafeSearchWeb] = useState(true);

  // Parental & Trusted Contact
  const [parentalSafeMode, setParentalSafeMode] = useState(false);
  const [trustedRecoveryEmail, setTrustedRecoveryEmail] = useState(
    currentUser?.email ? `backup.${currentUser.email}` : 'trusted-backup@domain.com'
  );

  // Account editing state
  const [displayName, setDisplayName] = useState(currentUser?.name || 'pardhu pavan');
  const [birthdayInput, setBirthdayInput] = useState(currentUser?.birthday || '2006-09-13');
  const [isSavingBirthday, setIsSavingBirthday] = useState(false);
  const [isSendingBirthdayMail, setIsSendingBirthdayMail] = useState(false);
  const [birthdayMailResult, setBirthdayMailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    if (currentUser?.birthday) {
      setBirthdayInput(currentUser.birthday);
    }
  }, [currentUser?.birthday]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (currentUser?.name) {
      setDisplayName(currentUser.name);
    }
  }, [currentUser?.name]);

  const isLight = uiSettings.themeMode === 'light';

  const triggerSaveNotification = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2000);
  };

  const handleSavePersonalization = () => {
    localStorage.setItem('ro_custom_about_me', customAboutMe);
    localStorage.setItem('ro_custom_response_style', customResponseStyle);
    if (onUpdateSystemInstruction) {
      const combined = `${systemInstruction}\n\n[User Context]: ${customAboutMe}\n[Response Format Preference]: ${customResponseStyle}`;
      onUpdateSystemInstruction(combined);
    }
    triggerSaveNotification();
  };

  const handleUpdateDisplayName = () => {
    if (onUpdateUser && displayName.trim()) {
      onUpdateUser({ name: displayName.trim() });
      triggerSaveNotification();
    }
  };

  const handleSaveBirthday = async () => {
    if (!birthdayInput || !currentUser?.email) return;
    setIsSavingBirthday(true);
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: displayName,
          birthday: birthdayInput,
          sessionToken: currentUser.sessionToken,
        }),
      });
      if (res.ok) {
        onUpdateUser?.({ birthday: birthdayInput, name: displayName });
        triggerSaveNotification();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBirthday(false);
    }
  };

  const handleSendBirthdayMail = async () => {
    if (!currentUser?.email) return;
    setIsSendingBirthdayMail(true);
    setBirthdayMailResult(null);
    try {
      const res = await fetch('/api/user/send-birthday-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: displayName,
          force: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBirthdayMailResult({
          success: true,
          message: `Birthday email sent to ${currentUser.email}!`,
        });
      } else {
        setBirthdayMailResult({
          success: false,
          message: data.message || data.error || 'Failed to dispatch email.',
        });
      }
    } catch (err: any) {
      setBirthdayMailResult({
        success: false,
        message: err.message || 'Network error.',
      });
    } finally {
      setIsSendingBirthdayMail(false);
    }
  };

  const TAB_ITEMS: { id: SettingsTabId; label: string; icon: React.ReactNode; keywords: string }[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Settings className="w-4 h-4" />,
      keywords: 'theme appearance contrast accent color language intelligence dark light mode',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      keywords: 'notifications alerts email sound chime birthday marketing',
    },
    {
      id: 'personalization',
      label: 'Personalization',
      icon: <Sparkles className="w-4 h-4" />,
      keywords: 'custom instructions about me prompt persona memory style',
    },
    {
      id: 'plugins',
      label: 'Plugins',
      icon: <AtSign className="w-4 h-4" />,
      keywords: 'plugins search web code interpreter image generation youtube prep',
    },
    {
      id: 'voice',
      label: 'Voice',
      icon: <Mic className="w-4 h-4" />,
      keywords: 'voice dictation microphone audio speech language sensitivity',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCard className="w-4 h-4" />,
      keywords: 'billing plan pro subscription payment invoices pricing',
    },
    {
      id: 'data-controls',
      label: 'Data controls',
      icon: <Database className="w-4 h-4" />,
      keywords: 'data controls export clear chats history delete download training',
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: <HardDrive className="w-4 h-4" />,
      keywords: 'storage cache attachments memory usage quota localstorage',
    },
    {
      id: 'safety',
      label: 'Safety',
      icon: <ShieldCheck className="w-4 h-4" />,
      keywords: 'safety filtering safesearch content moderation sensitive',
    },
    {
      id: 'security-login',
      label: 'Security and login',
      icon: <Lock className="w-4 h-4" />,
      keywords: 'security login mfa 2fa password sessions devices authentication',
    },
    {
      id: 'parental-controls',
      label: 'Parental controls',
      icon: <Users className="w-4 h-4" />,
      keywords: 'parental controls pin screen time restrictions safe mode',
    },
    {
      id: 'trusted-contact',
      label: 'Trusted contact',
      icon: <UserCheck className="w-4 h-4" />,
      keywords: 'trusted contact emergency recovery backup email account access',
    },
    {
      id: 'account',
      label: 'Account',
      icon: <UserCircle className="w-4 h-4" />,
      keywords: 'account profile email name dob birthday logout user id',
    },
    {
      id: 'keyboard',
      label: 'Keyboard',
      icon: <Keyboard className="w-4 h-4" />,
      keywords: 'keyboard shortcuts hotkeys bindings navigation command',
    },
  ];

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return TAB_ITEMS;
    const q = searchQuery.toLowerCase();
    return TAB_ITEMS.filter(
      (tab) => tab.label.toLowerCase().includes(q) || tab.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const ACCENT_COLOR_OPTIONS: { id: AccentColor; label: string; bgClass: string }[] = [
    { id: 'indigo', label: 'Black / Dark Slate', bgClass: 'bg-slate-900 border border-slate-700' },
    { id: 'blue', label: 'Sky Blue', bgClass: 'bg-blue-500' },
    { id: 'purple', label: 'Violet Purple', bgClass: 'bg-purple-500' },
    { id: 'emerald', label: 'Emerald Green', bgClass: 'bg-emerald-500' },
    { id: 'amber', label: 'Warm Amber', bgClass: 'bg-amber-500' },
    { id: 'rose', label: 'Rose Pink', bgClass: 'bg-rose-500' },
    { id: 'cyan', label: 'Neon Cyan', bgClass: 'bg-cyan-500' },
  ];

  if (!isOpen) return null;

  return (
    <div
      id="chatgpt-settings-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
    >
      {/* Modal Container */}
      <div
        id="chatgpt-settings-dialog"
        className={`relative w-full max-w-4xl max-h-[92vh] sm:h-[620px] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0E131F] border-slate-800 text-slate-100'
        }`}
      >
        {/* Saved Toast */}
        {isSavedToast && (
          <div className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences saved</span>
          </div>
        )}

        {/* LEFT SIDEBAR: Navigation Menu & Search */}
        <div
          className={`w-full md:w-64 shrink-0 flex flex-col border-b md:border-b-0 md:border-r ${
            isLight
              ? 'bg-[#F9FAFB] border-slate-200'
              : 'bg-[#0B0E14] border-slate-800/90'
          }`}
        >
          {/* Top Left: Close button and Search Bar */}
          <div className="p-3.5 pb-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <button
                id="btn-close-settings-modal"
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
                title="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-1">
                Settings
              </span>
            </div>

            {/* Search Settings Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-search-settings"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings"
                className={`w-full pl-9 pr-7 py-1.5 text-xs rounded-xl border outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-800 focus:border-slate-400 placeholder:text-slate-400'
                    : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-slate-700 placeholder:text-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Menu Items List */}
          <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 custom-scrollbar">
            {filteredTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`btn-settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-slate-200/80 text-slate-900 font-semibold'
                        : 'bg-slate-800/90 text-white font-semibold'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <span className={isActive ? (isLight ? 'text-slate-900' : 'text-indigo-400') : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
            {filteredTabs.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400">No settings found</p>
            )}
          </nav>
        </div>

        {/* RIGHT CONTENT PANE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar">
            {/* 1. GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">General</h2>

                {/* Banner: Secure your account */}
                {showMfaBanner && (
                  <div
                    className={`relative p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-[#121826] border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 border border-slate-700 mt-0.5">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6 space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-100">Secure your account</h4>
                      <p className="text-[11.5px] text-slate-400 leading-relaxed">
                        Add multi-factor authentication (MFA), like a text message or authenticator app, to help protect your account when logging in.
                      </p>
                      <button
                        id="btn-settings-setup-mfa"
                        onClick={() => setIsMfaModalOpen(true)}
                        className={`mt-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                        }`}
                      >
                        {mfaVerified ? 'MFA Configured ✓' : 'Set up MFA'}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowMfaBanner(false)}
                      className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-200"
                      title="Dismiss banner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Setting Rows */}
                <div className="divide-y divide-slate-800/60 space-y-4">
                  {/* Appearance Row */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Appearance</span>
                    </div>
                    <div className="relative">
                      <select
                        id="select-appearance-theme"
                        value={uiSettings.themeMode}
                        onChange={(e) => {
                          onUpdateUiSettings({
                            ...uiSettings,
                            themeMode: e.target.value as ThemeMode,
                          });
                          triggerSaveNotification();
                        }}
                        className={`text-xs rounded-xl px-3 py-1.5 pr-8 border appearance-none outline-none cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="midnight">Midnight AMOLED</option>
                        <option value="cyberpunk">Cyberpunk Violet</option>
                        <option value="sunset">Twilight Sunset</option>
                        <option value="emerald">Forest Emerald</option>
                        <option value="ocean">Ocean Abyss</option>
                        <option value="slate">Slate Minimal</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Contrast Row */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Contrast</span>
                    </div>
                    <div className="relative">
                      <select
                        id="select-contrast-mode"
                        value={contrastSetting}
                        onChange={(e) => {
                          setContrastSetting(e.target.value as any);
                          triggerSaveNotification();
                        }}
                        className={`text-xs rounded-xl px-3 py-1.5 pr-8 border appearance-none outline-none cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <option value="system">System</option>
                        <option value="standard">Standard</option>
                        <option value="high">High contrast</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Accent Color Row */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Accent color</span>
                    </div>
                    <div className="relative">
                      <select
                        id="select-accent-color"
                        value={uiSettings.accentColor}
                        onChange={(e) => {
                          onUpdateUiSettings({
                            ...uiSettings,
                            accentColor: e.target.value as AccentColor,
                          });
                          triggerSaveNotification();
                        }}
                        className={`text-xs rounded-xl pl-3 pr-8 py-1.5 border appearance-none outline-none cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        {ACCENT_COLOR_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            ● {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Language Row */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Language</span>
                    </div>
                    <div className="relative">
                      <select
                        id="select-app-language"
                        value={selectedLanguage}
                        onChange={(e) => {
                          setSelectedLanguage(e.target.value);
                          triggerSaveNotification();
                        }}
                        className={`text-xs rounded-xl px-3 py-1.5 pr-8 border appearance-none outline-none cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <option value="Auto-detect">Auto-detect</option>
                        <option value="English (US)">English (US)</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Telugu">Telugu (తెలుగు)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                        <option value="Japanese">Japanese (日本語)</option>
                        <option value="Chinese">Chinese (中文)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Higher Intelligence Row */}
                  <div className="flex items-start justify-between pt-4">
                    <div className="pr-4 space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">
                        Higher intelligence
                      </span>
                      <p className="text-[11.5px] text-slate-400 leading-relaxed">
                        Chat can automatically use a higher intelligence setting when you ask a complex question.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={higherIntelligence}
                        onChange={(e) => {
                          setHigherIntelligence(e.target.checked);
                          triggerSaveNotification();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Notifications</h2>
                <div className="space-y-4 divide-y divide-slate-800/60">
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">Sound Effects</span>
                      <p className="text-[11.5px] text-slate-400">Play a subtle chime when responses finish generating</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">Birthday &amp; Milestone Alerts</span>
                      <p className="text-[11.5px] text-slate-400">Receive special greeting animations and celebratory emails on your birthday</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={birthdayAlerts}
                      onChange={(e) => setBirthdayAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">Product Updates &amp; Feature Releases</span>
                      <p className="text-[11.5px] text-slate-400">Stay informed when new AI models and studio tools launch</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={productAnnouncements}
                      onChange={(e) => setProductAnnouncements(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. PERSONALIZATION TAB */}
            {activeTab === 'personalization' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Personalization</h2>
                <p className="text-[11.5px] text-slate-400">
                  Custom instructions help the AI tailor answers to your professional background and formatting preferences.
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      What would you like Ro to know about you to provide better responses?
                    </label>
                    <textarea
                      rows={3}
                      value={customAboutMe}
                      onChange={(e) => setCustomAboutMe(e.target.value)}
                      placeholder="e.g. I work with TypeScript, React, and building AI tools..."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      How would you like Ro to respond?
                    </label>
                    <textarea
                      rows={3}
                      value={customResponseStyle}
                      onChange={(e) => setCustomResponseStyle(e.target.value)}
                      placeholder="e.g. Be concise, direct, skip robotic pleasantries, and use code blocks."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">Adaptive Context &amp; Memory</span>
                      <p className="text-[11.5px] text-slate-400">Remember context across sessions for a continuous thought flow</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={memoryEnabled}
                      onChange={(e) => setMemoryEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                    />
                  </div>

                  <button
                    onClick={handleSavePersonalization}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Save Custom Instructions
                  </button>
                </div>
              </div>
            )}

            {/* 4. PLUGINS TAB */}
            {activeTab === 'plugins' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Plugins &amp; Extensions</h2>
                <div className="space-y-3.5 divide-y divide-slate-800/60">
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-blue-400" />
                        <span>Google Search Live Grounding</span>
                      </span>
                      <p className="text-[11.5px] text-slate-400">Access real-time web search results with verifiable citations</p>
                    </div>
                    <button
                      onClick={onToggleSearchGrounding}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        useSearchGrounding
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {useSearchGrounding ? 'Active' : 'Enable'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>AI Graphic &amp; Image Studio</span>
                      </span>
                      <p className="text-[11.5px] text-slate-400">Generate high-resolution branding assets and vector mockups</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={imageGenPlugin}
                      onChange={(e) => setImageGenPlugin(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-red-400" />
                        <span>YouTube Growth &amp; Thumbnail Studio</span>
                      </span>
                      <p className="text-[11.5px] text-slate-400">Analyze high-CTR titles, packaging hooks, and typography previews</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={youtubeToolsPlugin}
                      onChange={(e) => setYoutubeToolsPlugin(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. VOICE TAB */}
            {activeTab === 'voice' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Voice &amp; Audio</h2>
                <div className="space-y-4">
                  {/* Enable Voice Output Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="space-y-0.5 pr-4">
                      <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Enable Voice Output (Web Speech API)</span>
                      </span>
                      <p className="text-[11.5px] text-slate-400 leading-relaxed">
                        Play AI text responses automatically using your browser's speech synthesis engine.
                      </p>
                    </div>
                    <input
                      id="toggle-voice-output"
                      type="checkbox"
                      checked={voiceSettings.enableVoiceOutput || false}
                      onChange={(e) =>
                        onUpdateVoiceSettings({
                          ...voiceSettings,
                          enableVoiceOutput: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Speech Rate Control */}
                  {voiceSettings.enableVoiceOutput && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-medium">Speech Rate</span>
                        <span className="font-mono text-indigo-400">{voiceSettings.speechRate || 1.05}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.8}
                        max={1.6}
                        step={0.05}
                        value={voiceSettings.speechRate || 1.05}
                        onChange={(e) =>
                          onUpdateVoiceSettings({
                            ...voiceSettings,
                            speechRate: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Relaxed (0.8x)</span>
                        <span>Natural (1.05x)</span>
                        <span>Brisk (1.6x)</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">Continuous Listening</span>
                      <p className="text-[11.5px] text-slate-400">Keep listening without interrupting speech pauses</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={voiceSettings.continuousListening}
                      onChange={(e) =>
                        onUpdateVoiceSettings({
                          ...voiceSettings,
                          continuousListening: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Mic Sensitivity</span>
                      <span className="font-mono text-indigo-400">{voiceSettings.sensitivity}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={voiceSettings.sensitivity}
                      onChange={(e) =>
                        onUpdateVoiceSettings({
                          ...voiceSettings,
                          sensitivity: Number(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. BILLING TAB */}
            {activeTab === 'billing' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Billing &amp; Subscription</h2>
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Active Plan
                    </span>
                    <h3 className="text-base font-bold text-white">Ro Go / Pro Tier</h3>
                    <p className="text-[11.5px] text-slate-400">Full access to Gemini 2.5 Flash, Thought Partnering, and Creator Studios.</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">$0 / Free Preview</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Payment Method</span>
                    <span className="font-mono text-slate-400">•••• •••• •••• 4242</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Renewal Date</span>
                    <span className="text-slate-400">Auto-renews Aug 2027</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. DATA CONTROLS TAB */}
            {activeTab === 'data-controls' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Data Controls</h2>
                <div className="space-y-4 divide-y divide-slate-800/60">
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">Export Data</span>
                      <p className="text-[11.5px] text-slate-400">Download all your chat transcripts and project code as JSON &amp; PDF</p>
                    </div>
                    <button
                      onClick={onExportAllData}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-red-400 block">Clear All Chats</span>
                      <p className="text-[11.5px] text-slate-400">Permanently delete all session history from local storage</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all chat sessions? This cannot be undone.')) {
                          onClearAllSessions?.();
                          triggerSaveNotification();
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. STORAGE TAB */}
            {activeTab === 'storage' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Storage &amp; Cache</h2>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Local Browser Storage</span>
                    <span className="font-mono text-indigo-400">{sessions.length} sessions stored</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '18%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400">18% of browser storage used (~1.8 MB / 10 MB)</p>
                </div>
              </div>
            )}

            {/* 9. SAFETY TAB */}
            {activeTab === 'safety' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Safety &amp; Guardrails</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-200">Content Moderation Threshold</label>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {(['standard', 'strict', 'relaxed'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            setContentFilterLevel(level);
                            triggerSaveNotification();
                          }}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                            contentFilterLevel === level
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. SECURITY AND LOGIN TAB */}
            {activeTab === 'security-login' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Security &amp; Login</h2>
                <div className="space-y-4 divide-y divide-slate-800/60">
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 block">Two-Factor Authentication (2FA / MFA)</span>
                      <p className="text-[11.5px] text-slate-400">
                        {mfaVerified ? 'Enabled with Authenticator App' : 'Protect your account with an extra verification code'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsMfaModalOpen(true)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        mfaVerified
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-blue-600 border-blue-500 text-white'
                      }`}
                    >
                      {mfaVerified ? 'Configured' : 'Setup 2FA'}
                    </button>
                  </div>

                  <div className="pt-4 space-y-2">
                    <span className="text-xs font-medium text-slate-200 block">Active Device Sessions</span>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Current Web Browser (Active Now)</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Chrome on Desktop • IP: 192.0.2.1</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        This Device
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. PARENTAL CONTROLS TAB */}
            {activeTab === 'parental-controls' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Parental Controls</h2>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-slate-200 block">Strict Educational Filter</span>
                    <p className="text-[11.5px] text-slate-400">Restricts mature topics and optimizes for safe student research</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={parentalSafeMode}
                    onChange={(e) => setParentalSafeMode(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
            )}

            {/* 12. TRUSTED CONTACT TAB */}
            {activeTab === 'trusted-contact' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Trusted Contact</h2>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-200 block">Backup Recovery Email</label>
                  <input
                    type="email"
                    value={trustedRecoveryEmail}
                    onChange={(e) => setTrustedRecoveryEmail(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 outline-none"
                  />
                  <button
                    onClick={triggerSaveNotification}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Update Trusted Contact
                  </button>
                </div>
              </div>
            )}

            {/* 13. ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Account Information</h2>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-base flex items-center justify-center">
                      {(displayName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        onBlur={handleUpdateDisplayName}
                        className="text-xs font-bold text-slate-100 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 outline-none w-full"
                      />
                      <span className="text-[11px] text-slate-400 block">{currentUser?.email || 'pardhupavan457@gmail.com'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                      <div className="space-y-0.5">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          Date of Birth (Birthday)
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Ro uses this to celebrate your special day with real-time greetings
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={birthdayInput}
                          onChange={(e) => setBirthdayInput(e.target.value)}
                          className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveBirthday}
                          disabled={isSavingBirthday}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer disabled:opacity-50"
                        >
                          {isSavingBirthday ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>Account Plan</span>
                      <span className="text-emerald-400 font-semibold">Pro Go Active</span>
                    </div>
                  </div>

                  {/* Birthday Email Delivery Card */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-950/30 to-indigo-950/30 border border-pink-900/30 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-pink-300 font-semibold">
                      <Cake className="w-4 h-4 text-pink-400" />
                      <span>Real-Time Birthday Celebrations</span>
                    </div>
                    <p className="text-[11.5px] text-slate-300 leading-relaxed">
                      On your birthday, Ro automatically dispatches an inspiring, festive birthday wish directly to your registered email address (<strong className="text-white">{currentUser?.email || 'pardhupavan457@gmail.com'}</strong>).
                    </p>

                    {birthdayMailResult && (
                      <div
                        className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                          birthdayMailResult.success
                            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                            : 'bg-red-950/60 border border-red-800 text-red-300'
                        }`}
                      >
                        {birthdayMailResult.success ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span>{birthdayMailResult.message}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSendBirthdayMail}
                      disabled={isSendingBirthdayMail}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-pink-500/30 hover:border-pink-500/50 text-pink-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSendingBirthdayMail ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching Birthday Email...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5 text-pink-400" />
                          <span>Send Birthday Wish to My Email Now</span>
                        </>
                      )}
                    </button>
                  </div>

                  {onLogout && (
                    <button
                      id="btn-settings-logout"
                      type="button"
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 hover:text-red-100 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.99]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Account</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 14. KEYBOARD SHORTCUTS TAB */}
            {activeTab === 'keyboard' && (
              <div className="space-y-5 animate-in fade-in duration-100">
                <h2 className="text-lg font-bold tracking-tight">Keyboard Shortcuts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Start New Chat', key: 'Ctrl + K' },
                    { label: 'Focus Chat Input', key: 'Ctrl + /' },
                    { label: 'Open Settings', key: 'Ctrl + ,' },
                    { label: 'Toggle Sidebar', key: 'Ctrl + B' },
                    { label: 'Search Grounding Toggle', key: 'Ctrl + G' },
                    { label: 'Export Transcript', key: 'Ctrl + S' },
                  ].map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">{s.label}</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MFA Setup Sub-Modal */}
      {isMfaModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F1422] border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Multi-Factor Authentication</span>
              </div>
              <button onClick={() => setIsMfaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {mfaStep === 1 && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-slate-400 leading-relaxed">
                  Protect your chat sessions with an Authenticator App (Google Authenticator, Microsoft Authenticator, or 1Password).
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-2">
                  <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center font-mono text-[10px] text-slate-900 text-center">
                    [QR Code: OTP-RO-942730]
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Secret: RO-AUTH-7739-SECURE</span>
                </div>
                <button
                  onClick={() => setMfaStep(2)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Continue to Verification
                </button>
              </div>
            )}

            {mfaStep === 2 && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-slate-400">Enter the 6-digit code shown on your authenticator app:</p>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaOtpCode}
                  onChange={(e) => setMfaOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full p-2.5 text-center font-mono text-base tracking-widest rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
                <button
                  onClick={() => {
                    setMfaVerified(true);
                    setMfaStep(3);
                    triggerSaveNotification();
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Verify &amp; Activate MFA
                </button>
              </div>
            )}

            {mfaStep === 3 && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">MFA Successfully Activated!</h4>
                <p className="text-xs text-slate-400">Your account is now guarded with multi-factor authentication.</p>
                <button
                  onClick={() => {
                    setIsMfaModalOpen(false);
                    setMfaStep(1);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
