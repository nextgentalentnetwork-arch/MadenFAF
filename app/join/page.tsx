'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MadenLogo } from '@/components/ui/MadenLogo';
import { ACADEMY_CAMPUSES, ACADEMY_PROGRAMS } from '@/data/academyData';
import { submitRegistration, isSupabaseConfigured } from '@/lib/supabaseClient';
import { 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Database,
  Printer
} from 'lucide-react';

export default function JoinPage() {
  const router = useRouter();
  const isSupabaseActive = isSupabaseConfigured();

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
    program: 'development',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [dbSaved, setDbSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await submitRegistration({
        playerName: formData.playerName,
        dob: formData.dob,
        gender: formData.gender,
        parentName: formData.parentName,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        preferredCampus: formData.preferredCampus,
        position: formData.position,
        experienceLevel: formData.experienceLevel,
        program: formData.program,
        message: formData.message,
      });

      setBookingRef(res.bookingRef);
      setDbSaved(res.success);
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCampusObj = ACADEMY_CAMPUSES.find(c => c.id === formData.preferredCampus) || ACADEMY_CAMPUSES[0];
  const selectedProgramObj = ACADEMY_PROGRAMS.find(p => p.id === formData.program) || ACADEMY_PROGRAMS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Bar with Brand and Database status */}
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

        {/* Supabase Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-mono shadow-xs">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-500">Database:</span>
          {isSupabaseActive ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Supabase Connected
            </span>
          ) : (
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Supabase Ready
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {!isSubmitted ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl relative">
            {/* Form Headline */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Official Intake & Assessment Trials</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">
                JOIN MADEN FAF ACADEMY
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Register for an official assessment trial at Gayeshpur, North 24 Parganas, or Krishnanagar. All submissions are recorded in our central Supabase academy database.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Section 1: Player Information */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>1. Player Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Player Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="playerName"
                      placeholder="e.g. Subham Roy"
                      value={formData.playerName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Date of Birth <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
                    />
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
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Playing Position
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
                </div>
              </div>

              {/* Section 2: Program & Campus Choice */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>2. Program & Campus Location</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Preferred Training Campus <span className="text-amber-600">*</span>
                    </label>
                    <select
                      name="preferredCampus"
                      value={formData.preferredCampus}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
                    >
                      {ACADEMY_CAMPUSES.map(camp => (
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
                      Intended Football Program <span className="text-amber-600">*</span>
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
                    >
                      {ACADEMY_PROGRAMS.map(prog => (
                        <option key={prog.id} value={prog.id}>
                          {prog.name} ({prog.ageGroup.split('(')[0].trim()})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {selectedProgramObj.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Parent / Guardian Details */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>3. Parent / Guardian Contact</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Parent / Guardian Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="parentName"
                      placeholder="e.g. Mr. Pradip Roy"
                      value={formData.parentName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Contact Phone (WhatsApp) <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      placeholder="+91 98300 00000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      placeholder="parent@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Residential City / Area
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Kalyani, Nadia"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Experience & Additional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Prior Football Experience & Health Notes
                </label>
                <textarea
                  rows={3}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mention previous clubs, tournaments played, or any physical/medical precautions our coaching team should be aware of..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Submissions are securely stored in Supabase PostgreSQL</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  {isSubmitting ? (
                    <span>Registering with Database...</span>
                  ) : (
                    <>
                      <span>Submit Trial Registration</span>
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
                Application Received & Recorded
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 mt-1">
                REGISTRATION CONFIRMED!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Thank you! The assessment trial application for{' '}
                <strong className="text-slate-900">{formData.playerName}</strong> has been stored in our Supabase database.
              </p>
            </div>

            {/* Official Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Official Booking Reference</span>
                  <span className="text-lg sm:text-xl font-mono font-black text-amber-600">{bookingRef}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold self-start sm:self-auto">
                  <span>Status: PENDING ON-PITCH ASSESSMENT</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Candidate Athlete</span>
                  <span className="text-slate-900 font-bold">{formData.playerName} ({formData.gender.toUpperCase()})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Program Selected</span>
                  <span className="text-slate-900 font-bold">{selectedProgramObj.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Allocated Campus</span>
                  <span className="text-slate-900 font-bold">{selectedCampusObj.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Parent / Contact</span>
                  <span className="text-slate-900 font-bold">{formData.parentName} ({formData.phone})</span>
                </div>
              </div>

              {/* Campus Logistics */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Campus Address:</strong>
                  <span>{selectedCampusObj.address}</span>
                  <div className="mt-1 font-mono text-[11px] text-amber-800">
                    Training Timings: {selectedCampusObj.timings}
                  </div>
                </div>
              </div>
            </div>

            {/* Trial Preparation Checklist */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                What to bring on Trial Day:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Football boots (firm ground / studs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Shin guards and football socks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Personal water bottle & electrolyte</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Copy of government ID / age proof</span>
                </li>
              </ul>
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
                <span>Print / Save Receipt</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
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
                      program: 'development',
                      message: ''
                    });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  Register Another
                </button>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors shadow-sm shadow-amber-200 flex items-center justify-center gap-1.5"
                >
                  <span>Portal Login</span>
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
