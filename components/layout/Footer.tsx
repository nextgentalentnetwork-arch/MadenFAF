'use client';

import React from 'react';
import Link from 'next/link';
import { MadenLogo } from '@/components/ui/MadenLogo';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Shield, ArrowUp } from 'lucide-react';

interface FooterProps {
  onJoinClick: () => void;
  onLoginClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onJoinClick, onLoginClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs relative overflow-hidden pb-24 lg:pb-16">
      {/* Top Banner Accent */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <MadenLogo size="md" variant="horizontal" lightText={false} />
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              MADEN FAF (Maden Football Academy Foundation) is dedicated to professional youth football development, technical excellence, character building, and creating life-changing athletic opportunities across West Bengal.
            </p>

            <div className="text-amber-700 text-xs font-mono font-bold tracking-wider uppercase">
              WHERE PASSION MEETS EXCELLENCE
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-amber-400 active:scale-95 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-amber-400 active:scale-95 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-amber-400 active:scale-95 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Programs Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Programs
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#programs" className="hover:text-amber-600 transition-colors block py-0.5">Foundation (U8-U10)</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-600 transition-colors block py-0.5">Development (U11-U13)</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-600 transition-colors block py-0.5">Advanced (U14-U15)</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-600 transition-colors block py-0.5">Elite Pre-Pro (U16-U18)</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-600 transition-colors block py-0.5">Goalkeeper Academy</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-600 transition-colors block py-0.5">Girls Football Program</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-600 transition-colors block py-0.5">Holiday Camps</a>
              </li>
            </ul>
          </div>

          {/* Campuses Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Campus Network
            </h4>
            <div className="space-y-3">
              <div>
                <strong className="text-slate-900 block text-xs">Gayeshpur Campus (HQ)</strong>
                <span className="text-[11px] text-slate-500">Central Training Ground, Nadia</span>
              </div>
              <div>
                <strong className="text-slate-900 block text-xs">North 24 Parganas Campus</strong>
                <span className="text-[11px] text-slate-500">In association with Leninnagar Sporting Club, Ichapore</span>
              </div>
              <div>
                <strong className="text-slate-900 block text-xs">Krishnanagar Football School</strong>
                <span className="text-[11px] text-slate-500">In collaboration with United Red Star Club</span>
              </div>
              <div>
                <strong className="text-amber-700 block text-xs">Kalyani High-Performance (Vision)</strong>
                <span className="text-[11px] text-slate-500">Upcoming Residential Sports Centre</span>
              </div>
            </div>
          </div>

          {/* Admissions & Contact Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Admissions & Trials
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Open trials and admissions take place on scheduled weekends. Register online for prior assessment booking.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={onJoinClick}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shadow-amber-200 cursor-pointer min-h-[44px]"
              >
                Book a Trial / Join
              </button>
              <button
                onClick={onLoginClick}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-800 border border-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer min-h-[42px] shadow-xs"
              >
                Access Digital Portal
              </button>
            </div>

            <div className="pt-2 text-xs text-slate-600 space-y-1.5">
              <a href="tel:+919830245891" className="flex items-center gap-2 hover:text-amber-600 transition-colors">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>+91 98302 45891</span>
              </a>
              <a href="mailto:admissions@madenfaf.com" className="flex items-center gap-2 hover:text-amber-600 transition-colors truncate">
                <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>admissions@madenfaf.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Partners & Affiliations Bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-slate-500 text-center md:text-left">
            <span className="font-semibold text-slate-700">Collaborating Partners:</span>
            <span>Leninnagar Sporting Club (Ichapore)</span>
            <span aria-hidden="true">·</span>
            <span>United Red Star Club (Krishnanagar)</span>
            <span aria-hidden="true">·</span>
            <span>West Bengal Grassroots Network</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px] text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>© {new Date().getFullYear()} MADEN Football Academy Foundation (MADEN FAF). All Rights Reserved.</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <Link
              href="/developer"
              className="text-slate-500 hover:text-amber-700 font-mono font-bold transition-colors underline decoration-slate-300 hover:decoration-amber-500"
            >
              Developer & Backend Console
            </Link>
          </div>
          <div className="text-slate-500">
            Developing Footballers · Building Character · Creating Opportunities
          </div>
        </div>
      </div>
    </footer>
  );
};
