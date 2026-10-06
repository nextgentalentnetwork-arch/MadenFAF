'use client';

import React from 'react';
import { Home, Compass, MapPin, User, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  onJoinClick: () => void;
  onPortalClick: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onJoinClick,
  onPortalClick,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="p-2.5 max-w-md mx-auto pointer-events-auto">
        <nav
          aria-label="Mobile quick navigation"
          className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-xl"
        >
          {/* Home / About */}
          <button
            onClick={() => scrollTo('about')}
            className="flex flex-col items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 transition-colors min-w-[50px] min-h-[44px]"
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">About</span>
          </button>

          {/* Programs */}
          <button
            onClick={() => scrollTo('programs')}
            className="flex flex-col items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 transition-colors min-w-[50px] min-h-[44px]"
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Programs</span>
          </button>

          {/* Center High-Impact Action: Book Trial */}
          <button
            onClick={onJoinClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-200 active:scale-95 transition-all min-h-[44px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Trial</span>
          </button>

          {/* Campuses */}
          <button
            onClick={() => scrollTo('campuses')}
            className="flex flex-col items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 transition-colors min-w-[50px] min-h-[44px]"
          >
            <MapPin className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Campuses</span>
          </button>

          {/* Digital Portal */}
          <button
            onClick={onPortalClick}
            className="flex flex-col items-center justify-center p-1.5 text-slate-500 hover:text-amber-600 transition-colors min-w-[50px] min-h-[44px]"
          >
            <User className="w-4 h-4 mb-0.5 text-slate-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Portal</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
