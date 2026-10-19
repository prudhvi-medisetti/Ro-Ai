import React from 'react';
import { RoOfficialLogo } from './RoOfficialLogo';

interface RoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  glow?: boolean;
}

export const RoLogo: React.FC<RoLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    xs: {
      dim: 26,
      text: 'text-xs',
      subtext: 'text-[9px]',
    },
    sm: {
      dim: 34,
      text: 'text-sm',
      subtext: 'text-[10px]',
    },
    md: {
      dim: 46,
      text: 'text-base',
      subtext: 'text-xs',
    },
    lg: {
      dim: 64,
      text: 'text-xl',
      subtext: 'text-xs',
    },
    xl: {
      dim: 96,
      text: 'text-2xl',
      subtext: 'text-sm',
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Mascot in Speech Bubble */}
      <div className="shrink-0 transition-transform hover:scale-105 duration-200">
        <RoOfficialLogo
          customSize={current.dim}
          variant="icon-only"
          showText={false}
          glow={glow}
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent ${current.text}`}
            >
              Ro
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-cyan-300 border border-cyan-500/30">
              AI
            </span>
          </div>
          {subtitle && (
            <span className={`text-slate-400 font-medium ${current.subtext}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
