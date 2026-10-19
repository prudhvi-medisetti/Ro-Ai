import React, { useState, useRef } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  X,
  Layers,
  Eye,
  Trash2,
  Sun,
  Moon,
  Zap,
  Maximize2,
  Minimize2,
  Grid,
  Move,
} from 'lucide-react';
import {
  CustomUiSettings,
  ThemeMode,
  BubbleStyle,
  AccentColor,
  BackgroundFit,
  BackgroundPosition,
  DEFAULT_UI_SETTINGS,
} from '../types';
import { WALLPAPER_PRESETS } from '../data/wallpapers';

interface UiCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiSettings: CustomUiSettings;
  onUpdateUiSettings: (settings: CustomUiSettings) => void;
}

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: React.ReactNode; bgClass: string }[] = [
  {
    id: 'dark',
    label: 'Standard Dark',
    icon: <Moon className="w-4 h-4 text-indigo-400" />,
    bgClass: 'bg-[#0B0E14] border-slate-800 text-slate-100',
  },
  {
    id: 'light',
    label: 'Clean Light',
    icon: <Sun className="w-4 h-4 text-amber-500" />,
    bgClass: 'bg-white border-slate-200 text-slate-900',
  },
  {
    id: 'midnight',
    label: 'Midnight AMOLED',
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
    bgClass: 'bg-black border-slate-900 text-slate-100',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk Violet',
    icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
    bgClass: 'bg-[#0f0a1c] border-purple-900 text-purple-100',
  },
  {
    id: 'sunset',
    label: 'Twilight Sunset',
    icon: <Sparkles className="w-4 h-4 text-rose-400" />,
    bgClass: 'bg-[#180d16] border-rose-900 text-rose-100',
  },
  {
    id: 'emerald',
    label: 'Forest Emerald',
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    bgClass: 'bg-[#061410] border-emerald-900 text-emerald-100',
  },
  {
    id: 'ocean',
    label: 'Ocean Abyss',
    icon: <Sparkles className="w-4 h-4 text-blue-400" />,
    bgClass: 'bg-[#071324] border-blue-900 text-blue-100',
  },
  {
    id: 'slate',
    label: 'Slate Minimal',
    icon: <Sliders className="w-4 h-4 text-slate-400" />,
    bgClass: 'bg-[#141820] border-slate-700 text-slate-100',
  },
];

const ACCENT_COLORS: { id: AccentColor; label: string; colorClass: string; hex: string }[] = [
  { id: 'indigo', label: 'Indigo', colorClass: 'bg-indigo-500', hex: '#6366F1' },
  { id: 'blue', label: 'Sky Blue', colorClass: 'bg-blue-500', hex: '#3B82F6' },
  { id: 'purple', label: 'Violet Purple', colorClass: 'bg-purple-500', hex: '#A855F7' },
  { id: 'emerald', label: 'Emerald Green', colorClass: 'bg-emerald-500', hex: '#10B981' },
  { id: 'amber', label: 'Warm Amber', colorClass: 'bg-amber-500', hex: '#F59E0B' },
  { id: 'rose', label: 'Rose Pink', colorClass: 'bg-rose-500', hex: '#F43F5E' },
  { id: 'cyan', label: 'Neon Cyan', colorClass: 'bg-cyan-500', hex: '#06B6D4' },
];

const BUBBLE_STYLES: { id: BubbleStyle; label: string; description: string }[] = [
  { id: 'solid', label: 'Solid High-Contrast', description: 'Clean high contrast solid bubbles' },
  { id: 'glass', label: 'Frosted Glass', description: 'Translucent glassmorphism with ambient blur' },
  { id: 'minimal', label: 'Minimal Flat', description: 'Understated borders with clean spacing' },
  { id: 'bordered', label: 'Modern Outline', description: 'Accent colored border with dark back' },
];

