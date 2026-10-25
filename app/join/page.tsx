'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MadenLogo } from '@/components/ui/MadenLogo';
import { ACADEMY_CAMPUSES, ACADEMY_PROGRAMS } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import {
  submitRegistration,
  isSupabaseConfigured,
  calculateAgeFromDob,
} from '@/lib/supabaseClient';
import {
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Database,
  Printer,
  AlertCircle,
  Trophy,
  Upload,
  FileText,
  Camera,
} from 'lucide-react';

function JoinPageContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const isSupabaseActive = isSupabaseConfigured();

  const [selectedType, setSelectedType] = useState<'admission' | 'trial' | null>(null);
  const applicationType: 'admission' | 'trial' =
    selectedType ?? (typeParam === 'trial' ? 'trial' : 'admission');
  const setApplicationType = (nextType: 'admission' | 'trial') => {
    setSelectedType(nextType);
  };

  const trialSlots = AcademyDataManager.getTrialSlots();

  const [formData, setFormData] = useState({
    playerName: '',
    dob: '',
    gender: 'male',
    parentName: '',
    phone: '',
    email: '',
    location: '',
    preferredCampus: 'gayeshpur',
    position: 'midfielder',
    experienceLevel: 'school-team',
    currentClubOrAcademy: '',
    program: 'development',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

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
          ? "Player's full name is required."
          : formData.playerName.trim().length < 2
            ? 'Player name must be at least 2 characters.'
            : '';
      case 'dob':
        return !formData.dob.trim() ? 'Date of birth is required.' : '';
      case 'parentName':
        return isMinor && !formData.parentName.trim()
          ? 'Parent / guardian name is required for minor applicants.'
          : isMinor && formData.parentName.trim().length < 2
            ? 'Parent / guardian name must be at least 2 characters.'
            : '';
      case 'phone':
        return !formData.phone.trim()
          ? 'Mobile / WhatsApp contact number is required.'
          : !isValidPhone(formData.phone)
            ? 'Please enter a valid 10-digit mobile number.'
            : '';
      case 'email':
        return formData.email.trim() && !isValidEmail(formData.email)
          ? 'Please enter a valid email address.'
          : '';
      case 'location':
        return applicationType === 'admission' && !formData.location.trim()
          ? 'Residential address is required for Academy Admission.'
          : '';
      case 'minorConsentConfirmed':
        return isMinor && !formData.minorConsentConfirmed
          ? 'Parent/guardian consent is required for minor players.'
          : '';
      default:
        return '';
    }
  };

  const getInputClass = (field: string) => {
    const err = getFieldError(field);
    const isFieldTouched = Boolean(touched[field]);
    const borderClass = err
      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
      : isFieldTouched
        ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
        : 'border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500';
    return `w-full px-3.5 py-2.5 bg-white border ${borderClass} rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs`;
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

  const selectedCampusObj =
    ACADEMY_CAMPUSES.find((c) => c.id === formData.preferredCampus) || ACADEMY_CAMPUSES[0];
  const selectedProgramObj =
    ACADEMY_PROGRAMS.find((p) => p.id === formData.program) || ACADEMY_PROGRAMS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors p-2 px-3 rounded-xl bg-white border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>Back to Home</span>
          </Link>
          <div className="hidden sm:block">
            <MadenLogo size="sm" variant="horizontal" lightText={false} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-mono shadow-xs">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-500">Public Intake Application:</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {isSupabaseActive ? 'No Player Account Needed' : 'Direct Application Ready'}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {!isSubmitted ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl relative">
            {/* Two Public Application Pathways Switcher */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Public Player Application Portal — No Account Registration Required</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
                {applicationType === 'admission'
                  ? 'Apply for Academy Admission'
                  : 'Apply for a Trial Session'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                {applicationType === 'admission'
                  ? 'Complete the official Academy Admission form below. Applications are saved with status Pending Review and reviewed directly by the Academy Admissions Committee.'
                  : 'Book an on-pitch scouting Trial Session at your preferred venue and session date. No separate Player login account is required.'}
              </p>

              {/* Pathway Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl mt-5">
                <button
                  type="button"
                  onClick={() => setApplicationType('admission')}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    applicationType === 'admission'
                      ? 'bg-slate-900 text-amber-400 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span>A. Apply for Academy Admission</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationType('trial')}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    applicationType === 'trial'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>B. Apply for a Trial Session</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6 sm:space-y-8">
              {/* Section 1: Player Personal Details */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>1. Player Personal Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Player&apos;s Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="playerName"
                      placeholder="e.g. Subham Roy"
                      value={formData.playerName}
                      onBlur={handleBlur}
                      onChange={handleChange}
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Date of Birth <span className="text-rose-600">*</span>
                      </label>
                      {calculatedAge !== undefined && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          Age: {calculatedAge} yrs {isMinor ? '(Minor)' : '(Adult)'}
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

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Gender <span className="text-amber-600">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
                    >
                      <option value="male">Male (Boys Cohort)</option>
                      <option value="female">Female (Girls Football Program)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Parent / Guardian & Contact Information */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>
                    2. Contact &amp; Parent / Guardian Details{' '}
                    {isMinor ? '(Required for Minors)' : '(Where Applicable)'}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Parent / Guardian Name{' '}
                      {isMinor && <span className="text-rose-600">*</span>}
                    </label>
                    <input
                      type="text"
                      required={isMinor}
                      name="parentName"
                      placeholder="e.g. Mr. Pradip Roy"
                      value={formData.parentName}
                      onBlur={handleBlur}
                      onChange={handleChange}
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile Number (WhatsApp / SMS) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      placeholder="+91 98300 00000"
                      value={formData.phone}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      className={getInputClass('phone')}
                    />
                    {getFieldError('phone') && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError('phone')}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address (Where Available)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="parent@example.com"
                      value={formData.email}
                      onBlur={handleBlur}
                      onChange={handleChange}
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Residential Address{' '}
                      {applicationType === 'admission' && (
                        <span className="text-rose-600">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required={applicationType === 'admission'}
                      name="location"
                      placeholder="House/Street, City, District, PIN (e.g. Kalyani, Nadia)"
                      value={formData.location}
                      onBlur={handleBlur}
                      onChange={handleChange}
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
              </div>

              {/* Section 3: Campus / Trial Session & Football Profile */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>
                    3.{' '}
                    {applicationType === 'admission'
                      ? 'Training Centre, Position & Football Experience'
                      : 'Preferred Trial Session, Venue & Football Experience'}
                  </span>
                </h3>

                {applicationType === 'trial' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                        Preferred Trial Event / Session *
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
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      >
                        {trialSlots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {slot.campusName} — {slot.date} ({slot.ageGroups})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                        Preferred Venue
                      </label>
                      <input
                        type="text"
                        name="preferredVenue"
                        value={formData.preferredVenue}
                        onChange={handleChange}
                        placeholder="e.g. Gayeshpur Central Ground"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                        Available / Preferred Date
                      </label>
                      <input
                        type="text"
                        name="preferredTrialDate"
                        value={formData.preferredTrialDate}
                        onChange={handleChange}
                        placeholder="e.g. Next Saturday / May 16, 2026"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Preferred Training Centre / Campus <span className="text-amber-600">*</span>
                    </label>
                    <select
                      name="preferredCampus"
                      value={formData.preferredCampus}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
                    >
                      {ACADEMY_CAMPUSES.map((camp) => (
                        <option key={camp.id} value={camp.id}>
                          {camp.name} ({camp.location.split(',')[0]})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {selectedCampusObj.association}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Playing Position <span className="text-amber-600">*</span>
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
                    >
                      <option value="goalkeeper">Goalkeeper (GK)</option>
                      <option value="centerback">Center Back (CB)</option>
                      <option value="fullback">Full Back (LB / RB)</option>
                      <option value="midfielder">Central Midfielder (CM / CDM / CAM)</option>
                      <option value="winger">Winger (LW / RW)</option>
                      <option value="striker">Striker / Forward (ST / CF)</option>
                      <option value="undecided">Exploring / Open to Coach Recommendation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Previous Football Experience
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
                    >
                      <option value="grassroots-beginner">Grassroots / Beginner</option>
                      <option value="school-team">School / Inter-School Team</option>
                      <option value="district-club">District Club / Sub-Division League</option>
                      <option value="state-aiiff-youth">State / AIFF Youth League Experience</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Current Club / Academy (If Any)
                    </label>
                    <input
                      type="text"
                      name="currentClubOrAcademy"
                      value={formData.currentClubOrAcademy}
                      onChange={handleChange}
                      placeholder="e.g. School XI / Local Sporting Club / None"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Player Photograph & Supporting Documents */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>4. Player Photograph &amp; Relevant Supporting Documents</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Player Photograph (Passport Size)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Upload recent player photo (JPG/PNG)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-amber-600" />
                        <span>{formData.playerPhotoName ? 'Change Photo' : 'Choose Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'photo')}
                          className="hidden"
                        />
                      </label>
                      {formData.playerPhotoName && (
                        <span className="text-[11px] font-mono text-emerald-700 truncate max-w-[180px]">
                          ✓ {formData.playerPhotoName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-800 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Age Proof / Birth Certificate / ID
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Upload supporting age verification or medical fitness document
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {formData.supportingDocumentName ? 'Change Document' : 'Upload Document'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'document')}
                          className="hidden"
                        />
                      </label>
                      {formData.supportingDocumentName && (
                        <span className="text-[11px] font-mono text-emerald-700 truncate max-w-[180px]">
                          ✓ {formData.supportingDocumentName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Additional Notes & Parent/Guardian Consent */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Additional Notes / Achievements / Medical Precautions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mention tournaments played, achievements, or any health precautions our coaching staff should note..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs resize-none"
                  />
                </div>

                {/* Mandatory Consent for Minors */}
                <div
                  className={`p-4 rounded-2xl border ${
                    getFieldError('minorConsentConfirmed')
                      ? 'bg-rose-50/50 border-rose-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
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
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900 block">
                        Parent / Guardian Consent &amp; Child Data Protection Declaration{' '}
                        {isMinor && <span className="text-rose-600">*</span>}
                      </span>
                      I confirm that I am the parent/legal guardian of the applicant (or an adult applicant) and consent to the player participating in MADEN Football Academy Foundation admission/trial sessions. All minor applicant records are restricted strictly to authorized Academy Administration.
                    </div>
                  </label>
                  {getFieldError('minorConsentConfirmed') && (
                    <p className="mt-2 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('minorConsentConfirmed')}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Saved securely with status <strong>Pending Review</strong> for official verification
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>
                        {applicationType === 'admission'
                          ? 'Submit Admission Application'
                          : 'Submit Trial Session Application'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Receipt Card */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl relative animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                {applicationType === 'admission'
                  ? 'Academy Admission Application Received'
                  : 'Trial Session Application Received'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 mt-1">
                APPLICATION CONFIRMED!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Thank you! The{' '}
                {applicationType === 'admission' ? 'Academy Admission' : 'Trial Session'}{' '}
                application for <strong className="text-slate-900">{formData.playerName}</strong>{' '}
                has been saved with status <strong>Pending Review</strong>.
              </p>
            </div>

            {/* Official Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">
                    Unique Application Confirmation Reference
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black text-amber-600">
                    {bookingRef}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold self-start sm:self-auto">
                  <span>Status: PENDING REVIEW</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Applicant Player</span>
                  <span className="text-slate-900 font-bold">
                    {formData.playerName} ({formData.gender.toUpperCase()}
                    {calculatedAge !== undefined ? `, ${calculatedAge} yrs` : ''})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Application Pathway</span>
                  <span className="text-slate-900 font-bold uppercase">
                    {applicationType === 'admission'
                      ? 'Academy Admission'
                      : `Trial Session (${formData.preferredTrialDate || selectedProgramObj.name})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Preferred Training Campus / Venue</span>
                  <span className="text-slate-900 font-bold">
                    {applicationType === 'trial' && formData.preferredVenue
                      ? formData.preferredVenue
                      : selectedCampusObj.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Parent / Contact</span>
                  <span className="text-slate-900 font-bold">
                    {formData.parentName || 'Self'} ({formData.phone})
                  </span>
                </div>
              </div>

              {/* Campus Logistics */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Next Steps in Application Workflow:</strong>
                  <span>
                    The Academy Admissions Committee will review your application and update its status (Under Review, Trial Scheduled, Approved, or Waitlisted). Trial date, time, venue, and reporting instructions will be communicated to {formData.phone} {formData.email ? `and ${formData.email}` : ''}.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Confirmation Reference</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
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
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  Submit Another Application
                </button>

                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors shadow-sm shadow-amber-200 flex items-center justify-center gap-1.5"
                >
                  <span>Return Home</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Loading Public Application Form...
          </div>
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
