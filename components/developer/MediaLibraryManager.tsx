'use client';

import React, { useState, useRef, useSyncExternalStore } from 'react';
import {
  CustomMediaItem,
  MediaSection,
  DEFAULT_MEDIA_LIBRARY,
  Program,
  Campus,
  CoachStaffMember,
  MatchFixture,
  AcademyEvent,
  NewsStory,
} from '@/data/academyData';
import {
  AcademyDataManager,
  subscribeAcademyData,
} from '@/lib/academyDataManager';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { getYouTubeEmbed, isVideoMedia } from './MediaSelector';
import {
  Film,
  Image as ImageIcon,
  Plus,
  Upload,
  Search,
  Filter,
  Check,
  Copy,
  Trash2,
  Play,
  Eye,
  ExternalLink,
  Layers,
  Sparkles,
  Save,
  ArrowRight,
  Send,
  Video,
  X,
  Clock,
  Shield,
  Building,
  Users,
  Trophy,
  Calendar,
  Newspaper,
  Star,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

interface MediaLibraryManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const MediaLibraryManager: React.FC<MediaLibraryManagerProps> = ({
  onNotify,
}) => {
  // Subscribe to live Media Library
  const mediaItems: CustomMediaItem[] = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getMediaLibrary(),
    () => DEFAULT_MEDIA_LIBRARY
  );

  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [sectionFilter, setSectionFilter] = useState<MediaSection>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomMediaItem | null>(null);
  const [assignTarget, setAssignTarget] = useState<CustomMediaItem | null>(null);
  const [previewMedia, setPreviewMedia] = useState<CustomMediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Media Form States
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSection, setNewSection] = useState<MediaSection>('general');
  const [newCaption, setNewCaption] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Quick Assign Selection
  const [assignDestination, setAssignDestination] = useState<
    | 'hero-bg'
    | 'hero-video'
    | 'campus'
    | 'coach'
    | 'program'
    | 'fixture'
    | 'event'
    | 'news'
    | 'pillar'
  >('hero-bg');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');

  // Count stats
  const totalAssets = mediaItems.length;
  const photoCount = mediaItems.filter((m) => m.type === 'image').length;
  const videoCount = mediaItems.filter((m) => m.type === 'video').length;

  // Filtered Assets
  const filteredAssets = mediaItems.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (sectionFilter !== 'all' && item.section !== sectionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCaption = (item.caption || '').toLowerCase().includes(q);
      const matchSection = item.section.toLowerCase().includes(q);
      if (!matchTitle && !matchCaption && !matchSection) return false;
    }
    return true;
  });

  const handleCopy = (item: CustomMediaItem) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
      onNotify({
        type: 'success',
        text: `Copied media URL for "${item.title}" to clipboard!`,
      });
    }
  };

  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      onNotify({
        type: 'error',
        text: 'Image exceeds 8MB. Please choose a smaller photo.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const dataUrl = event.target.result;
        setNewUrl(dataUrl);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeviceVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      onNotify({
        type: 'error',
        text: 'Video file exceeds 30MB limit. For large recordings, upload to YouTube/Vimeo and paste link!',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const videoDataUrl = event.target.result;
        setNewUrl(videoDataUrl);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        setNewDuration('Direct Upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewAsset = (type: 'image' | 'video') => {
    if (!newUrl.trim()) {
      onNotify({ type: 'error', text: 'Please upload a file or paste a valid media URL.' });
      return;
    }

    const newItem: CustomMediaItem = {
      id: `media-${Date.now()}`,
      title: newTitle.trim() || (type === 'video' ? 'Custom Video Asset' : 'Custom Photo Asset'),
      type,
      url: newUrl.trim(),
      thumbnailUrl: newThumbnail.trim() || undefined,
      section: newSection,
      caption: newCaption.trim() || undefined,
      duration: newDuration.trim() || undefined,
      createdAt: new Date().toISOString(),
      isPreset: false,
    };

    AcademyDataManager.addMediaItem(newItem);
    onNotify({
      type: 'success',
      text: `Added new ${type === 'video' ? 'Video' : 'Photo'} asset "${newItem.title}" to Media Hub!`,
    });

    // Reset form
    setNewTitle('');
    setNewUrl('');
    setNewCaption('');
    setNewDuration('');
    setNewThumbnail('');
    setIsAddPhotoOpen(false);
    setIsAddVideoOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteMediaItem(deleteTarget.id);
    onNotify({
      type: 'success',
      text: `Removed media asset "${deleteTarget.title}" from library.`,
    });
    setDeleteTarget(null);
  };

  // Quick Assign Action to Sections
  const handleExecuteAssign = () => {
    if (!assignTarget) return;

    if (assignDestination === 'hero-bg') {
      const hero = AcademyDataManager.getHeroConfig();
      AcademyDataManager.saveHeroConfig({ ...hero, backgroundImage: assignTarget.url });
      onNotify({
        type: 'success',
        text: `Assigned "${assignTarget.title}" as Hero pitch background!`,
      });
    } else if (assignDestination === 'hero-video') {
      const hero = AcademyDataManager.getHeroConfig();
      AcademyDataManager.saveHeroConfig({
        ...hero,
        videoEmbedUrl: assignTarget.url,
        videoTitle: assignTarget.title,
        videoPosterImage: assignTarget.thumbnailUrl || hero.videoPosterImage,
      });
      onNotify({
        type: 'success',
        text: `Assigned "${assignTarget.title}" as Hero Showcase Video!`,
      });
    } else if (assignDestination === 'campus') {
      if (!selectedEntityId) {
        onNotify({ type: 'error', text: 'Please select a campus to assign.' });
        return;
      }
      if (assignTarget.type === 'video') {
        AcademyDataManager.updateCampus(selectedEntityId, { videoUrl: assignTarget.url });
      } else {
        AcademyDataManager.updateCampus(selectedEntityId, { image: assignTarget.url });
      }
      onNotify({
        type: 'success',
        text: `Assigned media to campus "${selectedEntityId}"!`,
      });
    } else if (assignDestination === 'coach') {
      if (!selectedEntityId) {
        onNotify({ type: 'error', text: 'Please select a coach to assign.' });
        return;
      }
      if (assignTarget.type === 'video') {
        AcademyDataManager.updateCoach(selectedEntityId, { videoUrl: assignTarget.url });
      } else {
        AcademyDataManager.updateCoach(selectedEntityId, { image: assignTarget.url });
      }
      onNotify({
        type: 'success',
        text: `Assigned media to coach "${selectedEntityId}"!`,
      });
    } else if (assignDestination === 'program') {
      if (!selectedEntityId) {
        onNotify({ type: 'error', text: 'Please select a program to assign.' });
        return;
      }
      if (assignTarget.type === 'video') {
        AcademyDataManager.updateProgram(selectedEntityId, { videoUrl: assignTarget.url });
      } else {
        AcademyDataManager.updateProgram(selectedEntityId, { image: assignTarget.url });
      }
      onNotify({
        type: 'success',
        text: `Assigned media to program "${selectedEntityId}"!`,
      });
    } else if (assignDestination === 'fixture') {
      if (!selectedEntityId) {
        onNotify({ type: 'error', text: 'Please select a fixture to assign.' });
        return;
      }
      if (assignTarget.type === 'video') {
        AcademyDataManager.updateFixture(selectedEntityId, {
          videoHighlightUrl: assignTarget.url,
        });
      } else {
        AcademyDataManager.updateFixture(selectedEntityId, { matchPhoto: assignTarget.url });
      }
      onNotify({
        type: 'success',
        text: `Assigned media to match fixture "${selectedEntityId}"!`,
      });
    } else if (assignDestination === 'event') {
      if (!selectedEntityId) {
        onNotify({ type: 'error', text: 'Please select an event to assign.' });
        return;
      }
      if (assignTarget.type === 'video') {
        AcademyDataManager.updateEvent(selectedEntityId, { videoUrl: assignTarget.url });
      } else {
        AcademyDataManager.updateEvent(selectedEntityId, { bannerImage: assignTarget.url });
      }
      onNotify({
        type: 'success',
        text: `Assigned media to event "${selectedEntityId}"!`,
      });
    } else if (assignDestination === 'news') {
      if (!selectedEntityId) {
        onNotify({ type: 'error', text: 'Please select a news story to assign.' });
        return;
      }
      if (assignTarget.type === 'video') {
        AcademyDataManager.updateNews(selectedEntityId, { videoUrl: assignTarget.url });
      } else {
        AcademyDataManager.updateNews(selectedEntityId, { image: assignTarget.url });
      }
      onNotify({
        type: 'success',
        text: `Assigned media to news story "${selectedEntityId}"!`,
      });
    } else if (assignDestination === 'pillar') {
      const pillarKey = selectedEntityId || 'train';
      if (assignTarget.type === 'video') {
        AcademyDataManager.updateStoryPillarMedia(pillarKey, { videoUrl: assignTarget.url });
      } else {
        AcademyDataManager.updateStoryPillarMedia(pillarKey, { image: assignTarget.url });
      }
      onNotify({
        type: 'success',
        text: `Assigned media to Storytelling Pillar "${pillarKey.toUpperCase()}"!`,
      });
    }

    setAssignTarget(null);
  };

  // Section list
  const sectionsList: { id: MediaSection; label: string }[] = [
    { id: 'all', label: 'All Sections' },
    { id: 'hero', label: 'Hero Showcase' },
    { id: 'programs', label: 'Programs' },
    { id: 'campuses', label: 'Campuses' },
    { id: 'coaches', label: 'Coaches' },
    { id: 'fixtures', label: 'Match Centre' },
    { id: 'events', label: 'Events & Camps' },
    { id: 'news', label: 'News Stories' },
    { id: 'storytelling', label: 'Academy Pillars' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'general', label: 'General' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Film className="w-3.5 h-3.5 text-amber-600" />
            <span>Central Media Hub & Assets</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
            CUSTOM PHOTOS & VIDEOS MANAGEMENT
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Upload custom photographs from your device or add custom video drills, matches, and
            facility tours across all academy sections. Changes sync to cloud and reflect live on the
            site.
          </p>
        </div>

        {/* Action Buttons & Stat Counter */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-mono">
            <div className="px-2.5 py-1 bg-white rounded-xl shadow-2xs font-bold text-slate-900">
              {totalAssets} Total
            </div>
            <div className="flex items-center gap-1 text-slate-600 px-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{photoCount}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 px-1">
              <Film className="w-3.5 h-3.5 text-purple-600" />
              <span>{videoCount}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setNewTitle('');
              setNewUrl('');
              setNewCaption('');
              setIsAddPhotoOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => {
              setNewTitle('');
              setNewUrl('');
              setNewCaption('');
              setNewDuration('');
              setIsAddVideoOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Add / Upload Video</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Media ({totalAssets})
          </button>
          <button
            onClick={() => setTypeFilter('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              typeFilter === 'image'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Photos Only ({photoCount})</span>
          </button>
          <button
            onClick={() => setTypeFilter('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              typeFilter === 'video'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-purple-600" />
            <span>Videos Only ({videoCount})</span>
          </button>
        </div>

        {/* Section Select & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value as MediaSection)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
          >
            {sectionsList.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, caption, section..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Media Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters or click &quot;Upload Photo&quot; or &quot;Add Video&quot; above to add
            custom media.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isVideo = asset.type === 'video' || isVideoMedia(asset.url);
            const isCopied = copiedId === asset.id;

            return (
              <div
                key={asset.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail / Video Preview Area */}
                  <div
                    onClick={() => setPreviewMedia(asset)}
                    className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer group-hover:opacity-95"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        asset.thumbnailUrl ||
                        (isVideo
                          ? 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'
                          : asset.url)
                      }
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    {/* Badge top-left */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded-md text-white shadow-xs ${
                          isVideo ? 'bg-purple-600' : 'bg-emerald-600'
                        }`}
                      >
                        {isVideo ? 'VIDEO' : 'PHOTO'}
                      </span>
                      {asset.duration && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-black/70 text-slate-200 backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-400" />
                          <span>{asset.duration}</span>
                        </span>
                      )}
                    </div>

                    {/* Center Play Icon if Video */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Section Tag bottom-left */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-mono pointer-events-none">
                      <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs uppercase font-bold text-amber-300 truncate max-w-[150px]">
                        {asset.section}
                      </span>
                      <span className="text-slate-300 text-[9px]">{asset.fileSize || ''}</span>
                    </div>
                  </div>

                  {/* Metadata Body */}
                  <div className="p-3.5 space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {asset.title}
                    </h4>
                    {asset.caption && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {asset.caption}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(asset)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Copy Media URL"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAssignTarget(asset);
                        setAssignDestination(
                          asset.type === 'video' ? 'hero-video' : 'hero-bg'
                        );
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Assign this media asset to a section or component"
                    >
                      <Send className="w-3 h-3 text-amber-600" />
                      <span>Assign</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(asset)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Full Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(asset)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- MODAL 1: ADD PHOTO ----------------- */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>Upload / Add Custom Photo</span>
              </h3>
              <button
                onClick={() => setIsAddPhotoOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. U15 Match Action vs East Bengal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Section Category</label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as MediaSection)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-semibold cursor-pointer"
                >
                  {sectionsList
                    .filter((s) => s.id !== 'all')
                    .map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.label}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Choose Device File or Paste URL</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload Device File</span>
                  </button>
                  <span className="text-slate-400 font-mono text-[11px]">or paste link:</span>
                </div>
                <input
                  ref={photoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDevicePhotoUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or data:image/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono"
                />
              </div>

              {newUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption / Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Notes about this photograph, photographer, or campus..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNewAsset('image')}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase cursor-pointer shadow-xs"
                >
                  Save Photo Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 2: ADD VIDEO ----------------- */}
      {isAddVideoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-600" />
                <span>Upload / Add Custom Video</span>
              </h3>
              <button
                onClick={() => setIsAddVideoOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Video Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. U13 Passing Triangle Drill Demonstration"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Section Category</label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as MediaSection)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-semibold cursor-pointer"
                >
                  {sectionsList
                    .filter((s) => s.id !== 'all')
                    .map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.label}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Video Source (Upload MP4 or Paste YouTube Link)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-300" />
                    <span>Upload MP4 / WebM File</span>
                  </button>
                  <span className="text-slate-400 font-mono text-[11px]">or paste link:</span>
                </div>
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleDeviceVideoUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://.../match.mp4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Video Duration Tag</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 3:45"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Poster Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={newThumbnail}
                    onChange={(e) => setNewThumbnail(e.target.value)}
                    placeholder="https://.../poster.jpg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 truncate"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption / Synopsis</label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Explain what the video showcases (drills, coach analysis, matchday moments)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVideoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNewAsset('video')}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase cursor-pointer shadow-xs"
                >
                  Save Video Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 3: QUICK ASSIGN MODAL ----------------- */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">
                  Quick Assign Action
                </span>
                <h3 className="text-base font-black uppercase text-slate-900 truncate max-w-xs">
                  Assign: {assignTarget.title}
                </h3>
              </div>
              <button
                onClick={() => setAssignTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Select Destination Component / Section:</label>
              <select
                value={assignDestination}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setAssignDestination(val);
                  setSelectedEntityId('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold bg-slate-50 cursor-pointer"
              >
                <option value="hero-bg">Hero Pitch Background (Photo)</option>
                <option value="hero-video">Hero Showcase Cinema Documentary (Video)</option>
                <option value="campus">Campus Network (Campus Tour Video or Image)</option>
                <option value="coach">Coaching Staff (Coach Drill Video or Portrait)</option>
                <option value="program">Football Programs (Drill Video or Banner)</option>
                <option value="fixture">Match Centre (Match Highlights Video or Photo)</option>
                <option value="event">Camps & Events (Event Teaser Video or Banner)</option>
                <option value="news">News Stories (Video Report or Article Cover)</option>
                <option value="pillar">Academy Pillar (Train, Learn, Compete, Perform...)</option>
              </select>

              {/* Dynamic Entity Selectors */}
              {assignDestination === 'campus' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choose Campus:</label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="">-- Select Campus --</option>
                    {AcademyDataManager.getCampuses().map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignDestination === 'coach' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choose Coach:</label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="">-- Select Coach --</option>
                    {AcademyDataManager.getCoaches().map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignDestination === 'program' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choose Program:</label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="">-- Select Program --</option>
                    {AcademyDataManager.getPrograms().map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.ageGroup})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignDestination === 'fixture' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choose Match Fixture:</label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="">-- Select Fixture --</option>
                    {AcademyDataManager.getFixtures().map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.homeTeam} vs {f.awayTeam} ({f.date})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignDestination === 'event' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choose Event:</label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="">-- Select Event --</option>
                    {AcademyDataManager.getEvents().map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignDestination === 'news' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choose News Story:</label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="">-- Select News Story --</option>
                    {AcademyDataManager.getNews().map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignDestination === 'pillar' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choose Pillar:</label>
                  <select
                    value={selectedEntityId || 'train'}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="train">01 - TRAIN: High Ball Repetition</option>
                    <option value="learn">02 - LEARN: Tactical Scan Frequency</option>
                    <option value="compete">03 - COMPETE: Official Matches</option>
                    <option value="perform">04 - PERFORM: Speed & Laser Timing</option>
                    <option value="grow">05 - GROW: Character & Values</option>
                    <option value="serve">06 - SERVE: 30% Scholarships</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAssign}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Media Assignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 4: FULL PREVIEW LIGHTBOX / PLAYER ----------------- */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-black text-white ${
                    previewMedia.type === 'video' ? 'bg-purple-600' : 'bg-emerald-600'
                  }`}
                >
                  {previewMedia.type === 'video' ? 'VIDEO' : 'PHOTO'}
                </div>
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {previewMedia.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {previewMedia.type === 'video' || isVideoMedia(previewMedia.url) ? (
                getYouTubeEmbed(previewMedia.url) ? (
                  <iframe
                    src={getYouTubeEmbed(previewMedia.url)!}
                    title={previewMedia.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={previewMedia.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {previewMedia.caption && (
              <div className="p-3.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
                {previewMedia.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Media Asset"
        message="Are you sure you want to remove this media asset from the Media Library?"
        itemName={deleteTarget?.title || ''}
        confirmLabel="Remove Media"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
