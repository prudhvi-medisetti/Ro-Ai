import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  User,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowDown,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  Pencil,
  Compass,
  Code2,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  Volume2,
  VolumeX,
  Globe,
} from 'lucide-react';
import { ChatMessage, BotPersona, UserAccount, CustomUiSettings } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { RoOfficialLogo } from './RoOfficialLogo';
import { GeneratedImageCard } from './GeneratedImageCard';
import { PdfDocumentCard } from './PdfDocumentCard';
import { detectPdfMetadata, downloadGeneratedPdf } from '../utils/pdfGenerator';

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentPersona?: BotPersona;
  isStreaming: boolean;
  onRetry: (messageId: string) => void;
  onSendPrompt: (prompt: string) => void;
  onSendImagePrompt?: (prompt: string, options?: { aspectRatio?: string; style?: string }) => void;
  onEditSystemInstruction?: () => void;
  currentUser?: UserAccount | null;
  onUpdateUser?: (updated: Partial<UserAccount>) => void;
  theme?: 'light' | 'dark' | string;
  uiSettings?: CustomUiSettings;
  renderHeroInput?: React.ReactNode;
  onOpenImageGen?: () => void;
  onOpenPrepModules?: () => void;
  onOpenProjectsStudio?: () => void;
  onOpenAutonomousBuilder?: (initialPrompt?: string) => void;
  onOpenThumbnailStudio?: () => void;
  onOpenUiCustomizer?: () => void;
  speakingMessageId?: string | null;
  onToggleSpeak?: (messageId: string, text: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isStreaming,
  onRetry,
  onSendPrompt,
  theme = 'dark',
  speakingMessageId = null,
  onToggleSpeak,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Lightbox for image attachments
  const [lightboxImage, setLightboxImage] = useState<{ src: string; name: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const isLight = theme === 'light';

  // Auto-scroll logic: only auto-scroll if user has not explicitly scrolled up to read older content
  useEffect(() => {
    if (!userHasScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
    }
  }, [messages, isStreaming, userHasScrolledUp]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottom(isFarFromBottom);
    setUserHasScrolledUp(isFarFromBottom);
  };

  const scrollToBottom = () => {
    setUserHasScrolledUp(false);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  const handleCopyText = async (id: string, text: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Four compact, clean suggestions for ChatGPT-style home screen
  const suggestionCards = [
    {
      title: 'Write something',
      description: 'Draft an email, blog post, or creative story',
      icon: <Pencil className="w-4 h-4 text-emerald-400" />,
      prompt: 'Help me draft a concise, persuasive email to my team outlining project goals, key milestones, and next steps for the week.',
    },
    {
      title: 'Learn something',
      description: 'Explain complex concepts in simple terms',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      prompt: 'Explain how neural networks and transformer attention mechanisms work in simple terms with an intuitive real-world analogy.',
    },
    {
      title: 'Code with me',
      description: 'Debug scripts, design APIs, or optimize code',
      icon: <Code2 className="w-4 h-4 text-indigo-400" />,
      prompt: 'Write a high-performance TypeScript debounce and throttle utility with cancel support, and explain the implementation details.',
    },
    {
      title: 'Create something',
      description: 'Brainstorm product ideas, schemas, or plans',
      icon: <Wand2 className="w-4 h-4 text-purple-400" />,
      prompt: 'Give me 4 innovative, practical software product ideas for developer tools that solve real everyday workflow friction.',
    },
  ];

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`flex-1 overflow-y-auto px-2.5 sm:px-4 md:px-6 py-4 sm:py-6 transition-colors select-text w-full min-w-0 ${
        isLight ? 'bg-white text-[#202123]' : 'bg-[#212121] text-[#ECECEC]'
      }`}
    >
      {/* Empty State: ChatGPT-style Centered Home Screen */}
      {messages.length === 0 ? (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[45vh] sm:min-h-[58vh] text-center space-y-4 sm:space-y-6 py-4 sm:py-6 animate-in fade-in duration-300 select-none px-2 sm:px-0">
          {/* Logo and Headline */}
          <div className="flex flex-col items-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shadow-xs">
              <RoOfficialLogo customSize={24} variant="icon-only" showText={false} />
            </div>

            <h1
              className={`text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight px-2 leading-tight ${
                isLight ? 'text-neutral-900' : 'text-neutral-100'
              }`}
              style={{ fontSize: 'clamp(1.25rem, 4vw, 1.875rem)' }}
            >
              What can I help you with?
            </h1>

            <p
              className={`text-xs sm:text-sm max-w-md px-2 ${
                isLight ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              Ask anything. Explore ideas. Get things done.
            </p>
          </div>

          {/* 4 Compact Suggestion Cards (1 col on mobile, 2 col on sm+) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1 sm:pt-2">
            {suggestionCards.map((card, idx) => (
              <button
                key={idx}
                id={`btn-suggestion-card-${idx}`}
                onClick={() => onSendPrompt(card.prompt)}
                className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-2.5 sm:gap-3 shadow-xs ${
                  isLight
                    ? 'bg-neutral-50/80 hover:bg-neutral-100/90 border-neutral-200 hover:border-neutral-300 text-neutral-800'
                    : 'bg-[#1E1E1E] hover:bg-[#282828] border-[#2E2E2E] hover:border-[#3E3E3E] text-neutral-200'
                }`}
              >
                <div
                  className={`p-1.5 sm:p-2 rounded-lg shrink-0 transition-colors ${
                    isLight ? 'bg-white border border-neutral-200' : 'bg-[#262626]'
                  }`}
                >
                  {card.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold flex items-center justify-between gap-1">
                    <span className="truncate">{card.title}</span>
                    <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-neutral-400 text-[10px]">
                      →
                    </span>
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed mt-0.5 line-clamp-1 ${
                      isLight ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    {card.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation Experience: Centered 760–820px width */
        <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-28 min-w-0">
          {messages.map((message, idx) => {
            const isUser = message.role === 'user';
            const isLastMessage = idx === messages.length - 1;
            const isCurrentlyStreaming = isLastMessage && !isUser && isStreaming;

            // Check if message content is a PDF document
            const pdfMeta = !isUser && message.content ? detectPdfMetadata(message.content) : null;

            return (
              <div
                key={message.id || idx}
                id={`chat-message-${message.id}`}
                className={`group flex gap-2 sm:gap-3.5 transition-all w-full min-w-0 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {isUser ? (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-xs">
                      U
                    </div>
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shadow-xs">
                      <RoOfficialLogo customSize={16} variant="icon-only" showText={false} />
                    </div>
                  )}
                </div>

                {/* Message Content Container */}
                <div
                  className={`min-w-0 flex flex-col space-y-1.5 sm:space-y-2 ${
                    isUser ? 'items-end max-w-[88%] sm:max-w-[78%]' : 'items-start flex-1 w-full min-w-0'
                  }`}
                >
                  {/* Attachments Preview (if any) */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {message.attachments.map((att, aIdx) => (
                        <div
                          key={att.id || aIdx}
                          className={`rounded-lg overflow-hidden border ${
                            isLight ? 'bg-neutral-100 border-neutral-300' : 'bg-[#2A2A2A] border-[#3A3A3A]'
                          }`}
                        >
                          {att.isImage ? (
                            <button
                              onClick={() => setLightboxImage({ src: att.dataUrl, name: att.name })}
                              className="block cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={att.dataUrl}
                                alt={att.name}
                                className="max-w-[200px] max-h-[160px] object-cover rounded-lg"
                              />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 text-xs">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="font-medium truncate max-w-[160px]">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl text-[13.5px] sm:text-[14px] leading-relaxed break-words w-full min-w-0 ${
                      isUser
                        ? isLight
                          ? 'bg-[#E9E9EB] text-[#202123] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-br-sm'
                          : 'bg-[#2F2F2F] text-[#ECECEC] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-br-sm'
                        : 'px-0 sm:px-1 py-0.5 sm:py-1'
                    }`}
                  >
                    {/* Render PDF Document Card if detected */}
                    {pdfMeta && (
                      <div className="mb-3">
                        <PdfDocumentCard
                          title={pdfMeta.title}
                          filename={pdfMeta.filename}
                          category={pdfMeta.category}
                          duration={pdfMeta.duration}
                          content={message.content}
                          isLight={isLight}
                        />
                      </div>
                    )}

                    {/* Main Content Markdown Renderer */}
                    {message.content ? (
                      <MarkdownRenderer content={message.content} isLight={isLight} />
                    ) : isCurrentlyStreaming ? (
                      message.isSearchingWeb ? (
                        <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs w-fit animate-pulse">
                          <Globe className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                          <span className="font-medium">Searching live web for current updates…</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-1 text-neutral-400 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono tracking-tight">Responding...</span>
                        </div>
                      )
                    ) : null}

                    {/* Live streaming blinking cursor */}
                    {isCurrentlyStreaming && message.content && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Web Search Sources / Grounding pills (if available) */}
                  {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1.5 w-full">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Sources &amp; Citations ({message.sources.length}):</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {message.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border font-medium transition-all ${
                              isLight
                                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-800 hover:border-indigo-300'
                                : 'bg-[#22252B] hover:bg-[#2A2E37] border-[#363B47] text-neutral-200 hover:border-indigo-500/40'
                            }`}
                          >
                            <span className="truncate max-w-[180px]">{src.title || src.uri}</span>
                            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Actions Toolbar (Copy, Read Aloud, Regenerate, Latency Metrics) */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center gap-1 pt-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {message.content && (
                        <button
                          onClick={() => handleCopyText(message.id, message.content)}
                          title="Copy response"
                          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            isLight
                              ? 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                              : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Read Aloud / Stop Audio Button */}
                      {message.content && onToggleSpeak && (
                        <button
                          onClick={() => onToggleSpeak(message.id, message.content)}
                          title={speakingMessageId === message.id ? 'Stop audio' : 'Read aloud'}
                          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            speakingMessageId === message.id
                              ? 'text-indigo-400 bg-indigo-500/15'
                              : isLight
                              ? 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                              : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {speakingMessageId === message.id ? (
                            <VolumeX className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Regenerate button on last assistant message */}
                      {isLastMessage && !isStreaming && (
                        <button
                          onClick={() => onRetry(message.id)}
                          title="Regenerate response"
                          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            isLight
                              ? 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                              : 'hover:bg-[#2A2A2A] text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Measured Performance & TTFT Metrics */}
                      {message.latencyStats && (
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 ml-1 rounded-full text-[10px] font-mono tracking-tight border select-none ${
                            message.latencyStats.ttftMs < 1000
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : message.latencyStats.ttftMs <= 2000
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          }`}
                          title={`Time-To-First-Token: ${message.latencyStats.ttftMs}ms | Total Duration: ${(
                            message.latencyStats.totalDurationMs / 1000
                          ).toFixed(2)}s | Model: ${message.latencyStats.modelUsed}`}
                        >
                          <span className="text-[10px]">⚡</span>
                          <span className="font-semibold">{message.latencyStats.ttftMs}ms</span>
                          <span className="opacity-40">•</span>
                          <span>{(message.latencyStats.totalDurationMs / 1000).toFixed(1)}s</span>
                          {message.latencyStats.modelUsed && (
                            <>
                              <span className="opacity-40">•</span>
                              <span className="truncate max-w-[80px] opacity-75">
                                {message.latencyStats.modelUsed.replace('gemini-', '')}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error State with Retry Button */}
                  {message.error && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{message.content || 'An error occurred during generation.'}</span>
                      <button
                        onClick={() => onRetry(message.id)}
                        className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 font-semibold cursor-pointer text-red-300"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} className="h-4" />
        </div>
      )}

      {/* Floating Scroll to Bottom Button - Centered above composer */}
      {showScrollBottom && (
        <div className="sticky bottom-2 sm:bottom-4 flex justify-center w-full pointer-events-none z-20">
          <button
            onClick={scrollToBottom}
            title="Scroll to latest message"
            aria-label="Scroll to latest message"
            className={`pointer-events-auto px-3 py-1.5 rounded-full border shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-medium ${
              isLight
                ? 'bg-white/95 border-neutral-300 text-neutral-800 shadow-neutral-300/60 backdrop-blur-xs'
                : 'bg-[#2A2A2A]/95 border-[#3A3A3A] text-neutral-100 shadow-black/60 backdrop-blur-xs'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] font-semibold">Latest</span>
          </button>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setLightboxImage(null);
            setLightboxZoom(1);
          }}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10 bg-black/60 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setLightboxZoom((prev) => Math.min(2.5, prev + 0.25))}
                className="p-1.5 text-white hover:text-indigo-400"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxZoom((prev) => Math.max(0.75, prev - 0.25))}
                className="p-1.5 text-white hover:text-indigo-400"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setLightboxImage(null);
                  setLightboxZoom(1);
                }}
                className="p-1.5 text-white hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <img
              src={lightboxImage.src}
              alt={lightboxImage.name}
              style={{ transform: `scale(${lightboxZoom})` }}
              className="max-w-full max-h-[82vh] object-contain rounded-xl transition-transform duration-200 shadow-2xl"
            />
            <p className="text-xs text-neutral-400 mt-2 truncate max-w-md">
              {lightboxImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
