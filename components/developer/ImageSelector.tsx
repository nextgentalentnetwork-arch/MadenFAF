'use client';

import React, { useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  presets: { label: string; url: string }[];
  label?: string;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  value,
  onChange,
  presets,
  label = 'Photograph / Image',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block font-bold text-slate-700 text-xs">{label}</label>

      {/* Preview and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
          {value ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 w-full">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:border-amber-500 font-mono"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>Upload Photo from Device</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Preset Selectors */}
      {presets.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
            Or choose a high-resolution preset:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-600'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
