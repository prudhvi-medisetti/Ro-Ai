import React from 'react';

interface RoOfficialLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  customSize?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'full' | 'icon-only' | 'badge' | 'transparent';
  glow?: boolean;
  className?: string;
  id?: string;
}

export const RoOfficialLogo: React.FC<RoOfficialLogoProps> = ({
  size = 'md',
  customSize,
  showText = true,
  showSubtitle = true,
  variant = 'full',
  glow = true,
  className = '',
  id = 'ro-official-logo-svg',
}) => {
  const getSizePx = () => {
    if (customSize) return customSize;
    switch (size) {
      case 'xs':
        return 32;
      case 'sm':
        return 48;
      case 'md':
        return 72;
      case 'lg':
        return 110;
      case 'xl':
        return 180;
      case '2xl':
        return 260;
      case 'hero':
        return 360;
      default:
        return 72;
    }
  };

  const dim = getSizePx();
  const isIconOnly = variant === 'icon-only' || !showText;
  const viewBox = isIconOnly ? '0 0 500 500' : '0 0 500 620';
  const height = isIconOnly ? dim : (dim * 620) / 500;

  return (
    <div
      id={`ro-logo-wrapper-${size}`}
      className={`inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: dim, height }}
    >
      <svg
        id={id}
        viewBox={viewBox}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Neon Bubble Ring Gradient: Cyan to Purple/Magenta */}
          <linearGradient id="roBubbleRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* R Gradient: Cyan to Royal Blue */}
          <linearGradient id="roLetterRGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* O Gradient: Indigo to Bright Purple / Violet */}
          <linearGradient id="roLetterOGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>

          {/* Robot Head Shading Gradients */}
          <radialGradient id="roHead3DGrad" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F1F5F9" />
            <stop offset="80%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>

          <radialGradient id="roVisorGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="70%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          <linearGradient id="roEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="roCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="roCyanSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="roBubbleAmbientGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="roDropShadow">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* --- 1. NEON SPEECH BUBBLE WITH ROBOT MASCOT --- */}
        <g id="ro-mascot-group" filter={glow ? 'url(#roDropShadow)' : undefined}>
          {/* Ambient Glow behind speech bubble */}
          {glow && (
            <path
              d="M 250,55 C 355,55 435,135 435,240 C 435,345 355,420 250,420 C 210,420 180,410 150,428 L 130,445 C 122,450 115,445 118,435 L 130,390 C 85,355 65,300 65,240 C 65,135 145,55 250,55 Z"
              fill="none"
              stroke="url(#roBubbleRingGrad)"
              strokeWidth="24"
              opacity="0.35"
              filter="url(#roBubbleAmbientGlow)"
            />
          )}

          {/* Inner Dark Background of Speech Bubble */}
          <path
            d="M 250,55 C 355,55 435,135 435,240 C 435,345 355,420 250,420 C 210,420 180,410 150,428 L 130,445 C 122,450 115,445 118,435 L 130,390 C 85,355 65,300 65,240 C 65,135 145,55 250,55 Z"
            fill="#080C16"
          />

          {/* Outer Neon Speech Bubble Rim */}
          <path
            d="M 250,55 C 355,55 435,135 435,240 C 435,345 355,420 250,420 C 210,420 180,410 150,428 L 130,445 C 122,450 115,445 118,435 L 130,390 C 85,355 65,300 65,240 C 65,135 145,55 250,55 Z"
            fill="none"
            stroke="url(#roBubbleRingGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* --- ROBOT HEAD --- */}
          {/* Top Antenna */}
          <path d="M 250,132 L 250,98" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
          <circle cx="250" cy="94" r="14" fill="url(#roHead3DGrad)" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="246" cy="90" r="4" fill="#FFFFFF" opacity="0.9" />

          {/* Left Headphone Ear-cup */}
          <ellipse cx="140" cy="235" rx="20" ry="40" fill="url(#roEarGrad)" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="136" cy="235" rx="10" ry="26" fill="#0F172A" />
          <ellipse cx="136" cy="235" rx="6" ry="18" fill="none" stroke="#00F0FF" strokeWidth="3.5" filter="url(#roCyanSoftGlow)" />

          {/* Right Headphone Ear-cup */}
          <ellipse cx="360" cy="235" rx="20" ry="40" fill="url(#roEarGrad)" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="364" cy="235" rx="10" ry="26" fill="#0F172A" />
          <ellipse cx="364" cy="235" rx="6" ry="18" fill="none" stroke="#00F0FF" strokeWidth="3.5" filter="url(#roCyanSoftGlow)" />

          {/* White Robot Helmet Head */}
          <rect
            x="145"
            y="125"
            width="210"
            height="215"
            rx="105"
            fill="url(#roHead3DGrad)"
            stroke="#E2E8F0"
            strokeWidth="3"
          />

          {/* Specular Highlight on Helmet */}
          <ellipse cx="215" cy="155" rx="45" ry="18" fill="#FFFFFF" opacity="0.45" transform="rotate(-15 215 155)" />

          {/* Black Glossy Screen Face Visor */}
          <rect
            x="168"
            y="175"
            width="164"
            height="130"
            rx="52"
            fill="url(#roVisorGrad)"
            stroke="#334155"
            strokeWidth="3"
          />

          {/* Visor Top Arc Specular Reflection */}
          <path
            d="M 185,198 C 220,186 280,186 315,198"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Glowing Cyan Eyes (Happy Curved Arcs `^ ^`) */}
          {/* Left Eye */}
          <path
            d="M 195,232 C 205,216 220,216 230,232"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#roCyanGlow)"
          />
          <path
            d="M 195,232 C 205,216 220,216 230,232"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Right Eye */}
          <path
            d="M 270,232 C 280,216 295,216 305,232"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#roCyanGlow)"
          />
          <path
            d="M 270,232 C 280,216 295,216 305,232"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Glowing Cyan Smile */}
          <path
            d="M 235,264 C 243,275 257,275 265,264"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#roCyanGlow)"
          />
          <path
            d="M 235,264 C 243,275 257,275 265,264"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* --- 2. TYPOGRAPHY "RO" & "AI CHAT ASSISTANT" --- */}
        {showText && !isIconOnly && (
          <g id="ro-typography-group">
            {/* Letter 'R' (Futuristic Cyan/Blue with Top Wing) */}
            <path
              d="M 140,470 C 160,470 178,472 205,472 C 228,472 245,485 245,505 C 245,524 230,535 210,538 L 248,580 L 220,580 L 186,542 L 172,542 L 172,580 L 146,580 L 146,522 C 146,522 185,522 204,522 C 216,522 222,516 222,506 C 222,496 215,492 202,492 L 140,492 Z"
              fill="url(#roLetterRGrad)"
            />

            {/* Letter 'O' (Purple/Violet Ring with 3 Chat Dots inside) */}
            <g id="letter-O-group">
              {/* Outer Ring */}
              <circle
                cx="295"
                cy="528"
                r="38"
                fill="none"
                stroke="url(#roLetterOGrad)"
                strokeWidth="18"
              />
              {/* Inner Solid Center */}
              <circle cx="295" cy="528" r="28" fill="#0A0E1A" />
              {/* 3 Chat Speech Dots inside 'O' */}
              <circle cx="283" cy="528" r="3.5" fill="#00F0FF" filter="url(#roCyanSoftGlow)" />
              <circle cx="295" cy="528" r="3.5" fill="#00F0FF" filter="url(#roCyanSoftGlow)" />
              <circle cx="307" cy="528" r="3.5" fill="#00F0FF" filter="url(#roCyanSoftGlow)" />
            </g>

            {/* Subtitle: "AI CHAT ASSISTANT" */}
            {showSubtitle && (
              <g id="subtitle-group">
                <text
                  x="250"
                  y="608"
                  fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                  fontSize="17"
                  fontWeight="800"
                  fill="#F8FAFC"
                  textAnchor="middle"
                  letterSpacing="6.5"
                >
                  AI CHAT ASSISTANT
                </text>

                {/* Subtitle bottom divider with cyan & purple accents */}
                <line x1="160" y1="620" x2="236" y2="620" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="250" cy="620" r="2.5" fill="#38BDF8" />
                <line x1="264" y1="620" x2="340" y2="620" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
