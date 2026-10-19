'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { JoinModal } from '@/components/modals/JoinModal';
import { DigitalPortalModal } from '@/components/modals/DigitalPortalModal';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import { AcademyDataManager, subscribeAcademyData, DEFAULT_TOGGLES } from '@/lib/academyDataManager';
import { useAuth, UserRole } from '@/lib/AuthContext';
import {
  ChevronRight,
  Home,
  Sparkles,
  ArrowRight,
  Shield,
  Trophy,
  Lock,
  UserCheck,
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PublicPageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  showPreFooterCta?: boolean;
  ctaText?: string;
  ctaAction?: () => void;
  // Access control
  accessLevel?: 'public' | 'login_required' | 'role_restricted';
  allowedRoles?: UserRole[];
}

export const PublicPageShell: React.FC<PublicPageShellProps> = ({
  children,
  title,
  subtitle,
  badge,
  breadcrumbs,
  showPreFooterCta = true,
  ctaText,
  ctaAction,
  accessLevel = 'public',
  allowedRoles = ['player', 'parent', 'coach', 'admin', 'manager', 'staff1', 'staff2'],
}) => {
  const { user, profile } = useAuth();
  const toggles = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getComponentToggles(),
    () => DEFAULT_TOGGLES
  );

  // Modals state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedCampusForTrial, setSelectedCampusForTrial] = useState<string>('gayeshpur');
  const [selectedProgramForTrial, setSelectedProgramForTrial] = useState<string>('development');

  const [portalOpen, setPortalOpen] = useState(false);
  const [portalInitialRole, setPortalInitialRole] = useState<'player' | 'parent' | 'coach' | 'admin'>('player');

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handleOpenJoin = (campus = 'gayeshpur', program = 'development') => {
    setSelectedCampusForTrial(campus);
    setSelectedProgramForTrial(program);
    setJoinModalOpen(true);
  };

  const handleOpenPortal = (role: 'player' | 'parent' | 'coach' | 'admin' = 'player') => {
    setPortalInitialRole(role);
    setPortalOpen(true);
  };

  const handlePlayVideo = (video?: ActiveVideoData) => {
    setActiveVideo(video || null);
    setVideoModalOpen(true);
  };

  // Check access permissions
  const isLoginRequired = accessLevel === 'login_required' || accessLevel === 'role_restricted';
  const isUnauthorized = isLoginRequired && !user && !profile;
  const isRoleRestricted =
    accessLevel === 'role_restricted' &&
    profile &&
    !allowedRoles.includes(profile.role);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Sticky Public Header */}
      {toggles.header !== false && (
        <Header
          onLoginClick={() => handleOpenPortal('player')}
          onJoinClick={() => handleOpenJoin()}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-18 sm:pt-20">
        {/* Page Hero Header Banner */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden py-12 sm:py-16 border-b border-amber-500/20">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-24 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-xs text-slate-400">
                <Link
                  href="/"
                  className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-amber-400 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-amber-400 font-semibold">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Badge & Title */}
            <div className="space-y-2">
              {badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono font-bold tracking-wider uppercase text-amber-400">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{badge}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                {title}
              </h1>

              {subtitle && (
                <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Optional Top Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={ctaAction || (() => handleOpenJoin())}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <span>{ctaText || 'Book an Evaluation Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleOpenPortal('player')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all cursor-pointer"
              >
                Digital Player Portal
              </button>
            </div>
          </div>
        </section>

        {/* Access Protection Guard */}
        {isUnauthorized ? (
          <div className="max-w-xl mx-auto my-16 p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This module requires authenticated access to protect player records, internal evaluations, and training analytics.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleOpenPortal('player')}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer"
              >
                Sign In to Continue
              </button>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100"
              >
                Go to Login Page
              </Link>
            </div>
          </div>
        ) : isRoleRestricted ? (
          <div className="max-w-xl mx-auto my-16 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-rose-950 uppercase">
              Role Access Restricted
            </h2>
            <p className="text-xs text-rose-700 leading-relaxed">
              Your current profile role does not have authorization to view this section. Allowed roles: {allowedRoles.join(', ')}.
            </p>
          </div>
        ) : (
          /* Render Page Body */
          <div>{children}</div>
        )}

        {/* High Conversion Pre-Footer CTA Banner */}
        {showPreFooterCta && toggles.preFooterCta !== false && (
          <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-widest text-amber-800 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Official Intake 2026/27</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                YOUR FOOTBALL JOURNEY <br />
                <span className="text-amber-600">STARTS HERE</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Take the first step toward structured player development. Book a comprehensive on-pitch evaluation session at your nearest campus today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => handleOpenJoin()}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-200 hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
                >
                  <span>BOOK AN EVALUATION SESSION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenPortal('player')}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer min-h-[48px] shadow-xs text-center"
                >
                  EXPLORE DIGITAL PORTAL
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>AFC & AIFF Certified Coaching</span>
                </div>
                <span className="hidden sm:inline text-slate-300 select-none">•</span>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>3 Floodlit Campuses in Bengal</span>
                </div>
                <span className="hidden sm:inline text-slate-300 select-none">•</span>
                <span>Need-Based Scholarships Available</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Shared Public Customizable Footer */}
      {toggles.footer !== false && (
        <Footer
          onJoinClick={() => handleOpenJoin()}
          onLoginClick={() => handleOpenPortal('parent')}
        />
      )}

      {/* Mobile Ergonomic Bottom Nav */}
      <MobileBottomNav
        onJoinClick={() => handleOpenJoin()}
        onPortalClick={() => handleOpenPortal('player')}
      />

      {/* Universal Interactive Modals */}
      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultCampus={selectedCampusForTrial}
        defaultProgram={selectedProgramForTrial}
      />

      <DigitalPortalModal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        initialRole={portalInitialRole}
        onBookTrialClick={() => {
          setPortalOpen(false);
          handleOpenJoin();
        }}
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setActiveVideo(null);
        }}
        customVideo={activeVideo || undefined}
        onBookTrialClick={() => {
          setVideoModalOpen(false);
          setActiveVideo(null);
          handleOpenJoin();
        }}
      />
    </div>
  );
};
