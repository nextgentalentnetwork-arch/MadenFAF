'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle, Calendar, MapPin, Award, ChevronRight, Phone, ShieldCheck, Sparkles, Database, ExternalLink } from 'lucide-react';
import { ACADEMY_CAMPUSES } from '@/data/academyData';
import { submitRegistration, isSupabaseConfigured } from '@/lib/supabaseClient';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCampus?: string;
  defaultProgram?: string;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  defaultCampus = 'gayeshpur',
  defaultProgram = 'development'
}) => {
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
    program: defaultProgram,
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [dbSaved, setDbSaved] = useState(false);
  const isSupabaseActive = isSupabaseConfigured();

  if (!isOpen) return null;

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

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
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
      program: defaultProgram,
      message: ''
    });
  };

  const selectedCampusObj = ACADEMY_CAMPUSES.find(c => c.id === formData.preferredCampus) || ACADEMY_CAMPUSES[0];

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
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-xs">
              FAF
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span>Official Intake 2026/27</span>
                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                  Supabase DB Sync
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 leading-tight">
                Book a Trial / Join MADEN FAF
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
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-slate-700">
                <span className="font-bold text-amber-800">Official Intake:</span> Register below for an on-pitch scouting trial session and academy evaluation by licensed AFC coaches.
              </div>

              {/* Player Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Player Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="playerName"
                    value={formData.playerName}
                    onChange={handleChange}
                    placeholder="e.g. Subham Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  />
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
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="e.g. Pradip Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98300 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="parent@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Residential Location *
                  </label>
                  <input
                    type="text"
                    required
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Kalyani, Barrackpore, Krishnanagar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  />
                </div>
              </div>

              {/* Campus and Program Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Academy Campus *
                  </label>
                  <select
                    name="preferredCampus"
                    value={formData.preferredCampus}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  >
                    <option value="gayeshpur">Gayeshpur Campus (Central Grounds, Nadia)</option>
                    <option value="north24parganas">North 24 Parganas Campus (Leninnagar Ichapore)</option>
                    <option value="krishnanagar">Krishnanagar Football School (United Red Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Interested In *
                  </label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base sm:text-sm focus:outline-none focus:border-amber-500 min-h-[44px] shadow-xs"
                  >
                    <option value="foundation">Foundation Program (U8–U10)</option>
                    <option value="development">Development Program (U11–U13)</option>
                    <option value="advanced">Advanced Development (U14–U15)</option>
                    <option value="elite">Elite Development (U16–U18)</option>
                    <option value="goalkeeper">Goalkeeper Specialist Program</option>
                    <option value="girls-football">Girls Football Program</option>
                    <option value="holiday-camps">Upcoming Holiday Camps</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Playing Background & Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mention previous clubs, tournaments played, or scholarship interest..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-amber-500 resize-none shadow-xs"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Registering with Database...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Submit Trial Application</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <Link
                    href="/join"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-700 transition-colors"
                  >
                    <span>Open full-page application form</span>
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
                  Trial Assessment Confirmed
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  Welcome to the MADEN FAF Family!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
                  Application received for <strong className="text-slate-900">{formData.playerName}</strong>. A coaching representative will contact parent <strong className="text-slate-900">{formData.parentName}</strong> at {formData.phone} within 24 hours.
                </p>
              </div>

              {/* Pass Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="text-[11px] font-mono text-slate-500 uppercase">REGISTRATION PASS CODE</div>
                  <div className="text-xs sm:text-sm font-black text-amber-600 font-mono">{bookingRef}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Campus Venue</span>
                    <strong className="text-slate-900 text-[11px] block truncate">{selectedCampusObj.name}</strong>
                    <div className="text-slate-500 text-[10px] truncate">{selectedCampusObj.location}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Recommended Schedule</span>
                    <strong className="text-slate-900 text-[11px] block truncate">{selectedCampusObj.trainingDays.split(',')[0]}</strong>
                    <div className="text-slate-500 text-[10px] truncate">{selectedCampusObj.timings.split('|')[0]}</div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2.5">
                  <div className="text-[10px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>What to bring for your trial:</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Football boots (studs/turf), shin pads, athletic shorts/t-shirt, personal water bottle, and age verification ID.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] shadow-sm shadow-amber-200"
                >
                  Done & Back to Website
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all min-h-[40px]"
                >
                  Register Another Player
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
