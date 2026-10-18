'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { MadenLogo } from '@/components/ui/MadenLogo';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Shield,
  ArrowUp,
  MessageCircle,
  Twitter,
  Linkedin,
  Globe,
  ExternalLink,
  Sparkles,
  User,
} from 'lucide-react';
import {
  AcademyDataManager,
  subscribeAcademyData,
  DEFAULT_FOOTER_CONFIG,
  FooterSocialLink,
} from '@/lib/academyDataManager';

export interface FooterSocialLinksProps {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  x?: string;
  youtube?: string;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
}

export interface FooterProps {
  onJoinClick?: () => void;
  onLoginClick?: () => void;
  // Direct props for social media URLs (Facebook, Instagram, Twitter/X, etc.) from database or parent
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  emailUrl?: string;
  socialUrls?: FooterSocialLinksProps;
  socialLinks?: FooterSocialLink[];
}

// Modern Twitter / X icon
const XTwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const formatSocialUrl = (platform: string, rawUrl: string): string => {
  if (!rawUrl) return '#';
  const trimmed = rawUrl.trim();
  if (platform === 'email') {
    return trimmed.startsWith('mailto:') ? trimmed : `mailto:${trimmed}`;
  }
  if (platform === 'whatsapp') {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const digitsOnly = trimmed.replace(/[^0-9]/g, '');
    return `https://wa.me/${digitsOnly || '919830245891'}`;
  }
  if (trimmed === '#facebook' || trimmed.toLowerCase() === 'facebook') return 'https://facebook.com/madenfaf';
  if (trimmed === '#instagram' || trimmed.toLowerCase() === 'instagram') return 'https://instagram.com/madenfaf';
  if (trimmed === '#twitter' || trimmed === '#x' || trimmed.toLowerCase() === 'twitter' || trimmed.toLowerCase() === 'x') {
    return 'https://x.com/madenfaf';
  }
  if (trimmed === '#youtube' || trimmed.toLowerCase() === 'youtube') return 'https://youtube.com/@madenfaf';

  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1);
    if (platform === 'twitter' || platform === 'x') return `https://x.com/${handle}`;
    if (platform === 'instagram') return `https://instagram.com/${handle}`;
    if (platform === 'facebook') return `https://facebook.com/${handle}`;
    if (platform === 'youtube') return `https://youtube.com/@${handle}`;
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('#') && !trimmed.startsWith('mailto:')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const Footer: React.FC<FooterProps> = ({
  onJoinClick,
  onLoginClick,
  facebookUrl,
  instagramUrl,
  twitterUrl,
  xUrl,
  youtubeUrl,
  whatsappUrl,
  emailUrl,
  socialUrls,
  socialLinks,
}) => {
  const footerConfig = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getFooterConfig(),
    () => DEFAULT_FOOTER_CONFIG
  );

  // Auto-sync social media URLs directly from database on mount if not provided as explicit props
  React.useEffect(() => {
    let isMounted = true;
    if (!facebookUrl && !instagramUrl && !twitterUrl && !xUrl && !socialUrls && !socialLinks) {
      fetch('/api/academy-data?section=footerConfig')
        .then((res) => res.json())
        .then((res) => {
          if (!isMounted) return;
          if (res.success && res.data?.socialLinks && Array.isArray(res.data.socialLinks)) {
            const current = AcademyDataManager.getFooterConfig();
            const remoteSocials: FooterSocialLink[] = res.data.socialLinks;
            const hasDiff = JSON.stringify(current.socialLinks) !== JSON.stringify(remoteSocials);
            if (hasDiff) {
              AcademyDataManager.updateFooterConfig({
                socialLinks: remoteSocials,
                showSocials: res.data.showSocials ?? current.showSocials,
              });
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [facebookUrl, instagramUrl, twitterUrl, xUrl, socialUrls, socialLinks]);

  // Merge database configuration with any explicitly passed props for Facebook, Instagram, Twitter/X
  const displaySocialLinks = React.useMemo(() => {
    // Start with database config or passed socialLinks prop
    const baseLinks = (socialLinks || footerConfig.socialLinks || []).map((s) => ({ ...s }));

    // Ensure the core social media trio (Facebook, Instagram, Twitter/X) always exists
    ['facebook', 'instagram', 'twitter'].forEach((plat) => {
      const exists = baseLinks.some(
        (l) => l.platform.toLowerCase() === plat || (plat === 'twitter' && l.platform.toLowerCase() === 'x')
      );
      if (!exists) {
        const defaultItem = DEFAULT_FOOTER_CONFIG.socialLinks.find(
          (s) => s.platform.toLowerCase() === plat || (plat === 'twitter' && s.platform.toLowerCase() === 'x')
        );
        if (defaultItem) {
          baseLinks.push({ ...defaultItem });
        }
      }
    });

    const overrideMap: Record<string, string | undefined> = {
      facebook: facebookUrl || socialUrls?.facebook,
      instagram: instagramUrl || socialUrls?.instagram,
      twitter: twitterUrl || xUrl || socialUrls?.twitter || socialUrls?.x,
      x: xUrl || twitterUrl || socialUrls?.x || socialUrls?.twitter,
      youtube: youtubeUrl || socialUrls?.youtube,
      whatsapp: whatsappUrl || socialUrls?.whatsapp,
      email: emailUrl || socialUrls?.email,
    };

    // Apply explicit URL overrides if provided
    Object.entries(overrideMap).forEach(([platform, url]) => {
      if (url && url.trim()) {
        const match = baseLinks.find(
          (l) =>
            l.platform.toLowerCase() === platform ||
            (platform === 'twitter' && l.platform.toLowerCase() === 'x') ||
            (platform === 'x' && l.platform.toLowerCase() === 'twitter')
        );
        if (match) {
          match.url = url.trim();
          match.visible = true;
        } else {
          baseLinks.push({
            id: `soc-prop-${platform}`,
            platform: platform === 'x' ? 'twitter' : (platform as any),
            label:
              platform === 'twitter' || platform === 'x'
                ? 'Twitter / X'
                : platform.charAt(0).toUpperCase() + platform.slice(1),
            url: url.trim(),
            visible: true,
          });
        }
      }
    });

    return baseLinks;
  }, [
    footerConfig.socialLinks,
    socialLinks,
    facebookUrl,
    instagramUrl,
    twitterUrl,
    xUrl,
    youtubeUrl,
    whatsappUrl,
    emailUrl,
    socialUrls,
  ]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (
    e: React.MouseEvent,
    item: { href: string; actionType?: string; openInNewTab?: boolean }
  ) => {
    if (item.actionType === 'bookTrial') {
      e.preventDefault();
      onJoinClick?.();
      return;
    }

    if (item.actionType === 'portalLogin') {
      e.preventDefault();
      onLoginClick?.();
      return;
    }

    if (item.openInNewTab || item.href.startsWith('http')) {
      // Let standard link open or handle
      return;
    }

    if (item.href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(item.href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs relative overflow-hidden pb-24 lg:pb-16">
      {/* Top Banner Accent */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand Column (Feature 3: Footer Academy Icon, Tagline & Motto) */}
          <div className="lg:col-span-4 space-y-4">
            <MadenLogo
              size="md"
              variant="horizontal"
              lightText={false}
              logoType={footerConfig.logoType}
              customLogoUrl={footerConfig.customLogoUrl}
              title={footerConfig.academyTitle}
              highlight={footerConfig.academyHighlight}
              taglinePrimary={footerConfig.establishedText}
              showTaglines={true}
            />

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              {footerConfig.tagline}
            </p>

            {footerConfig.showMotto && footerConfig.motto && (
              <div className="text-amber-700 text-xs font-mono font-bold tracking-wider uppercase">
                {footerConfig.motto}
              </div>
            )}

            {/* Social Media Links (Facebook, Instagram, Twitter/X, etc. from database or props) */}
            {footerConfig.showSocials && (
              <div className="flex items-center gap-2.5 pt-1">
                {displaySocialLinks
                  .filter((s) => s.visible !== false && s.url)
                  .map((soc) => {
                    const destinationUrl = formatSocialUrl(soc.platform, soc.url);
                    const isXTwitter = soc.platform === 'twitter' || soc.platform === 'x';
                    return (
                      <a
                        key={soc.id}
                        href={destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${soc.label}: ${destinationUrl}`}
                        aria-label={soc.label}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-amber-400 active:scale-95 transition-all group"
                      >
                        {soc.platform === 'facebook' && <Facebook className="w-4 h-4" />}
                        {soc.platform === 'instagram' && <Instagram className="w-4 h-4" />}
                        {isXTwitter && <XTwitterIcon className="w-3.5 h-3.5" />}
                        {soc.platform === 'youtube' && <Youtube className="w-4 h-4" />}
                        {soc.platform === 'whatsapp' && <MessageCircle className="w-4 h-4" />}
                        {soc.platform === 'email' && <Mail className="w-4 h-4" />}
                        {soc.platform === 'linkedin' && <Linkedin className="w-4 h-4" />}
                        {!['facebook', 'instagram', 'youtube', 'whatsapp', 'twitter', 'x', 'email', 'linkedin'].includes(
                          soc.platform
                        ) && (
                          <Globe className="w-4 h-4" />
                        )}
                      </a>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Allocated Columns (Feature 4: Footer Menu Items and Column Allocation) */}
          {footerConfig.columns.map((column) => {
            const spanClass =
              column.columnSpan === 4
                ? 'lg:col-span-4'
                : column.columnSpan === 2
                ? 'lg:col-span-2'
                : 'lg:col-span-3';

            return (
              <div key={column.id} className={`${spanClass} space-y-3`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span>{column.title}</span>
                </h4>

                <ul className="space-y-2.5">
                  {column.items.map((item) => (
                    <li key={item.id}>
                      {item.actionType === 'bookTrial' ? (
                        <button
                          onClick={onJoinClick}
                          className="w-full text-left py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-95 mt-1"
                        >
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-950 text-amber-400 font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ) : item.actionType === 'portalLogin' ? (
                        <button
                          onClick={onLoginClick}
                          className="w-full text-left py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-95 mt-1"
                        >
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-100 text-amber-800 font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ) : (
                        <a
                          href={item.href}
                          target={item.openInNewTab ? '_blank' : undefined}
                          rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                          onClick={(e) => handleItemClick(e, item)}
                          className="group block hover:text-amber-600 transition-colors py-0.5"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium group-hover:text-amber-600 text-slate-700 transition-colors">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                {item.badge}
                              </span>
                            )}
                            {item.openInNewTab && (
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-600" />
                            )}
                          </div>
                          {item.desc && (
                            <span className="text-[11px] text-slate-500 block line-clamp-1 mt-0.5">
                              {item.desc}
                            </span>
                          )}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
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

          {footerConfig.showScrollToTop !== false && (
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px] text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>{footerConfig.copyrightText || `© ${new Date().getFullYear()} MADEN FAF. All Rights Reserved.`}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <Link
              href="/developer"
              className="text-slate-500 hover:text-amber-700 font-mono font-bold transition-colors underline decoration-slate-300 hover:decoration-amber-500"
            >
              Developer & Backend Console
            </Link>
          </div>
          {footerConfig.bottomNote && (
            <div className="text-slate-500">
              {footerConfig.bottomNote}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

