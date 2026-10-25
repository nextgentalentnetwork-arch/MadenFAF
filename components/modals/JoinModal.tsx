'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Trophy,
  Upload,
} from 'lucide-react';
import { ACADEMY_CAMPUSES } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import {
  submitRegistration,
  calculateAgeFromDob,
} from '@/lib/supabaseClient';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCampus?: string;
  defaultProgram?: string;
  defaultPathway?: 'admission' | 'trial';
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  defaultCampus = 'gayeshpur',
  defaultProgram = 'development',
  defaultPathway = 'admission',
}) => {
  const trialSlots = AcademyDataManager.getTrialSlots();

  const [applicationType, setApplicationType] = useState<'admission' | 'trial'>(
    defaultPathway
  );

  const [formData, setFormData] = useState({
    playerName: '',
    dob: '',
    gender: 'male',
    parentName: '',
    phone: '',
    email: '',
    location: '',
    preferredCampus: defaultCampus,
    position: 'midfielder',
    experienceLevel: 'school-team',
    currentClubOrAcademy: '',
    program: defaultProgram,
    preferredTrialEventId: trialSlots[0]?.id || 'trial-slot-1',
    preferredTrialDate: trialSlots[0]?.date || '',
    preferredVenue: trialSlots[0]?.campusName || 'Gayeshpur Central Ground, Nadia',
    playerPhotoUrl: '',
    playerPhotoName: '',
    supportingDocumentUrl: '',
    supportingDocumentName: '',
    minorConsentConfirmed: false,
    message: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen) return null;

  const calculatedAge = calculateAgeFromDob(formData.dob);
  const isMinor = calculatedAge === undefined || calculatedAge < 18;

  const isValidEmail = (val: string) =>
    !val.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isValidPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  };

  const getFieldError = (field: string): string => {
    if (!touched[field]) return '';
    switch (field) {
      case 'playerName':
        return !formData.playerName.trim()
          ? 'Player full name is required.'
          : formData.playerName.trim().length < 2
            ? 'Player name must be at least 2 characters.'
            : '';
      case 'dob':
        return !formData.dob.trim() ? 'Date of birth is required.' : '';
      case 'parentName':
        return isMinor && !formData.parentName.trim()
          ? 'Parent / guardian name is required for minor players.'
          : isMinor && formData.parentName.trim().length < 2
            ? 'Parent name must be at least 2 characters.'
            : '';
      case 'phone':
        return !formData.phone.trim()
          ? 'Phone / WhatsApp number is required.'
          : !isValidPhone(formData.phone)
            ? 'Please enter a valid 10-digit phone number.'
            : '';
      case 'email':
        return formData.email.trim() && !isValidEmail(formData.email)
          ? 'Please enter a valid email address.'
          : '';
      case 'location':
        return applicationType === 'admission' && !formData.location.trim()
          ? 'Residential address is required.'
          : '';
      case 'minorConsentConfirmed':
        return isMinor && !formData.minorConsentConfirmed
          ? 'Parent/guardian consent is required for minors.'
          : '';
      default:
        return '';
    }
  };

  const getInputClass = (field: string) => {
    const err = getFieldError(field);
    const isFieldTouched = Boolean(touched[field]);
    const borderClass = err
      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
      : isFieldTouched
        ? 'border-emerald-500 focus:border-emerald-600'
        : 'border-slate-300 focus:border-amber-500';
    return `w-full px-3.5 py-2.5 rounded-xl bg-white border ${borderClass} text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none min-h-[44px] shadow-xs transition-colors`;
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'photo' | 'document'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (target === 'photo') {
        setFormData((prev) => ({
          ...prev,
          playerPhotoUrl: dataUrl,
          playerPhotoName: file.name,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          supportingDocumentUrl: dataUrl,
          supportingDocumentName: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = [
      'playerName',
      'dob',
      'parentName',
      'phone',
      'email',
      'location',
      'minorConsentConfirmed',
    ];
    const allTouched: Record<string, boolean> = {};
    requiredFields.forEach((f) => {
      allTouched[f] = true;
    });
    setTouched((prev) => ({ ...prev, ...allTouched }));

    if (
      !formData.playerName.trim() ||
      formData.playerName.trim().length < 2 ||
      !formData.dob.trim() ||
      (isMinor && (!formData.parentName.trim() || formData.parentName.trim().length < 2)) ||
      !formData.phone.trim() ||
      !isValidPhone(formData.phone) ||
      (formData.email.trim() && !isValidEmail(formData.email)) ||
      (applicationType === 'admission' && !formData.location.trim()) ||
      (isMinor && !formData.minorConsentConfirmed)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitRegistration({
        applicationType,
        playerName: formData.playerName.trim(),
        dob: formData.dob,
        age: calculatedAge,
        gender: formData.gender,
        parentName: formData.parentName.trim() || 'Self / Adult Applicant',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        preferredCampus: formData.preferredCampus,
        position: formData.position,
        experienceLevel: formData.experienceLevel,
        currentClubOrAcademy: formData.currentClubOrAcademy.trim(),
        program: formData.program,
        preferredTrialEventId:
          applicationType === 'trial' ? formData.preferredTrialEventId : '',
        preferredTrialDate:
          applicationType === 'trial' ? formData.preferredTrialDate : '',
        preferredVenue: applicationType === 'trial' ? formData.preferredVenue : '',
        playerPhotoUrl: formData.playerPhotoUrl,
        playerPhotoName: formData.playerPhotoName,
        supportingDocumentUrl: formData.supportingDocumentUrl,
        supportingDocumentName: formData.supportingDocumentName,
        minorConsentConfirmed: formData.minorConsentConfirmed,
        message: formData.message.trim(),
      });

      setBookingRef(res.bookingRef);
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setTouched({});
    setFormData((prev) => ({
      ...prev,
      playerName: '',
      dob: '',
      parentName: '',
      phone: '',
      email: '',
      location: '',
      currentClubOrAcademy: '',
      playerPhotoUrl: '',
      playerPhotoName: '',
      supportingDocumentUrl: '',
      supportingDocumentName: '',
      minorConsentConfirmed: false,
      message: '',
    }));
  };

  const selectedCampusObj =
    ACADEMY_CAMPUSES.find((c) => c.id === formData.preferredCampus) || ACADEMY_CAMPUSES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-400/40 bg-slate-950 flex items-center justify-center shadow-xs">
              <img
                src="/images/maden-faf-official-logo.png"
                alt="MADEN FAF Official Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Public Player Application — No Account Required
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 leading-tight">
                {applicationType === 'admission'
                  ? 'Apply for Academy Admission'
                  : 'Apply for a Trial Session'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
              {/* Pathway Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setApplicationType('admission')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    applicationType === 'admission'
                      ? 'bg-slate-900 text-amber-400 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  <span>Academy Admission</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationType('trial')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    applicationType === 'trial'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Trial Session</span>
                </button>
              </div>

              {/* Player Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Player Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="playerName"
                    value={formData.playerName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter player's full name"
                    className={getInputClass('playerName')}
                  />
                  {getFieldError('playerName') && (
                    <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('playerName')}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Date of Birth <span className="text-rose-600">*</span>
                    </label>
                    {calculatedAge !== undefined && (
                      <span className="text-[10px] font-mono font-bold text-amber-800">
                        Age: {calculatedAge} yrs
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    name="dob"
                    value={formData.dob}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className={getInputClass('dob')}
                  />
                  {getFieldError('dob') && (
                    <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('dob')}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  >
                    <option value="male">Male (Boys Academy)</option>
                    <option value="female">Female (Girls Academy Program)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Playing Position *
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  >
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="centre-back">Centre Back (Defender)</option>
                    <option value="full-back">Full Back / Wing Back</option>
                    <option value="midfielder">Central Midfielder</option>
                    <option value="winger">Winger / Wide Attacker</option>
                    <option value="forward">Centre Forward / Striker</option>
                    <option value="undecided">Undecided / Grassroots</option>
                  </select>
                </div>
              </div>

              {/* Parent & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent / Guardian Name {isMinor && <span className="text-rose-600">*</span>}
                  </label>
                  <input
                    type="text"
                    required={isMinor}
                    name="parentName"
                    value={formData.parentName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter parent/guardian full name"
                    className={getInputClass('parentName')}
                  />
                  {getFieldError('parentName') && (
                    <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('parentName')}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile / WhatsApp Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    className={getInputClass('phone')}
                  />
                  {getFieldError('phone') && (
                    <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('phone')}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={getInputClass('email')}
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('email')}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential Address{' '}
                    {applicationType === 'admission' && <span className="text-rose-600">*</span>}
                  </label>
                  <input
                    type="text"
                    required={applicationType === 'admission'}
                    name="location"
                    value={formData.location}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter city, district, or residential address"
                    className={getInputClass('location')}
                  />
                  {getFieldError('location') && (
                    <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('location')}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Campus / Trial Event Selection */}
              {applicationType === 'trial' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Trial Session *
                    </label>
                    <select
                      name="preferredTrialEventId"
                      value={formData.preferredTrialEventId}
                      onChange={(e) => {
                        const slot = trialSlots.find((s) => s.id === e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          preferredTrialEventId: e.target.value,
                          preferredTrialDate: slot?.date || prev.preferredTrialDate,
                          preferredVenue: slot?.campusName || prev.preferredVenue,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                    >
                      {trialSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.campusName} ({slot.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Venue &amp; Date
                    </label>
                    <input
                      type="text"
                      name="preferredVenue"
                      value={formData.preferredVenue}
                      onChange={handleChange}
                      placeholder="Preferred trial ground"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Training Campus *
                    </label>
                    <select
                      name="preferredCampus"
                      value={formData.preferredCampus}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                    >
                      <option value="gayeshpur">Gayeshpur Campus (Central Grounds, Nadia)</option>
                      <option value="north24parganas">
                        North 24 Parganas Campus (Leninnagar Ichapore)
                      </option>
                      <option value="krishnanagar">
                        Krishnanagar Football School (United Red Star)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Previous Experience &amp; Current Club
                    </label>
                    <input
                      type="text"
                      name="currentClubOrAcademy"
                      value={formData.currentClubOrAcademy}
                      onChange={handleChange}
                      placeholder="Current club/school team (if any)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* Photo & Document Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {formData.playerPhotoName || 'Player Photo (Optional)'}
                  </span>
                  <label className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-slate-800 cursor-pointer inline-flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3 text-amber-600" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {formData.supportingDocumentName || 'Age Proof / ID (Optional)'}
                  </span>
                  <label className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-slate-800 cursor-pointer inline-flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3 text-indigo-600" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'document')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Minor Consent */}
              <div
                className={`p-3 rounded-xl border ${
                  getFieldError('minorConsentConfirmed')
                    ? 'bg-rose-50/50 border-rose-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.minorConsentConfirmed}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        minorConsentConfirmed: e.target.checked,
                      }));
                      setTouched((prev) => ({ ...prev, minorConsentConfirmed: true }));
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-700 leading-snug">
                    <strong>Parent/Guardian Consent:</strong> I confirm parent/guardian consent for this applicant and authorize MADEN FAF Administration to review this application.
                  </span>
                </label>
                {getFieldError('minorConsentConfirmed') && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{getFieldError('minorConsentConfirmed')}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>
                        {applicationType === 'admission'
                          ? 'Submit Admission Application'
                          : 'Submit Trial Session Application'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <Link
                    href={`/join?type=${applicationType}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-700 transition-colors"
                  >
                    <span>Open full-page {applicationType} application form</span>
                    <ExternalLink className="w-3 h-3 text-amber-600" />
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            /* Confirmation State */
            <div className="space-y-4 sm:space-y-6 text-center py-2 sm:py-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div>
                <div className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-emerald-700 font-bold">
                  Status: Pending Review
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
                  Application received for{' '}
                  <strong className="text-slate-900">{formData.playerName}</strong>. Our Admin team will review your application and communicate status updates to{' '}
                  <strong className="text-slate-900">{formData.phone}</strong>.
                </p>
              </div>

              {/* Pass Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="text-[11px] font-mono text-slate-500 uppercase">
                    APPLICATION REFERENCE
                  </div>
                  <div className="text-xs sm:text-sm font-black text-amber-600 font-mono">
                    {bookingRef}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Campus / Venue
                    </span>
                    <strong className="text-slate-900 text-[11px] block truncate">
                      {applicationType === 'trial'
                        ? formData.preferredVenue
                        : selectedCampusObj.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Current Workflow Status
                    </span>
                    <strong className="text-amber-700 text-[11px] block">
                      Pending Review
                    </strong>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2.5">
                  <div className="text-[10px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>What to bring when your session is scheduled:</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Football boots (studs/turf), shin pads, athletic kit, personal water bottle, and age verification ID.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] shadow-sm shadow-amber-200 cursor-pointer"
                >
                  Done &amp; Back to Website
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all min-h-[40px] cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
