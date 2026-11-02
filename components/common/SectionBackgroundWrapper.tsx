'use client';

import React from 'react';
import {
  SectionBackgroundConfig,
  GRADIENT_PRESETS,
} from '@/data/sectionBackgroundsData';

export interface SectionBackgroundWrapperProps {
  sectionId: string;
  config?: SectionBackgroundConfig;
  children: React.ReactNode;
  className?: string;
  id?: string;
  defaultTextMode?: 'light' | 'dark';
  onEditBackground?: (sectionId: string) => void;
  interactive?: boolean;
  hoverScale?: boolean;
  hoverBorderOpacity?: boolean;
}

export const SectionBackgroundWrapper: React.FC<SectionBackgroundWrapperProps> = ({
  sectionId,
  config,
  children,
  className = '',
  id,
  defaultTextMode = 'dark',
  onEditBackground,
  interactive = true,
  hoverScale = true,
  hoverBorderOpacity = true,
}) => {
  const type = config?.type || 'default';

  // Determine text mode
  let effectiveTextMode: 'light' | 'dark' = defaultTextMode;
  if (config?.textMode && config.textMode !== 'auto') {
    effectiveTextMode = config.textMode;
  } else if (type === 'gradient' && config?.gradientPreset) {
    const preset = GRADIENT_PRESETS[config.gradientPreset];
    if (preset) effectiveTextMode = preset.textMode;
  } else if (type === 'image') {
    // Images with dark overlay typically work best with light text
    const overlay = config?.overlayColor || 'black';
    if (overlay === 'white') effectiveTextMode = 'dark';
    else if ((config?.overlayOpacity ?? 50) >= 30) effectiveTextMode = 'light';
  }

  // Determine custom style for wrapper
  const wrapperStyle: React.CSSProperties = {};
  if (type === 'solid' && config?.color) {
    wrapperStyle.backgroundColor = config.color;
  } else if (type === 'gradient') {
    if (config?.customGradient) {
      wrapperStyle.background = config.customGradient;
    } else if (config?.gradientPreset && GRADIENT_PRESETS[config.gradientPreset]) {
      wrapperStyle.background = GRADIENT_PRESETS[config.gradientPreset].gradient;
    }
  }

  // Interactivity and hover flags
  const isInteractive = interactive && config?.interactiveHover !== false;
  const shouldScale = isInteractive && hoverScale && config?.hoverScale !== false;
  const shouldHoverBorder = isInteractive && hoverBorderOpacity && config?.hoverBorderOpacity !== false;

  // Overlay color class
  const getOverlayBgClass = (color?: string) => {
    switch (color) {
      case 'white':
        return 'bg-white';
      case 'slate':
        return 'bg-slate-950';
      case 'amber':
        return 'bg-amber-950';
      case 'emerald':
        return 'bg-emerald-950';
      case 'black':
      default:
        return 'bg-black';
    }
  };

  // Blur class for background image
  const getBlurClass = (blur?: string) => {
    switch (blur) {
      case 'sm':
        return 'blur-xs scale-105';
      case 'md':
        return 'blur-sm scale-110';
      case 'lg':
        return 'blur-md scale-110';
      default:
        return '';
    }
  };

  // Pattern SVG / CSS
  const renderPattern = () => {
    if (!config?.patternType || config.patternType === 'none') return null;
    const opacity = (config.patternOpacity ?? 30) / 100;

    switch (config.patternType) {
      case 'dots':
        return (
          <div
            className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"
            style={{ opacity }}
          />
        );
      case 'grid':
        return (
          <div
            className="absolute inset-0 pointer-events-none z-1 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] [background-size:32px_32px]"
            style={{ opacity }}
          />
        );
      case 'diagonal':
        return (
          <div
            className="absolute inset-0 pointer-events-none z-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(203,213,225,0.06)_10px,rgba(203,213,225,0.06)_20px)]"
            style={{ opacity }}
          />
        );
      case 'turf':
        return (
          <div
            className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(ellipse_at_top,#10b98115,transparent_70%)]"
            style={{ opacity }}
          />
        );
      case 'radial-spotlight':
        return (
          <div
            className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.18),transparent_60%)]"
            style={{ opacity }}
          />
        );
      default:
        return null;
    }
  };

  const hasCustomBackground = type !== 'default';

  return (
    <section
      id={id}
      data-section-id={sectionId}
      style={wrapperStyle}
      className={`group/section-wrapper relative overflow-hidden transition-all duration-300 ease-out transform-gpu will-change-transform ${
        shouldScale
          ? 'hover:scale-[1.002] sm:hover:scale-[1.003] active:scale-[1.001]'
          : ''
      } ${
        effectiveTextMode === 'light' ? 'text-white' : 'text-slate-900'
      } ${config?.customClass || ''} ${className}`}
    >
      {/* Custom Background Image Layer */}
      {type === 'image' && config?.imageUrl && (
        <div
          className={`absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-out group-hover/section-wrapper:scale-[1.02] ${getBlurClass(
            config.imageBlur
          )}`}
          style={{
            backgroundImage: `url('${config.imageUrl}')`,
            backgroundPosition: config.imagePosition || 'center',
            backgroundSize: config.imageSize || 'cover',
            backgroundRepeat: config.imageRepeat || 'no-repeat',
            backgroundAttachment: config.imageFixed ? 'fixed' : 'scroll',
          }}
        />
      )}

      {/* Overlay Layer for Image & Custom Gradients */}
      {hasCustomBackground &&
        config?.overlayColor &&
        config.overlayColor !== 'none' &&
        (config.overlayOpacity ?? 0) > 0 && (
          <div
            className={`absolute inset-0 z-1 pointer-events-none ${getOverlayBgClass(
              config.overlayColor
            )}`}
            style={{ opacity: (config.overlayOpacity ?? 40) / 100 }}
          />
        )}

      {/* Texture / Pattern Layer */}
      {renderPattern()}

      {/* Interactive Top Border with CSS Transition for Opacity on Hover */}
      {(config?.borderTop || shouldHoverBorder) && (
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px pointer-events-none z-20 transition-opacity duration-300 ease-out opacity-25 group-hover/section-wrapper:opacity-95"
          style={{
            backgroundColor:
              config?.borderColor ||
              (effectiveTextMode === 'light'
                ? 'rgba(255, 255, 255, 0.45)'
                : 'rgba(203, 213, 225, 0.85)'),
          }}
        />
      )}

      {/* Interactive Bottom Border with CSS Transition for Opacity on Hover */}
      {(config?.borderBottom || shouldHoverBorder) && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-px pointer-events-none z-20 transition-opacity duration-300 ease-out opacity-20 group-hover/section-wrapper:opacity-85"
          style={{
            backgroundColor:
              config?.borderColor ||
              (effectiveTextMode === 'light'
                ? 'rgba(255, 255, 255, 0.35)'
                : 'rgba(203, 213, 225, 0.75)'),
          }}
        />
      )}

      {/* Subtle Inset Perimeter Border Sheen with CSS Transition on Hover */}
      {shouldHoverBorder && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-20 transition-all duration-300 ease-out opacity-0 group-hover/section-wrapper:opacity-100 ring-1 ring-inset ring-slate-400/25 dark:ring-white/20"
        />
      )}

      {/* Admin Quick Edit Hover Button (If trigger provided) */}
      {onEditBackground && (
        <button
          type="button"
          onClick={() => onEditBackground(sectionId)}
          className="opacity-0 group-hover/section-wrapper:opacity-100 focus:opacity-100 hover:opacity-100 absolute top-3 right-3 z-30 px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-400 border border-slate-700/80 text-[10px] font-mono uppercase tracking-wider font-bold shadow-md hover:bg-slate-950 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
          title={`Customize background for ${sectionId}`}
        >
          <span>Edit BG</span>
        </button>
      )}

      {/* Main Section Content */}
      <div className="relative z-10 transition-transform duration-300 ease-out">{children}</div>
    </section>
  );
};
