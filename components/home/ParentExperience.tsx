'use client';

import React, { useSyncExternalStore } from 'react';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import {
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Bell,
  Shield,
  ArrowRight,
  Star,
  Quote,
  ShieldCheck,
  MessageSquareQuote,
} from 'lucide-react';

interface ParentExperienceProps {
  onOpenParentPortal: () => void;
}

const getDeliverableIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'calendar':
      return Calendar;
    case 'trendingup':
    case 'chart':
      return TrendingUp;
    case 'bell':
      return Bell;
    case 'users':
      return Users;
    case 'shield':
      return Shield;
    case 'checkcircle2':
    case 'check':
    default:
      return CheckCircle2;
  }
};

export const ParentExperience: React.FC<ParentExperienceProps> = ({ onOpenParentPortal }) => {
  const deliverables = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getParentDeliverables(),
    () => AcademyDataManager.getParentDeliverables()
  );

  const testimonials = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getTestimonials(),
    () => AcademyDataManager.getTestimonials()
  );

  const parentReviews = testimonials.filter((t) => t.type === 'parent');
  const activeDeliverables = deliverables.filter((d) => d.active !== false);

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
              <Users className="w-3.5 h-3.5" />
              <span>Parent Trust & Transparent Communication</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
              A CLEAR DEVELOPMENT JOURNEY FOR EVERY PLAYER
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Parents should never have to guess about their child&apos;s football progress. At MADEN FAF, we combine structured coaching with transparent digital tracking so you can watch your child develop into a disciplined, confident athlete.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenParentPortal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>OPEN PARENT PORTAL PREVIEW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Deliverables Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {activeDeliverables.map((item, idx) => {
              const Icon = getDeliverableIcon(item.iconName);
              return (
                <div
                  key={item.id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parent Portal Reviews Showcase */}
        {parentReviews.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase text-amber-700 mb-1">
                  <MessageSquareQuote className="w-4 h-4 text-amber-500" />
                  <span>Verified Parent Feedback</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                  What Parents Say About Our Cloud Portal & Coaching
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {parentReviews.length} Verified Parent Reviews
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {parentReviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-amber-300 hover:bg-white transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: review.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{review.verifiedBadge || 'Verified Parent'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-4">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-3">
                    <img
                      src={review.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                      alt={review.author}
                      className="w-9 h-9 rounded-full object-cover border border-amber-300"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">{review.author}</div>
                      <div className="text-[10px] text-slate-500 truncate">{review.role} · {review.campus}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
