'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import {
  Upload,
  X,
  Check,
  Film,
  Image as ImageIcon,
  Play,
  Copy,
  ExternalLink,
  Sparkles,
  Layers,
  FolderOpen,
  Link as LinkIcon,
  Video,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  CustomMediaItem,
  MediaSection,
  DEFAULT_MEDIA_LIBRARY,
} from '@/data/academyData';
import {
  AcademyDataManager,
  subscribeAcademyData,
} from '@/lib/academyDataManager';

export interface MediaPreset {
  label: string;
  url: string;
  type?: 'image' | 'video';
  thumbnailUrl?: string;
  duration?: string;
}

export interface MediaSelectorProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  mediaType?: 'image' | 'video' | 'both';
  section?: MediaSection;
  presets?: MediaPreset[];
  thumbnailValue?: string;
  onThumbnailChange?: (url: string) => void;
  durationValue?: string;
  onDurationChange?: (dur: string) => void;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide';
  helperText?: string;
}

// Helper to determine YouTube embed URL
export function getYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/embed/')) return url;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
    );
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
    }
  } catch {}
  return null;
}

// Helper to detect if a URL is a video
export function isVideoMedia(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('vimeo.com') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.mov') ||
    url.startsWith('data:video/')
  );
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  label = 'Custom Media Asset',
  value,
  onChange,
  mediaType = 'both',
  section = 'all',
  presets = [],
  thumbnailValue,
  onThumbnailChange,
  durationValue,
  onDurationChange,
  aspectRatio = 'wide',
  helperText,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'url' | 'presets'>('upload');
  const [copied, setCopied] = useState(false);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to media library changes from AcademyDataManager
  const mediaLibrary: CustomMediaItem[] = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getMediaLibrary(),
    () => DEFAULT_MEDIA_LIBRARY
  );

  const isCurrentVideo = isVideoMedia(value);
  const ytEmbed = isCurrentVideo ? getYouTubeEmbed(value) : null;
  const isDirectVideo =
    isCurrentVideo &&
    (value.endsWith('.mp4') ||
      value.endsWith('.webm') ||
      value.endsWith('.ogg') ||
      value.startsWith('data:video/'));

  // Filter media library items matching section or type
  const matchingLibraryItems = mediaLibrary.filter((item) => {
    if (mediaType === 'image' && item.type !== 'image') return false;
    if (mediaType === 'video' && item.type !== 'video') return false;
    if (section && section !== 'all' && item.section !== 'all' && item.section !== section) {
      // Also allow general assets
      return item.section === 'general';
    }
    return true;
  });

  // Handle Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image exceeds 8MB. Please select a smaller photo or optimize it.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const dataUrl = event.target.result;
        onChange(dataUrl);

        // Also register into Media Library
        const newMediaItem: CustomMediaItem = {
          id: `media-upload-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: 'image',
          url: dataUrl,
          section: section || 'general',
          caption: `Uploaded image from device (${(file.size / 1024).toFixed(0)} KB)`,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          createdAt: new Date().toISOString(),
          isPreset: false,
        };
        AcademyDataManager.addMediaItem(newMediaItem);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      setUploadError(
        'Video file exceeds 30MB limit for direct browser upload. For larger match recordings, please upload to YouTube or Vimeo and paste the link in the "Direct URL" tab!'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const videoDataUrl = event.target.result;
        onChange(videoDataUrl);

        // Automatically create and register into Media Library
        const newMediaItem: CustomMediaItem = {
          id: `media-video-upload-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: 'video',
          url: videoDataUrl,
          section: section || 'general',
          caption: `Uploaded video from device (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          duration: 'Direct Upload',
          createdAt: new Date().toISOString(),
          isPreset: false,
        };
        AcademyDataManager.addMediaItem(newMediaItem);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!value) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
      {/* Top Label & Mode Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
            {mediaType === 'video' ? (
              <Film className="w-4 h-4 text-amber-600" />
            ) : mediaType === 'image' ? (
              <ImageIcon className="w-4 h-4 text-amber-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-600" />
            )}
            <span>{label}</span>
          </label>
          {helperText && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{helperText}</p>
          )}
        </div>

        {/* Media Type Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
            {mediaType === 'video'
              ? 'Video Asset'
              : mediaType === 'image'
              ? 'Photo Asset'
              : 'Photo or Video'}
          </span>
          {value && (
            <span
              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md text-white ${
                isCurrentVideo ? 'bg-purple-600' : 'bg-emerald-600'
              }`}
            >
              {isCurrentVideo ? 'Video Active' : 'Photo Active'}
            </span>
          )}
        </div>
      </div>

      {/* Main Preview Box & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Left: Visual Preview Canvas */}
        <div
          className={`md:col-span-5 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-xs flex items-center justify-center group ${
            aspectRatio === 'video'
              ? 'aspect-video'
              : aspectRatio === 'portrait'
              ? 'aspect-[3/4]'
              : aspectRatio === 'square'
              ? 'aspect-square'
              : 'aspect-[16/10]'
          }`}
          onMouseEnter={() => setIsHoveringPreview(true)}
          onMouseLeave={() => setIsHoveringPreview(false)}
        >
          {value ? (
            isCurrentVideo ? (
              ytEmbed ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={ytEmbed}
                    title="Video Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full h-full border-0 pointer-events-auto"
                  />
                </div>
              ) : isDirectVideo ? (
                <video
                  src={value}
                  controls
                  className="w-full h-full object-contain bg-black"
                  preload="metadata"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950 text-white">
                  <Film className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-amber-400">Video Link Linked</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px] mt-1 font-mono">
                    {value}
                  </span>
                </div>
              )
            ) : (
              <div className="w-full h-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Custom media preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-mono pointer-events-none">
                  <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    Live Photo
                  </span>
                </div>
              </div>
            )
          ) : (
            <div className="text-center p-4 space-y-1.5 text-slate-400">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                {mediaType === 'video' ? (
                  <Video className="w-4 h-4 text-amber-500" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="text-xs font-bold text-slate-300">No Custom Media Assigned</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Upload from device, pick from library, or paste URL
              </div>
            </div>
          )}
        </div>

        {/* Right: Controls & Tabs */}
        <div className="md:col-span-7 space-y-2.5">
          {/* Method Sub-Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Device</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'library'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Media Library ({matchingLibraryItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>URL / Embed</span>
            </button>

            {presets.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'presets'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presets ({presets.length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: DEVICE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {mediaType !== 'video' && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Photo (JPEG/PNG/WEBP)</span>
                  </button>
                )}

                {mediaType !== 'image' && (
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-300" />
                    <span>Upload Video (MP4/WebM)</span>
                  </button>
                )}

                {value && (
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Media</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleVideoUpload}
                className="hidden"
              />

              {uploadError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-500 font-mono">
                Uploaded media is automatically stored locally and registered into your central Media
                Hub with instant cloud sync.
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA LIBRARY PICKER */}
          {activeTab === 'library' && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-1 border-b border-slate-100">
                <span className="font-semibold">Select from Academy Media Assets:</span>
                <span className="font-mono text-[10px] text-amber-700">
                  {matchingLibraryItems.length} available
                </span>
              </div>

              {matchingLibraryItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No assets found in Media Library for this section. Upload one in the &quot;Upload Device&quot; tab!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {matchingLibraryItems.map((item) => {
                    const isSelected = value === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onChange(item.url);
                          if (item.thumbnailUrl && onThumbnailChange) {
                            onThumbnailChange(item.thumbnailUrl);
                          }
                          if (item.duration && onDurationChange) {
                            onDurationChange(item.duration);
                          }
                        }}
                        className={`group relative rounded-xl overflow-hidden border p-1 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              item.thumbnailUrl ||
                              (item.type === 'video'
                                ? 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80'
                                : item.url)
                            }
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          {item.type === 'video' && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-4 h-4 text-amber-400 fill-current" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded-md shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="mt-1 px-1">
                          <div className="text-[11px] font-bold text-slate-900 truncate">
                            {item.title}
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                            <span className="capitalize">{item.section}</span>
                            {item.duration && <span>{item.duration}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIRECT URL / VIDEO EMBED */}
          {activeTab === 'url' && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Direct Image URL or Video Link (YouTube / Vimeo / MP4):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://... or https://youtube.com/watch?v=..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
                />
                {value && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Sample Quick Fill Helpers */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                  Quick football test links:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onChange('https://www.youtube.com/watch?v=ScMzIvxBSi4')
                    }
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 cursor-pointer border border-slate-200"
                  >
                    YouTube Passing Rondos (2:15)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange('https://www.youtube.com/watch?v=kJQP7kiw5Fk')
                    }
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 cursor-pointer border border-slate-200"
                  >
                    YouTube Match Highlights (4:15)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                      )
                    }
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 cursor-pointer border border-slate-200"
                  >
                    Direct MP4 Stream
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESETS */}
          {activeTab === 'presets' && presets.length > 0 && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Choose a High-Definition Academy Preset:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {presets.map((preset, idx) => {
                  const isSelected = value === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(preset.url);
                        if (preset.thumbnailUrl && onThumbnailChange) {
                          onThumbnailChange(preset.thumbnailUrl);
                        }
                        if (preset.duration && onDurationChange) {
                          onDurationChange(preset.duration);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {preset.type === 'video' || isVideoMedia(preset.url) ? (
                          <Film className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{preset.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Secondary Inputs (e.g. Duration or Poster Thumbnail for videos) */}
          {isCurrentVideo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              {onDurationChange && (
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                    Duration Tag (e.g. 3:45)
                  </label>
                  <input
                    type="text"
                    value={durationValue || ''}
                    onChange={(e) => onDurationChange(e.target.value)}
                    placeholder="e.g. 2:30"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              )}
              {onThumbnailChange && (
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                    Poster Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={thumbnailValue || ''}
                    onChange={(e) => onThumbnailChange(e.target.value)}
                    placeholder="https://.../poster.jpg"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800 truncate"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
