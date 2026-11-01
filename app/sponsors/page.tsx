'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { SponsorBrandsCarousel } from '@/components/home/SponsorBrandsCarousel';
import { Handshake, Award, Shield, CheckCircle2, Mail, Phone, Building, ArrowRight } from 'lucide-react';

export default function SponsorsPage() {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    partnershipTier: 'Title Partner',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  return (
    <PublicPageShell
      title="Sponsors & Official Brand Partners"
      subtitle="Powering the next generation of football talent. We partner with leading equipment, sports science, and corporate organizations."
      badge="Partnership Ecosystem"
      breadcrumbs={[{ label: 'Brand Partners' }]}
      ctaText="Become a Partner"
      ctaAction={() => {
        document.getElementById('partner-inquiry')?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <div className="py-10 space-y-16">
        {/* Carousel Showcase */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SponsorBrandsCarousel />
        </div>

        {/* Partnership Tiers Overview */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold uppercase text-amber-700 tracking-wider">
                Corporate Social Responsibility
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
                Partnership Tiers & Visibility
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Align your brand with authentic grassroots development, ethical youth athletics, and certified 80G tax benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tier 1: Title & Kit Partner */}
              <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 shadow-sm space-y-4 relative">
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider">
                  Marquee Tier
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Title & Kit Partner</h3>
                  <span className="text-xs text-amber-700 font-bold block mt-0.5">Primary Front-of-Jersey Placement</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prominent brand exposure across all competitive match kits, training bibs, campus perimeter billboards, and digital livestream broadcasts.
                </p>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Front crest placement on 450+ official kits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ground billboard branding across 3 campuses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>CSR 80G tax exemption certificates</span>
                  </div>
                </div>
              </div>

              {/* Tier 2: Technical & Nutrition Partner */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Technical & Nutrition</h3>
                  <span className="text-xs text-slate-500 font-bold block mt-0.5">Equipment & Recovery Supporter</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Product integration with match balls, training cones, recovery hydration, physiotherapy supplies, and sleeve brand badges.
                </p>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sleeve and back-of-shorts brand insignia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official nutrition & hydration designation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Digital portal banner co-branding</span>
                  </div>
                </div>
              </div>

              {/* Tier 3: Grassroots Foundation Patron */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Foundation Patron</h3>
                  <span className="text-xs text-slate-500 font-bold block mt-0.5">Scholarship & Grassroots Enabler</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Directly underwrite 10+ full-ride youth scholarships for underprivileged talents from Nadia and North 24 Parganas districts.
                </p>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Named scholarship cohort recognition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Quarterly academic and athletic audit reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Annual Foundation Gala guest of honour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Partnership Inquiry Form */}
        <div id="partner-inquiry" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                <Handshake className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-black uppercase text-slate-900">
                  Partner with MADEN FAF
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect with our commercial and CSR partnership division to request a tailored deck.
                </p>
              </div>
            </div>

            {inquirySubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-950">Partnership Inquiry Received</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Thank you for your commitment to Indian youth football. Our corporate relations team will reach out within 24 hours with our complete partnership dossier.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apollo Diagnostics / Reliance Foundation"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Officer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sourav Mukherjee"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Corporate Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98300 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Partnership Model</label>
                  <select
                    value={formData.partnershipTier}
                    onChange={(e) => setFormData({ ...formData, partnershipTier: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white"
                  >
                    <option value="Title Partner">Title & Jersey Partner (Front-of-shirt branding)</option>
                    <option value="Technical Partner">Technical & Equipment Supplier</option>
                    <option value="Nutrition Partner">Sports Nutrition & Hydration Associate</option>
                    <option value="Foundation Patron">Foundation Patron (100% Scholarship Sponsor with 80G)</option>
                    <option value="Custom">Custom CSR Sponsorship Initiative</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brief Proposal or Specific Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your brand's CSR focus or marketing goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>Submit Partnership Inquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