export const UiCustomizerModal: React.FC<UiCustomizerModalProps> = ({
  isOpen,
  onClose,
  uiSettings,
  onUpdateUiSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'theme' | 'bubbles' | 'layout'>('wallpaper');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isLight = uiSettings.themeMode === 'light';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateUiSettings({
        ...uiSettings,
        customBackgroundUrl: dataUrl,
        presetBackgroundId: 'custom',
      });
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onUpdateUiSettings({
      ...uiSettings,
      customBackgroundUrl: urlInput.trim(),
      presetBackgroundId: 'custom',
    });
    setUrlInput('');
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = WALLPAPER_PRESETS.find((p) => p.id === presetId);
    if (presetId === 'none') {
      onUpdateUiSettings({
        ...uiSettings,
        presetBackgroundId: 'none',
        customBackgroundUrl: '',
      });
    } else if (preset) {
      onUpdateUiSettings({
        ...uiSettings,
        presetBackgroundId: preset.id,
        customBackgroundUrl: preset.imageUrl || '',
      });
    }
  };

  const handleClearBackground = () => {
    onUpdateUiSettings({
      ...uiSettings,
      presetBackgroundId: 'none',
      customBackgroundUrl: '',
    });
  };

  const handleResetDefaults = () => {
    onUpdateUiSettings({ ...DEFAULT_UI_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0E131F] border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'border-slate-100 bg-slate-50/80' : 'border-slate-800/80 bg-[#0B0F19]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Customise UI &amp; Wallpapers</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Personalise your chat background, theme palettes, and bubble styles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-200/60 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customizer Navigation Tabs */}
        <div className={`flex items-center gap-1 px-6 py-2.5 border-b overflow-x-auto ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/60 bg-slate-950/40'
        }`}>
          {[
            { id: 'wallpaper', label: 'Background Image', icon: <ImageIcon className="w-4 h-4" /> },
            { id: 'theme', label: 'Theme & Accent', icon: <Palette className="w-4 h-4" /> },
            { id: 'bubbles', label: 'Chat Bubbles', icon: <Layers className="w-4 h-4" /> },
            { id: 'layout', label: 'Typography & Layout', icon: <Sliders className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? isLight
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: WALLPAPER & BACKGROUND IMAGES */}
          {activeTab === 'wallpaper' && (
            <div className="space-y-6">
              {/* UPLOAD CUSTOM WALLPAPER SECTION */}
              <div className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Upload className="w-4 h-4 text-indigo-500" />
                    <span>Upload Custom Background</span>
                  </div>
                  {uiSettings.customBackgroundUrl && (
                    <button
                      onClick={handleClearBackground}
                      className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Background</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Trigger */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                      isLight
                        ? 'border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20'
                        : 'border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-indigo-950/20'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-indigo-500 mb-1.5" />
                    <span className="text-xs font-semibold">
                      {isUploading ? 'Loading image...' : 'Choose from your computer'}
                    </span>
                    <span className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      PNG, JPG, WEBP, GIF
                    </span>
                  </button>

                  {/* Or Enter Image URL */}
                  <div className="flex flex-col justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-950/30">
                    <div className="space-y-1">
                      <span className="text-xs font-medium">Or paste image web link:</span>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                            : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    <button
                      onClick={handleApplyUrl}
                      disabled={!urlInput.trim()}
                      className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Apply Web Wallpaper
                    </button>
                  </div>
                </div>
              </div>

              {/* WALLPAPER SLIDERS: DIM & BLUR */}
              {(uiSettings.customBackgroundUrl || uiSettings.presetBackgroundId !== 'none') && (
                <div className={`p-4 rounded-2xl border space-y-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Wallpaper Readability Controls</span>
                  </div>

                  {/* Dim / Opacity Overlay Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Dark Overlay (Improves Text Contrast)</span>
                      <span className="font-mono text-indigo-400">{uiSettings.backgroundDim}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={uiSettings.backgroundDim}
                      onChange={(e) =>
                        onUpdateUiSettings({
                          ...uiSettings,
                          backgroundDim: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0% (Bright Wallpaper)</span>
                      <span>50% (Recommended)</span>
                      <span>90% (Maximum Legibility)</span>
                    </div>
                  </div>

                  {/* Image Fit Mode */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>Image Fit Mode (How Image Fits Canvas)</span>
                      <span className="font-mono text-indigo-400 capitalize">
                        {uiSettings.backgroundFit || 'cover'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: 'cover',
                          label: 'Fill Screen',
                          desc: 'Crops edges to fill window',
                          icon: <Maximize2 className="w-3.5 h-3.5" />,
                        },
                        {
                          id: 'contain',
                          label: 'Fit Whole Image',
                          desc: 'Shows full photo without crop',
                          icon: <Minimize2 className="w-3.5 h-3.5" />,
                        },
                        {
                          id: 'fill',
                          label: 'Stretch to Fit',
                          desc: 'Stretches width & height 100%',
                          icon: <Move className="w-3.5 h-3.5" />,
                        },
                        {
                          id: 'tile',
                          label: 'Tile Pattern',
                          desc: 'Repeats seamless wallpaper',
                          icon: <Grid className="w-3.5 h-3.5" />,
                        },
                      ].map((mode) => {
                        const isCurrent = (uiSettings.backgroundFit || 'cover') === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                backgroundFit: mode.id as BackgroundFit,
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50 shadow-xs'
                                : isLight
                                ? 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/60 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold flex items-center gap-1.5">
                                {mode.icon}
                                <span>{mode.label}</span>
                              </span>
                              {isCurrent && <Check className="w-3 h-3 text-indigo-400" />}
                            </div>
                            <span className="text-[10px] text-slate-500 leading-tight">
                              {mode.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Image Vertical Alignment / Position */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>Image Focal Position</span>
                      <span className="font-mono text-indigo-400 capitalize">
                        {uiSettings.backgroundPosition || 'center'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'center', label: 'Center Focus' },
                        { id: 'top', label: 'Top Aligned' },
                        { id: 'bottom', label: 'Bottom Aligned' },
                      ].map((pos) => {
                        const isCurrent = (uiSettings.backgroundPosition || 'center') === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                backgroundPosition: pos.id as BackgroundPosition,
                              })
                            }
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                                : isLight
                                ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                                : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* CURATED PRESET WALLPAPERS GALLERY */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Curated Wallpaper Presets
                  </span>
                  <span className="text-[11px] text-slate-500">Click to apply instantly</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WALLPAPER_PRESETS.map((preset) => {
                    const isSelected =
                      uiSettings.presetBackgroundId === preset.id ||
                      (preset.id === 'none' && !uiSettings.customBackgroundUrl);

                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`relative h-24 rounded-2xl overflow-hidden border transition-all cursor-pointer group text-left p-3 flex flex-col justify-between ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-lg scale-[1.02]'
                            : 'border-slate-800 hover:border-slate-600 opacity-85 hover:opacity-100'
                        }`}
                      >
                        {/* Background Image or Gradient */}
                        {preset.imageUrl ? (
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${preset.previewGradient}`}
                          />
                        )}

                        {/* Dark gradient for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Indicator */}
                        <div className="relative z-10 flex justify-end">
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Bottom Label */}
                        <div className="relative z-10">
                          <div className="text-xs font-bold text-white drop-shadow-sm">
                            {preset.name}
                          </div>
                          <span className="text-[10px] text-slate-300 font-medium drop-shadow-xs">
                            {preset.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THEMES & ACCENTS */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Theme Mode Grid */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Theme Palette
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_OPTIONS.map((th) => {
                    const isSelected = uiSettings.themeMode === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() =>
                          onUpdateUiSettings({
                            ...uiSettings,
                            themeMode: th.id,
                          })
                        }
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          th.bgClass
                        } ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md scale-[1.01]'
                            : 'opacity-85 hover:opacity-100 hover:scale-[1.005]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                            {th.icon}
                          </div>
                          <span className="font-semibold text-xs">{th.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Primary Accent Color
                </span>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((acc) => {
                    const isSelected = uiSettings.accentColor === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() =>
                          onUpdateUiSettings({
                            ...uiSettings,
                            accentColor: acc.id,
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-indigo-400 ring-2 ring-indigo-500 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full ${acc.colorClass} shadow-xs`}
                          style={{ backgroundColor: acc.hex }}
                        />
                        <span className="text-xs font-semibold">{acc.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-indigo-400 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUBBLE STYLES */}
          {activeTab === 'bubbles' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Message Bubble Architecture
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUBBLE_STYLES.map((bubble) => {
                  const isSelected = uiSettings.bubbleStyle === bubble.id;
                  return (
                    <button
                      key={bubble.id}
                      onClick={() =>
                        onUpdateUiSettings({
                          ...uiSettings,
                          bubbleStyle: bubble.id,
                        })
                      }
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-100">{bubble.label}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {bubble.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TYPOGRAPHY & LAYOUT */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              {/* Font Size Scaling */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Chat Font Scaling
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'sm', label: 'Compact (14px)' },
                    { id: 'md', label: 'Regular (15px)' },
                    { id: 'lg', label: 'Comfortable (16px)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() =>
                        onUpdateUiSettings({
                          ...uiSettings,
                          fontSize: f.id as any,
                        })
                      }
                      className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                        uiSettings.fontSize === f.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 text-xs font-semibold'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Toggles */}
              <div className="space-y-3 pt-4 border-t border-slate-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Interface Display Options
                </span>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-900/40 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Compact Top Bar</div>
                    <div className="text-[11px] text-slate-400">
                      Reduces top header height to maximize vertical chat workspace
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={uiSettings.compactHeader}
                    onChange={(e) =>
                      onUpdateUiSettings({
                        ...uiSettings,
                        compactHeader: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-900/40 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Show Quick Prompt Modifiers</div>
                    <div className="text-[11px] text-slate-400">
                      Display pill buttons (Concise, Code example, Step-by-step) above the chat input
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={uiSettings.showModifiers}
                    onChange={(e) =>
                      onUpdateUiSettings({
                        ...uiSettings,
                        showModifiers: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-6 py-3.5 border-t ${
          isLight ? 'border-slate-100 bg-slate-50/80' : 'border-slate-800/80 bg-[#0B0F19]'
        }`}>
          <span className="text-[11px] text-slate-500">
            Changes are saved automatically to your device
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
