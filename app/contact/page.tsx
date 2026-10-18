'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { JoinModal } from '@/components/modals/JoinModal';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  Building,
  ShieldCheck,
} from 'lucide-react';

export default function ContactPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    campus: 'gayeshpur',
    interest: 'trial',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PublicPageShell
      title="Contact & Admissions Office"
      subtitle="Connect directly with MADEN FAF admissions coordinators, campus managers, or technical staff."
      badge="Direct Support"
      breadcrumbs={[{ label: 'Contact' }]}
      ctaText="Book Pitch Evaluation"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Campus Direct Contacts */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-500" />
                <span>Academy Headquarters</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Flagship Campus & Admin Office</div>
                    <div>Gayeshpur Football Complex, Nadia District, West Bengal 741234</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Admissions Helpline</div>
                    <a href="tel:+919830245891" className="hover:text-amber-600 font-mono">
                      +91 98302 45891 / +91 94331 87210
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Email Enquiries</div>
                    <a href="mailto:admissions@madenfaf.com" className="hover:text-amber-600">
                      admissions@madenfaf.com / contact@madenfaf.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Office Working Hours</div>
                    <div>Tuesday – Sunday: 6:30 AM – 7:30 PM (Mondays Closed)</div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-4 border-t border-slate-100">
                <a
                  href="https://wa.me/919830245891?text=Hello%20MADEN%20FAF,%20I%20would%20like%20information%20about%20youth%20trials."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Regional Campus Hubs */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Regional Training Grounds
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900">Gayeshpur Flagship Campus</div>
                  <div className="text-[11px] text-slate-500">Full-size floodlit grass ground & athletic pavilion</div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900">Kalyani Youth Centre</div>
                  <div className="text-[11px] text-slate-500">Synthetic turf arena & speed training track</div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900">Kolkata North Centre</div>
                  <div className="text-[11px] text-slate-500">Leninnagar Sporting ground collaboration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Enquiry Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 uppercase">
                Send an Admissions Enquiry
              </h3>
              <p className="text-xs text-slate-600">
                Fill in the details below and an admissions coordinator will call you back within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold uppercase">Enquiry Received!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you, {form.name || 'Parent/Player'}. Our admissions coordinator has received your enquiry and will contact you via phone or WhatsApp shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Subham Roy / Pradip Roy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98302 45891"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Preferred Campus</label>
                    <select
                      value={form.campus}
                      onChange={(e) => setForm({ ...form, campus: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="gayeshpur">Gayeshpur Flagship Campus</option>
                      <option value="kalyani">Kalyani Youth Centre</option>
                      <option value="kolkata">Kolkata North Centre</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Message / Questions</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about the player's age, football experience, or any questions you have about evaluations..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-200 cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Admissions Enquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </PublicPageShell>
  );
}
