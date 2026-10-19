export type MessageRole = 'user' | 'model' | 'system';

export interface UserAccount {
  email: string;
  name: string;
  avatar?: string;
  birthday?: string; // Format: 'YYYY-MM-DD' or 'MM-DD'
  lastBirthdayMailSentYear?: number;
  loggedInAt: number;
  sessionToken?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string; // e.g. 'image/png', 'application/pdf', 'text/plain'
  size: number;
  dataUrl: string; // base64 data url
  isImage: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  textContent?: string;
}

export interface GeneratedImageData {
  imageUrl?: string;
  prompt: string;
  revisedPrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | string;
  style?: string;
  status: 'generating' | 'completed' | 'error';
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
  sources?: GroundingSource[];
  attachments?: MessageAttachment[];
  generatedImage?: GeneratedImageData;
  modelUsed?: string;
  isSearchingWeb?: boolean;
  searchQueries?: string[];
  latencyStats?: {
    ttftMs: number;
    totalDurationMs: number;
    modelUsed: string;
  };
  pdfDocument?: {
    title: string;
    filename?: string;
    subtitle?: string;
    duration?: string;
    category?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  systemInstruction: string;
  model: string;
  personaId: string;
  useSearchGrounding: boolean;
  temperature: number;
}

export interface BotPersona {
  id: string;
  name: string;
  roleTitle: string;
  description: string;
  iconName: string;
  badge: string;
  defaultModel: string;
  systemInstruction: string;
  suggestedPrompts: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  tag: string;
  speed: string;
  intelligence: string;
}

export interface YouTubeThumbnailConcept {
  id: string;
  titleOption: string;
  overlayText: string;
  visualComposition: string;
  facialExpression: string;
  colorPalette: string[];
  contrastTip: string;
  estimatedCTRScore: number;
  hookExplanation: string;
}

export interface PrepModuleOption {
  id: string;
  category: 'youtube' | 'exam' | 'interview' | 'coding';
  title: string;
  badge: string;
  iconName: string;
  description: string;
  samplePrompt: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'textarea' | 'select';
    options?: string[];
  }[];
}

export interface VoiceInputSettings {
  continuousListening: boolean;
  sensitivity: number; // 1 to 100 (default 80)
  language: string; // 'auto' | 'en-US' | 'en-GB' | 'en-IN' | 'es-ES' | 'fr-FR' | 'de-DE' | 'hi-IN' | 'zh-CN' | 'ja-JP'
  useAiFallback: boolean;
  autoSendOnStop: boolean;
  enableVoiceOutput: boolean; // Auto-play AI text responses using Web Speech API
  speechRate?: number; // 0.8 to 1.8 (default 1.05 for natural crisp cadence)
}

export const DEFAULT_VOICE_SETTINGS: VoiceInputSettings = {
  continuousListening: true,
  sensitivity: 80,
  language: 'auto',
  useAiFallback: true,
  autoSendOnStop: false,
  enableVoiceOutput: false,
  speechRate: 1.05,
};

export type ThemeMode =
  | 'dark'
  | 'light'
  | 'midnight'
  | 'cyberpunk'
  | 'sunset'
  | 'emerald'
  | 'ocean'
  | 'slate';

export type BubbleStyle = 'solid' | 'glass' | 'minimal' | 'bordered';
export type AccentColor = 'indigo' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan';

export interface WallpaperPreset {
  id: string;
  name: string;
  category: string;
  previewGradient: string;
  imageUrl?: string;
  cssBackground?: string;
}

export type BackgroundFit = 'cover' | 'contain' | 'fill' | 'tile' | 'center';
export type BackgroundPosition = 'center' | 'top' | 'bottom';
export type BackgroundScope = 'app' | 'chat';

export interface CustomUiSettings {
  themeMode: ThemeMode;
  customBackgroundUrl: string; // user uploaded image base64 or external url
  presetBackgroundId: string; // 'none' | preset id
  backgroundBlur: number; // 0 to 24 px
  backgroundDim: number; // 0 to 90%
  backgroundFit?: BackgroundFit; // 'cover' | 'contain' | 'fill' | 'tile' | 'center'
  backgroundPosition?: BackgroundPosition; // 'center' | 'top' | 'bottom'
  backgroundScope?: BackgroundScope; // 'app' | 'chat'
  bubbleStyle: BubbleStyle;
  accentColor: AccentColor;
  fontSize: 'sm' | 'md' | 'lg';
  compactHeader: boolean;
  showModifiers: boolean;
}

export const DEFAULT_UI_SETTINGS: CustomUiSettings = {
  themeMode: 'dark',
  customBackgroundUrl: '',
  presetBackgroundId: 'none',
  backgroundBlur: 0,
  backgroundDim: 40,
  backgroundFit: 'cover',
  backgroundPosition: 'center',
  backgroundScope: 'app',
  bubbleStyle: 'solid',
  accentColor: 'indigo',
  fontSize: 'md',
  compactHeader: false,
  showModifiers: true,
};

// ==========================================
// AUTONOMOUS PROJECT BUILDER TYPES
// ==========================================

export type ProjectStage =
  | 'idle'
  | 'analyzing'
  | 'planning'
  | 'generating'
  | 'installing'
  | 'building'
  | 'testing'
  | 'debugging'
  | 'fixing'
  | 'previewing'
  | 'completed'
  | 'failed';

export interface ProjectRequirementSpec {
  projectName: string;
  type: string;
  summary: string;
  features: string[];
  userRoles: string[];
  database: boolean;
  databaseType: 'PostgreSQL' | 'MongoDB' | 'SQLite' | 'LocalStorage';
  authentication: boolean;
  deployment: boolean;
  clarifications?: string[];
}

export interface ProjectArchitecturePlan {
  architecturePattern: 'simple' | 'modular' | 'scalable';
  frontend: {
    framework: string;
    styling: string;
    stateManagement: string;
  };
  backend: {
    runtime: string;
    framework: string;
    apiType: 'REST' | 'GraphQL' | 'WebSocket';
  };
  database: {
    engine: string;
    ormOrDriver: string;
    schemaSummary: string;
  };
  entities: {
    name: string;
    fields: string[];
    relations?: string[];
  }[];
  apiEndpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    authRequired: boolean;
  }[];
  fileManifest: {
    path: string;
    description: string;
    layer: 'config' | 'database' | 'backend' | 'frontend' | 'tests' | 'docs';
  }[];
}

export interface ProjectWorkspaceFile {
  path: string;
  content: string;
  layer: 'config' | 'database' | 'backend' | 'frontend' | 'tests' | 'docs';
  size: number;
  updatedAt: number;
}

export interface ProjectExecutionLog {
  id: string;
  timestamp: number;
  stage: ProjectStage;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  status: 'running' | 'success' | 'failed';
}

export interface ProjectRepairAttempt {
  id: string;
  timestamp: number;
  attemptNumber: number;
  errorSnippet: string;
  affectedFile: string;
  diagnosis: string;
  patchSummary: string;
  diff: string;
  resolved: boolean;
}

export interface AutonomousProject {
  id: string;
  name: string;
  prompt: string;
  status: ProjectStage;
  progressPercent: number;
  statusMessage: string;
  spec?: ProjectRequirementSpec;
  plan?: ProjectArchitecturePlan;
  files: ProjectWorkspaceFile[];
  logs: ProjectExecutionLog[];
  repairHistory: ProjectRepairAttempt[];
  previewHtml?: string;
  previewReady: boolean;
  testSummary?: {
    total: number;
    passed: number;
    failed: number;
    details: string[];
  };
  createdAt: number;
  updatedAt: number;
}


