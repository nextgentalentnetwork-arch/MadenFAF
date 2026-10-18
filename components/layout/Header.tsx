'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, User, Shield, Phone, Sparkles, MapPin, ArrowRight, LogOut, CheckCircle2, ExternalLink } from 'lucide-react';
import { MadenLogo } from '@/components/ui/MadenLogo';
import { useAuth } from '@/lib/AuthContext';
import { AcademyDataManager, subscribeAcademyData, DEFAULT_HEADER_CONFIG } from '@/lib/academyDataManager';

interface HeaderProps {
  onLoginClick: () => void;
  onJoinClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onJoinClick }) => {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const headerConfig = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getHeaderConfig(),
    () => DEFAULT_HEADER_CONFIG
  );

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = (headerConfig.menuItems || []).filter((item) => item.visible !== false);

  const handleNavClick = (href: string, openInNewTab?: boolean) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    if (openInNewTab || href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(`/${href}`);
      }
    } else {
      router.push(href);
    }
  };

  const toggleMobileSubmenu = (label: string) => {
    setOpenMobileSubmenu(prev => prev === label ? null : label);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md py-2.5 border-b border-slate-200/90 shadow-sm'
            : 'bg-white/90 backdrop-blur-md py-3.5 border-b border-slate-100 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo with clean dark text for light background & admin-customizable branding */}
          <Link href="/" className="group focus:outline-none shrink-0">
            <div className="block sm:hidden">
              <MadenLogo
                size="sm"
                variant="horizontal"
                lightText={false}
                logoType={headerConfig.logoType}
                customLogoUrl={headerConfig.customLogoUrl}
                logoIconShape={headerConfig.logoIconShape}
                title={headerConfig.academyTitle}
                highlight={headerConfig.academyHighlight}
                taglinePrimary={headerConfig.taglinePrimary}
                taglineSecondary={headerConfig.taglineSecondary}
                showTaglines={headerConfig.showTaglines}
                badgeText={headerConfig.badgeText}
                showBadge={headerConfig.showBadge}
              />
            </div>
            <div className="hidden sm:block">
              <MadenLogo
                size={headerConfig.logoSize || (isScrolled ? 'sm' : 'md')}
                variant="horizontal"
                lightText={false}
                logoType={headerConfig.logoType}
                customLogoUrl={headerConfig.customLogoUrl}
                logoIconShape={headerConfig.logoIconShape}
                title={headerConfig.academyTitle}
                highlight={headerConfig.academyHighlight}
                taglinePrimary={headerConfig.taglinePrimary}
                taglineSecondary={headerConfig.taglineSecondary}
                showTaglines={headerConfig.showTaglines}
                badgeText={headerConfig.badgeText}
                showBadge={headerConfig.showBadge}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((item) => (
              <div
                key={item.id || item.label}
                className="relative"
                onMouseEnter={() => item.sublinks && item.sublinks.length > 0 && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => handleNavClick(item.href, item.openInNewTab)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-amber-600 transition-colors py-2 group focus:outline-none cursor-pointer"
                >
                  <span className="group-hover:text-amber-600 transition-colors">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                      {item.badge}
                    </span>
                  )}
                  {item.sublinks && item.sublinks.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:rotate-180" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.sublinks && item.sublinks.length > 0 && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 w-72 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    {item.sublinks.map((sub, idx) => (
                      <button
                        key={sub.id || idx}
                        onClick={() => handleNavClick(sub.href)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item block cursor-pointer"
                      >
                        <div className="text-xs font-bold text-slate-900 group-hover/item:text-amber-600 transition-colors flex items-center justify-between">
                          <span>{sub.title}</span>
                          {sub.badge && (
                            <span className="text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-800">
                              {sub.badge}
                            </span>
                          )}
                        </div>
                        {sub.desc && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {sub.desc}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {profile?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' && (
              <Link
                href="/developer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-400/60 text-amber-400 hover:bg-slate-800 text-xs font-mono font-bold transition-all shadow-sm shadow-amber-400/10 cursor-pointer min-h-[38px]"
                title="Master Developer Backend Console"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Backend CMS</span>
              </Link>
            )}

            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 transition-all cursor-pointer min-h-[38px]"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[10px] font-black text-amber-800">
                    {profile.fullName.charAt(0)}
                  </div>
                  <span className="font-bold truncate max-w-[120px]">{profile.fullName}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                    profile.role === 'coach'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : profile.role === 'parent'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : profile.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {profile.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="text-[11px] font-bold text-slate-900 truncate">{profile.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{profile.email}</div>
                    </div>
                    {profile.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' && (
                      <Link
                        href="/developer"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold text-amber-400 bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer mb-1 shadow-xs"
                      >
                        <span>Backend Console</span>
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLoginClick();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Player/Parent Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                    <Link
                      href="/join"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>New Trial Application</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-amber-800 hover:text-amber-900 hover:bg-amber-50 transition-colors flex items-center justify-between cursor-pointer mt-1 pt-2 border-t border-slate-100"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {headerConfig.portalButtonVisible !== false && (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer min-h-[38px] shadow-xs"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{headerConfig.portalButtonText || 'LOGIN'}</span>
                  </Link>
                )}
              </div>
            )}


            {/* Join MADEN / Book Trial - Customizable CTA */}
            {headerConfig.ctaButtonVisible !== false && (
              <button
                onClick={onJoinClick}
                className="relative group overflow-hidden px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-sm shadow-amber-200 cursor-pointer min-h-[38px] flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>{headerConfig.ctaButtonText || 'JOIN MADEN'}</span>
              </button>
            )}
          </div>

          {/* Mobile Right Bar */}
          <div className="flex xl:hidden items-center gap-2">
            {/* Quick Mobile Join Button */}
            {headerConfig.ctaButtonVisible !== false && (
              <button
                onClick={onJoinClick}
                className="sm:hidden px-3 py-1.5 rounded-xl bg-amber-500 active:bg-amber-600 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-sm min-h-[38px] flex items-center gap-1"
                aria-label="Book a Trial"
              >
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>Trial</span>
              </button>
            )}

            {/* Mobile Portal Trigger */}
            <button
              onClick={onLoginClick}
              className="p-2 rounded-xl text-slate-700 bg-slate-50 border border-slate-200 text-xs font-bold min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95 shadow-xs"
              aria-label="Portal login"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-200 min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95 transition-all shadow-xs"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto animate-in fade-in duration-200 xl:hidden">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-xs">
            <MadenLogo
              size="sm"
              variant="horizontal"
              lightText={false}
              logoType={headerConfig.logoType}
              customLogoUrl={headerConfig.customLogoUrl}
              logoIconShape={headerConfig.logoIconShape}
              title={headerConfig.academyTitle}
              highlight={headerConfig.academyHighlight}
              taglinePrimary={headerConfig.taglinePrimary}
              taglineSecondary={headerConfig.taglineSecondary}
              showTaglines={headerConfig.showTaglines}
              badgeText={headerConfig.badgeText}
              showBadge={headerConfig.showBadge}
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-50 border border-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Call & Campus Contact Strip */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <a
              href="tel:+919830245891"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center gap-2 font-bold shadow-xs active:bg-slate-100"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Academy</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('#campuses');
              }}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center gap-2 font-bold shadow-xs active:bg-slate-100"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>3 Campuses</span>
            </button>
          </div>

          {/* Mobile Links List with Accordions */}
          <div className="p-4 space-y-2 flex-1">
            {navLinks.map((item) => (
              <div key={item.label} className="border-b border-slate-100 pb-2">
                <div className="flex items-center justify-between py-2">
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-left text-sm font-black uppercase tracking-wider text-slate-900 hover:text-amber-600 transition-colors py-1 flex-1"
                  >
                    {item.label}
                  </button>

                  {item.sublinks && (
                    <button
                      onClick={() => toggleMobileSubmenu(item.label)}
                      className="p-2 text-slate-400 hover:text-slate-800 rounded-lg"
                      aria-label={`Toggle ${item.label} submenu`}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSubmenu === item.label ? 'rotate-180 text-amber-600' : ''}`} />
                    </button>
                  )}
                </div>

                {item.sublinks && openMobileSubmenu === item.label && (
                  <div className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50 rounded-xl mb-2">
                    {item.sublinks.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleNavClick(sub.href)}
                        className="block w-full text-left py-1.5 text-xs text-slate-700 hover:text-amber-600"
                      >
                        <div className="font-bold text-slate-800">{sub.title}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{sub.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Drawer Sticky Bottom Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {profile ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{profile.fullName}</div>
                    <div className="text-[10px] text-amber-700 font-mono uppercase">{profile.role} · {profile.campus}</div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="p-2 text-amber-800 hover:text-amber-900 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {profile?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' && (
                  <Link
                    href="/developer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-slate-900 border border-amber-400/60 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px] shadow-sm mb-2"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Backend Command Center</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px] shadow-xs"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Open Academy Portal</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm shadow-amber-200 min-h-[46px] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{headerConfig.ctaButtonText || 'Book a Trial / Join MADEN FAF'}</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px] shadow-xs"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Sign In with Supabase</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
