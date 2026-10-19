import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isLight?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content, isLight = false }) => {
  return (
    <div className={`w-full min-w-0 max-w-full text-[13.5px] sm:text-[14.5px] leading-relaxed break-words space-y-2.5 sm:space-y-3 ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match && !codeString.includes('\n');

            if (isInline) {
              return (
                <code
                  className={`px-1.5 py-0.5 mx-0.5 rounded text-[12px] sm:text-[13px] font-mono border break-all sm:break-normal ${
                    isLight
                      ? 'bg-slate-100 text-indigo-700 border-slate-200 font-semibold'
                      : 'bg-[#0B0E14] text-indigo-300 border-slate-800'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match ? match[1] : 'code'} value={codeString} isLight={isLight} />;
          },
          p({ children }) {
            return <p className={`mb-3 last:mb-0 leading-relaxed font-normal ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{children}</p>;
          },
          strong({ children }) {
            return <strong className={`font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{children}</strong>;
          },
          ul({ children }) {
            return <ul className={`list-disc pl-5 my-2 space-y-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{children}</ul>;
          },
          ol({ children }) {
            return <ol className={`list-decimal pl-5 my-2 space-y-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{children}</ol>;
          },
          li({ children }) {
            return <li className="pl-1">{children}</li>;
          },
          h1({ children }) {
            return <h1 className={`text-lg sm:text-xl font-black mt-4 mb-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 className={`text-base sm:text-lg font-bold mt-3 mb-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 className={`text-sm sm:text-base font-semibold mt-2 mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className={`border-l-4 border-indigo-500 pl-3 py-1.5 my-2 italic rounded-r ${
                isLight ? 'bg-indigo-50/70 text-slate-800' : 'bg-indigo-950/30 text-slate-200'
              }`}>
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className={`w-full max-w-full overflow-x-auto my-3 rounded-xl border custom-code-scroll ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#020617]/70'
              }`}>
                <table className="min-w-full divide-y divide-slate-700/40 text-xs sm:text-sm">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className={`font-semibold ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-200'}`}>{children}</thead>;
          },
          th({ children }) {
            return <th className="px-3.5 py-2 text-left font-bold">{children}</th>;
          },
          td({ children }) {
            return <td className={`px-3.5 py-2 border-t border-slate-700/30 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{children}</td>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className={`underline font-semibold transition-colors ${
                  isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
                }`}
              >
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              <div className="my-3 max-w-full overflow-hidden">
                <img
                  src={src}
                  alt={alt || 'Rendered visual'}
                  className="max-w-full h-auto max-h-[460px] object-contain rounded-2xl border border-slate-700/50 shadow-md bg-black/25"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {alt && (
                  <div className={`text-[11px] mt-1.5 px-1 italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {alt}
                  </div>
                )}
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

interface CodeBlockProps {
  language: string;
  value: string;
  isLight?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, isLight = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch {
          // Fallback below
        }
      }
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Code copy fallback notice:', e);
    }
  };

  return (
    <div className={`w-full max-w-full min-w-0 relative my-3 rounded-xl overflow-hidden border text-[12.5px] sm:text-[13px] shadow-md ${
      isLight
        ? 'border-slate-300 bg-slate-950 text-slate-100'
        : 'border-slate-800 bg-[#020617] text-slate-100'
    }`}>
      <div className="flex items-center justify-between px-3 sm:px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-xs text-slate-400 font-mono min-w-0">
        <span className="uppercase tracking-wider font-semibold text-[10.5px] sm:text-[11px] text-indigo-400 truncate pr-2">
          {language || 'code'}
        </span>
        <button
          id={`copy-code-btn-${Math.random().toString(36).substr(2, 4)}`}
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-2.5 sm:p-3.5 overflow-x-auto font-mono text-[12px] sm:text-[13px] leading-relaxed text-slate-100 max-w-full custom-code-scroll">
        <pre className="overflow-x-auto max-w-full whitespace-pre font-mono m-0">{value}</pre>
      </div>
    </div>
  );
};

