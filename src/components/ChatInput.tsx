import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Sparkles,
  Mic,
  MicOff,
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Loader2,
  Globe,
  Plus,
  PlaySquare,
  Music,
  FolderGit2,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { MessageAttachment, VoiceInputSettings, DEFAULT_VOICE_SETTINGS } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: MessageAttachment[]) => void;
  onSendImagePrompt?: (prompt: string, options?: { aspectRatio?: string; style?: string }) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  voiceSettings?: VoiceInputSettings;
  onOpenVoiceSettings?: () => void;
  theme?: 'light' | 'dark' | string;
  isHeroPill?: boolean;
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;
  onOpenPersonaDrawer?: () => void;
  onOpenImageGen?: () => void;
  onOpenVideoStudio?: () => void;
  onOpenMusicStudio?: () => void;
  onOpenPrepModules?: () => void;
  onOpenProjectsStudio?: () => void;
  onOpenThumbnailStudio?: () => void;
  onOpenSettings?: () => void;
  onOpenAnalytics?: () => void;
  useSearchGrounding?: boolean;
  onToggleSearchGrounding?: (enable: boolean) => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  disabled = false,
  voiceSettings = DEFAULT_VOICE_SETTINGS,
  theme = 'dark',
  onOpenImageGen,
  onOpenVideoStudio,
  onOpenMusicStudio,
  onOpenProjectsStudio,
  onOpenAnalytics,
  useSearchGrounding = false,
  onToggleSearchGrounding,
  placeholder = 'Message RO…',
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const isLight = theme === 'light';

  // Close tools menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle Send
  const handleSend = () => {
    if (isStreaming) {
      onStopGeneration();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage(trimmed, attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File Upload Handler (Images, Text docs, Code, PDFs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileList = Array.from(files);

    Promise.all(
      fileList.map((file) => {
        return new Promise<MessageAttachment | null>((resolve) => {
          const isImage = file.type.startsWith('image/');
          const isText =
            file.type.startsWith('text/') ||
            /\.(md|ts|tsx|js|jsx|json|py|html|css|txt|csv|sql)$/i.test(file.name);

          const reader = new FileReader();

          if (isImage) {
            reader.onload = () => {
              resolve({
                id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                name: file.name,
                type: file.type || 'image/jpeg',
                size: file.size,
                isImage: true,
                dataUrl: reader.result as string,
              });
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          } else {
            reader.onload = () => {
              const textContent = reader.result as string;
              resolve({
                id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                name: file.name,
                type: file.type || 'text/plain',
                size: file.size,
                dataUrl: '',
                isImage: false,
                textContent,
              });
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
          }
        });
      })
    ).then((results) => {
      const valid = results.filter((r): r is MessageAttachment => r !== null);
      setAttachments((prev) => [...prev, ...valid]);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      textareaRef.current?.focus();
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Audio Recording & Gemini Speech-to-Text Transcription
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access was denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    setIsRecording(false);
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/audio/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type || 'audio/webm',
            language: voiceSettings.language || 'auto',
          }),
        });

        const data = await res.json();
        if (res.ok && data.transcript) {
          setInput((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
        }
        setIsTranscribing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Audio transcription error:', err);
      setIsTranscribing(false);
    }
  };

  const canSend = input.trim().length > 0 || attachments.length > 0;

  return (
    <div
      id="chat-composer-container"
      className="w-full shrink-0 px-2.5 sm:px-4 pb-2 sm:pb-3 pt-1 transition-colors select-none z-10 max-w-full"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
    >
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center min-w-0">
        {/* Rounded Input Surface */}
        <div
          className={`w-full rounded-2xl border transition-all duration-200 shadow-sm flex flex-col p-2 sm:p-3 relative min-w-0 ${
            isLight
              ? 'bg-[#F4F4F4] border-neutral-300 focus-within:border-neutral-400 focus-within:bg-white'
              : 'bg-[#2F2F2F] border-[#383838] focus-within:border-[#4A4A4A]'
          }`}
        >
          {/* Active Attachments Previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2 mb-1 border-b border-neutral-700/20 max-w-full">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs border max-w-full ${
                    isLight ? 'bg-white border-neutral-300' : 'bg-[#212121] border-[#383838]'
                  }`}
                >
                  {att.isImage ? (
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-4 h-4 rounded object-cover shrink-0"
                    />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[120px] sm:max-w-[160px] text-[11px] font-medium">{att.name}</span>
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-neutral-400 hover:text-red-400 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.ts,.tsx,.js,.jsx,.json,.py,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Multiline Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Listening to speech...' : isTranscribing ? 'Transcribing audio...' : placeholder}
            rows={1}
            disabled={disabled || isRecording || isTranscribing}
            className={`w-full bg-transparent resize-none outline-none text-xs sm:text-sm leading-relaxed max-h-32 sm:max-h-40 overflow-y-auto px-1 ${
              isLight ? 'text-[#202123] placeholder-neutral-500' : 'text-[#ECECEC] placeholder-neutral-400'
            }`}
          />

          {/* Bottom Toolbar: Tools (+), Web Search, Voice & Send/Stop Buttons */}
          <div className="flex items-center justify-between pt-1.5 sm:pt-2 mt-0.5 sm:mt-1 min-w-0 gap-1">
            {/* Left Controls: Plus / Tools button and Web Search toggle */}
            <div className="flex items-center gap-1.5">
              {/* Contextual Tools Menu (+) */}
              <div className="relative" ref={toolsMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsToolsMenuOpen((prev) => !prev)}
                  title="Tools and capabilities"
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isToolsMenuOpen
                      ? isLight
                        ? 'bg-neutral-300 text-neutral-900'
                        : 'bg-[#404040] text-white'
                      : isLight
                      ? 'hover:bg-neutral-200 text-neutral-600'
                      : 'hover:bg-[#3D3D3D] text-neutral-300'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Tools Dropdown Menu */}
                {isToolsMenuOpen && (
                  <div
                    className={`absolute bottom-full left-0 mb-2 w-56 p-1.5 rounded-xl border shadow-xl z-50 text-xs space-y-0.5 animate-in fade-in slide-in-from-bottom-1 duration-150 ${
                      isLight
                        ? 'bg-white border-neutral-200 text-neutral-800'
                        : 'bg-[#1E1E1E] border-[#333333] text-neutral-200'
                    }`}
                  >
                    <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                      Contextual Tools
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                      }`}
                    >
                      <Paperclip className="w-4 h-4 text-neutral-400" />
                      <span>Upload files &amp; images</span>
                    </button>

                    {onToggleSearchGrounding && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleSearchGrounding(!useSearchGrounding);
                          setIsToolsMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                          useSearchGrounding
                            ? isLight
                              ? 'bg-blue-50 text-blue-900'
                              : 'bg-blue-950/40 text-blue-200'
                            : isLight
                            ? 'hover:bg-neutral-100'
                            : 'hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-blue-400" />
                          <span>Web search grounding</span>
                        </div>
                        {useSearchGrounding && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </button>
                    )}

                    {onOpenImageGen && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenImageGen();
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                          isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>AI Image Studio</span>
                      </button>
                    )}

                    {onOpenVideoStudio && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenVideoStudio();
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                          isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <PlaySquare className="w-4 h-4 text-rose-400" />
                        <span>Video Studio (Veo)</span>
                      </button>
                    )}

                    {onOpenMusicStudio && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenMusicStudio();
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                          isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <Music className="w-4 h-4 text-emerald-400" />
                        <span>Music Studio (Lyria)</span>
                      </button>
                    )}

                    {onOpenProjectsStudio && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenProjectsStudio();
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                          isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <FolderGit2 className="w-4 h-4 text-indigo-400" />
                        <span>Student Projects</span>
                      </button>
                    )}

                    {onOpenAnalytics && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenAnalytics();
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                          isLight ? 'hover:bg-neutral-100' : 'hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span>Usage Analytics (D3.js)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Attach Files Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach images or documents"
                aria-label="Attach images or documents"
                className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                  isLight
                    ? 'hover:bg-neutral-200 text-neutral-600'
                    : 'hover:bg-[#3D3D3D] text-neutral-300'
                }`}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Active Search Grounding indicator pill */}
              {useSearchGrounding && onToggleSearchGrounding && (
                <button
                  type="button"
                  onClick={() => onToggleSearchGrounding(false)}
                  title="Web search active. Click to disable."
                  className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10.5px] sm:text-[11px] font-medium transition-colors shrink-0"
                >
                  <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="hidden xs:inline">Search on</span>
                  <X className="w-2.5 h-2.5 opacity-60 hover:opacity-100 shrink-0" />
                </button>
              )}
            </div>

            {/* Right Controls: Voice Input & Send/Stop Button */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Voice Recording Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing || isStreaming}
                title={isRecording ? `Recording (${recordingSeconds}s)... Click to stop` : 'Dictate with Voice'}
                aria-label={isRecording ? 'Stop recording voice' : 'Dictate with Voice'}
                className={`p-1.5 rounded-full transition-all cursor-pointer min-w-[30px] min-h-[30px] flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                    : isLight
                    ? 'hover:bg-neutral-200 text-neutral-600'
                    : 'hover:bg-[#3D3D3D] text-neutral-300'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : isTranscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Send / Stop Button */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  title="Stop generating"
                  aria-label="Stop generating response"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isLight ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-white text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend || disabled}
                  title={canSend ? 'Send message' : 'Type a message to send'}
                  aria-label="Send message"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 ${
                    canSend
                      ? isLight
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                        : 'bg-white text-neutral-900 hover:bg-neutral-200 shadow-sm'
                      : isLight
                      ? 'bg-neutral-200 text-neutral-400 opacity-60'
                      : 'bg-[#404040] text-neutral-500 opacity-60'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Small Unobtrusive Disclaimer */}
        <p className={`text-[10px] sm:text-[11px] text-center pt-1 sm:pt-1.5 px-2 line-clamp-1 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
          RO can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};
