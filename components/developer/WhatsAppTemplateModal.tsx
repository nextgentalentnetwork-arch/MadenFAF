'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AcademyRegistrationData,
  updateRegistrationStatus,
  ApplicantNotificationLog,
} from '@/lib/supabaseClient';
import {
  WhatsAppTemplate,
  WhatsAppTemplateCategory,
  TemplateVariables,
  DEFAULT_WHATSAPP_TEMPLATES,
  TEMPLATE_CATEGORIES,
  cleanWhatsAppPhoneNumber,
  generateWhatsAppUrl,
  renderWhatsAppTemplate,
  extractTemplateVariablesFromCandidate,
} from '@/lib/whatsappTemplates';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Send,
  ExternalLink,
  Search,
  RotateCcw,
  User,
  Calendar,
  Clock,
  MapPin,
  Award,
  AlertTriangle,
  FileText,
  Phone,
  Sparkles,
  ShieldCheck,
  Edit3,
  Eye,
  CheckCircle2,
  ChevronRight,
  Info,
  CheckCheck,
} from 'lucide-react';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: AcademyRegistrationData | null;
  allCandidates?: AcademyRegistrationData[];
  defaultTemplateId?: string;
  onDispatched?: (candidateBookingRef: string, templateId: string, message: string) => void;
  onNotify?: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  allCandidates = [],
  defaultTemplateId = 'evaluation_scheduled',
  onDispatched,
  onNotify,
}) => {
  // Active Selected Candidate Context
  const [selectedCandidate, setSelectedCandidate] = useState<AcademyRegistrationData | null>(
    candidate || (allCandidates.length > 0 ? allCandidates[0] : null)
  );

  // Search and Category Filtering
  const [selectedCategory, setSelectedCategory] = useState<WhatsAppTemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Template
  const [activeTemplateId, setActiveTemplateId] = useState<string>(defaultTemplateId);

  // Active Variables State
  const [variables, setVariables] = useState<TemplateVariables>(() =>
    extractTemplateVariablesFromCandidate(candidate || (allCandidates.length > 0 ? allCandidates[0] : null))
  );

  // Target Phone Number
  const [targetPhone, setTargetPhone] = useState<string>(() => {
    return candidate?.phone || (allCandidates.length > 0 ? allCandidates[0].phone : '+91 98302 45891');
  });

  // Custom Edited Text Override
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'variables' | 'editor'>('preview');
  const [isRecordingLog, setIsRecordingLog] = useState<boolean>(false);

  // Active Template Object
  const currentTemplate = useMemo(() => {
    return (
      DEFAULT_WHATSAPP_TEMPLATES.find((t) => t.id === activeTemplateId) ||
      DEFAULT_WHATSAPP_TEMPLATES[0]
    );
  }, [activeTemplateId]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return DEFAULT_WHATSAPP_TEMPLATES.filter((tpl) => {
      const matchesCategory =
        selectedCategory === 'all' || tpl.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tpl.title.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.badge.toLowerCase().includes(query) ||
        tpl.suggestedTags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Current Rendered Text
  const renderedMessage = useMemo(() => {
    if (isEditingCustom && customText) {
      return customText;
    }
    return renderWhatsAppTemplate(currentTemplate.templateText, variables as unknown as Record<string, string | number | undefined>);
  }, [currentTemplate, variables, isEditingCustom, customText]);

  // When changing template, reset custom edits if not explicitly saved
  const handleSelectTemplate = (tpl: WhatsAppTemplate) => {
    setActiveTemplateId(tpl.id);
    setIsEditingCustom(false);
    setCustomText('');
  };

  // Change Candidate Selection
  const handleCandidateChange = (bookingRef: string) => {
    const found = allCandidates.find((c) => c.bookingRef === bookingRef);
    if (found) {
      setSelectedCandidate(found);
      setTargetPhone(found.phone || '');
      setVariables(extractTemplateVariablesFromCandidate(found));
      setIsEditingCustom(false);
      setCustomText('');
    }
  };

  // Update a single variable
  const handleVariableChange = (key: keyof TemplateVariables, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Copy to clipboard
  const handleCopyMessage = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(renderedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
        if (onNotify) {
          onNotify({
            type: 'success',
            text: `WhatsApp template "${currentTemplate.title}" copied to clipboard!`,
          });
        }
      }
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = renderedMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Phone Validation
  const phoneValidation = useMemo(() => {
    return cleanWhatsAppPhoneNumber(targetPhone);
  }, [targetPhone]);

  // Launch WhatsApp Web or App
  const handleOpenWhatsApp = async (recordLog: boolean = true) => {
    if (!phoneValidation.isValid) {
      if (onNotify) {
        onNotify({
          type: 'error',
          text: 'Please provide a valid recipient phone number with country code.',
        });
      }
      return;
    }

    const waUrl = generateWhatsAppUrl(phoneValidation.cleanPhone, renderedMessage);

    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (recordLog && selectedCandidate) {
      setIsRecordingLog(true);
      const newLog: ApplicantNotificationLog = {
        id: `wa-tpl-${Date.now()}`,
        sentAt: new Date().toISOString(),
        channel: 'sms',
        status: `WhatsApp: ${currentTemplate.title}`,
        message: `Dispatched WhatsApp Template "${currentTemplate.title}" to ${phoneValidation.displayFormatted}. Reference: ${selectedCandidate.bookingRef}`,
      };

      const updatedCandidate: AcademyRegistrationData = {
        ...selectedCandidate,
        notificationLog: [newLog, ...(selectedCandidate.notificationLog || [])],
        scheduledTrialDetails: {
          date: variables.trialDate || selectedCandidate.scheduledTrialDetails?.date || 'May 16, 2026',
          time: variables.trialTime || selectedCandidate.scheduledTrialDetails?.time || '07:30 AM – 09:30 AM',
          venue: variables.venue || selectedCandidate.scheduledTrialDetails?.venue || 'Central Ground Complex, Gayeshpur',
          evaluator: variables.evaluator || selectedCandidate.scheduledTrialDetails?.evaluator || 'Coach Bapi Roy',
          reportingInstructions: variables.reportingInstructions || selectedCandidate.scheduledTrialDetails?.reportingInstructions || '',
        },
      };

      try {
        await updateRegistrationStatus(
          selectedCandidate.bookingRef,
          selectedCandidate.status || 'trial_scheduled',
          updatedCandidate
        );
      } catch (err) {
        console.warn('Could not record notification log:', err);
      }

      setIsRecordingLog(false);

      if (onDispatched) {
        onDispatched(selectedCandidate.bookingRef, currentTemplate.id, renderedMessage);
      }

      if (onNotify) {
        onNotify({
          type: 'success',
          text: `Opened WhatsApp for ${selectedCandidate.playerName} & saved dispatch log.`,
        });
      }
    } else if (onNotify) {
      onNotify({
        type: 'success',
        text: `Opened WhatsApp deep link for ${phoneValidation.displayFormatted}.`,
      });
    }
  };

  // Helper to insert a variable chip in custom editor
  const insertVariableChip = (token: string) => {
    const textToInsert = `{{${token}}}`;
    setCustomText((prev) => (prev ? `${prev} ${textToInsert}` : textToInsert));
    setIsEditingCustom(true);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-template-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="whatsapp-template-title" className="text-base sm:text-lg font-black uppercase tracking-wide">
                  Official WhatsApp Message Templates Library
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                  {DEFAULT_WHATSAPP_TEMPLATES.length} Templates
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Pre-configured communications for evaluations, selections, postponements, and trial operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Candidate Context Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Target Applicant:</span>
            </div>

            {allCandidates.length > 0 ? (
              <select
                value={selectedCandidate?.bookingRef || ''}
                onChange={(e) => handleCandidateChange(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                {allCandidates.map((c) => (
                  <option key={c.bookingRef} value={c.bookingRef}>
                    {c.playerName} ({c.bookingRef}) – {c.phone}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {selectedCandidate?.playerName || 'Preview Sample Candidate'} ({selectedCandidate?.bookingRef || 'MFA-TR-2026-8942'})
              </span>
            )}

            <span className="text-slate-400 hidden sm:inline">|</span>

            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="+91 98302 45891"
                className="w-36 px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800"
                title="Target WhatsApp Phone Number"
              />
              {phoneValidation.isValid ? (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Valid ({phoneValidation.displayFormatted})
                </span>
              ) : (
                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Invalid Number
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted WhatsApp Direct Link (wa.me)</span>
          </div>
        </div>

        {/* Modal Main Body Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Template Library Selector (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/50 min-h-0">
            {/* Search & Filter Header */}
            <div className="p-3 border-b border-slate-200 space-y-2.5 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by title, tag, or action..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No templates match &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredTemplates.map((tpl) => {
                  const isSelected = tpl.id === activeTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tpl.badgeColor.bg} ${tpl.badgeColor.text} ${tpl.badgeColor.border}`}
                        >
                          {tpl.badge}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                        {tpl.title}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>

                      <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100">
                        {tpl.suggestedTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Template Preview & Dynamic Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-slate-100/60 min-h-0">
            {/* Template Header & Sub-Tabs */}
            <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-slate-900">
                    {currentTemplate.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentTemplate.badgeColor.bg} ${currentTemplate.badgeColor.text} ${currentTemplate.badgeColor.border}`}
                  >
                    {currentTemplate.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {currentTemplate.description}
                </p>
              </div>

              {/* Mode switch */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'preview'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('variables')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'variables'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Variables</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingCustom) {
                      setCustomText(renderWhatsAppTemplate(currentTemplate.templateText, variables as unknown as Record<string, string | number | undefined>));
                      setIsEditingCustom(true);
                    }
                    setActiveTab('editor');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'editor'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Live Edit</span>
                </button>
              </div>
            </div>

            {/* Content Area Based on Tab */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {activeTab === 'preview' && (
                <div className="space-y-3">
                  {/* WhatsApp Phone Mock Container */}
                  <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-[#efeae2] relative">
                    {/* Authentic WhatsApp Chat Header */}
                    <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-500 flex items-center justify-center font-bold text-xs uppercase">
                          {variables.candidateName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-none">
                            {variables.parentName || variables.candidateName}
                          </div>
                          <div className="text-[10px] text-emerald-200 mt-0.5">
                            {phoneValidation.displayFormatted}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200">
                        MADEN Foundation
                      </div>
                    </div>

                    {/* Chat Bubble Body */}
                    <div className="p-3.5 sm:p-4 space-y-3">
                      {/* Security notice */}
                      <div className="bg-[#ffeecd] border border-amber-300/60 rounded-lg p-2 text-center text-[10px] text-amber-900 max-w-sm mx-auto shadow-2xs flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Messages and calls are end-to-end encrypted. Official Academy dispatch.</span>
                      </div>

                      {/* Outgoing Message Bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[92%] bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-xs p-3.5 shadow-xs border border-emerald-200 text-xs leading-relaxed space-y-2 select-text">
                          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed break-words">
                            {renderedMessage}
                          </pre>

                          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 pt-1">
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <CheckCheck className="w-3.5 h-3.5 text-sky-600 inline" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preview Helper */}
                  <div className="max-w-xl mx-auto flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>
                      Character count: <strong className="text-slate-800">{renderedMessage.length}</strong> chars ·{' '}
                      <strong className="text-slate-800">{renderedMessage.split(/\s+/).filter(Boolean).length}</strong> words
                    </span>
                    {isEditingCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCustom(false);
                          setCustomText('');
                        }}
                        className="text-amber-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert Custom Edits</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'variables' && (
                <div className="space-y-4 max-w-2xl mx-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h5 className="font-bold text-xs uppercase text-slate-800">
                        Customize Template Dynamic Variables
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Values will automatically populate placeholders like <code>{`{{candidateName}}`}</code> or <code>{`{{trialDate}}`}</code>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVariables(extractTemplateVariablesFromCandidate(selectedCandidate))}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Dossier Defaults</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Candidate Name ({`{{candidateName}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.candidateName}
                        onChange={(e) => handleVariableChange('candidateName', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Parent / Guardian Name ({`{{parentName}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.parentName}
                        onChange={(e) => handleVariableChange('parentName', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Booking / Application ID ({`{{applicationId}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.applicationId}
                        onChange={(e) => handleVariableChange('applicationId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Playing Position ({`{{position}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.position}
                        onChange={(e) => handleVariableChange('position', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Trial Date ({`{{trialDate}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.trialDate}
                        onChange={(e) => handleVariableChange('trialDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Reporting Time ({`{{trialTime}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.trialTime}
                        onChange={(e) => handleVariableChange('trialTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Ground / Venue Address ({`{{venue}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.venue}
                        onChange={(e) => handleVariableChange('venue', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Evaluator Coach ({`{{evaluator}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.evaluator}
                        onChange={(e) => handleVariableChange('evaluator', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Selected Squad Tier ({`{{squadBatch}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.squadBatch || ''}
                        onChange={(e) => handleVariableChange('squadBatch', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    {/* Specific Postponement fields */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-amber-800 mb-1">
                        Rescheduled Date ({`{{rescheduledDate}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.rescheduledDate || ''}
                        onChange={(e) => handleVariableChange('rescheduledDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-amber-50/60 border border-amber-300 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-amber-800 mb-1">
                        Rescheduled Time ({`{{rescheduledTime}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.rescheduledTime || ''}
                        onChange={(e) => handleVariableChange('rescheduledTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-amber-50/60 border border-amber-300 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-amber-800 mb-1">
                        Postponement Reason ({`{{rescheduledReason}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.rescheduledReason || ''}
                        onChange={(e) => handleVariableChange('rescheduledReason', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-amber-50/60 border border-amber-300 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Reporting Instructions ({`{{reportingInstructions}}`})
                      </label>
                      <textarea
                        rows={2}
                        value={variables.reportingInstructions}
                        onChange={(e) => handleVariableChange('reportingInstructions', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Special Remarks / Note ({`{{additionalNotes}}`})
                      </label>
                      <input
                        type="text"
                        value={variables.additionalNotes || ''}
                        onChange={(e) => handleVariableChange('additionalNotes', e.target.value)}
                        placeholder="Internal notes or personalized tips for this candidate..."
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Formatted WhatsApp Message</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'editor' && (
                <div className="space-y-3 max-w-2xl mx-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h5 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Live Customized Message Editor</span>
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Directly adjust wording, add personalized praise, or tailor specific time slots before sending.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomText(renderWhatsAppTemplate(currentTemplate.templateText, variables as unknown as Record<string, string | number | undefined>));
                        setIsEditingCustom(true);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reload Rendered Content</span>
                    </button>
                  </div>

                  {/* Variable Injection Chips */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                      Quick Insert Dynamic Tokens:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        'candidateName',
                        'applicationId',
                        'trialDate',
                        'trialTime',
                        'venue',
                        'evaluator',
                        'rescheduledDate',
                        'squadBatch',
                        'admissionDeadline',
                        'contactPhone',
                      ].map((token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => insertVariableChip(token)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[10px] font-mono cursor-pointer transition-colors"
                        >
                          +{`{{${token}}}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value);
                      setIsEditingCustom(true);
                    }}
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-900 leading-relaxed"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {customText.length} characters · {customText.split(/\s+/).filter(Boolean).length} words
                    </span>

                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview in Chat Bubble</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions Toolbar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy formatted WhatsApp text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Template Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(true)}
                  disabled={!phoneValidation.isValid || isRecordingLog}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  title="Open in WhatsApp Web / App & Record in Candidate History"
                >
                  <Send className="w-4 h-4 text-emerald-100" />
                  <span>Send via WhatsApp ({phoneValidation.displayFormatted})</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
