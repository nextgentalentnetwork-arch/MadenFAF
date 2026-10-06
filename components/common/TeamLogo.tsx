'use client';

import React from 'react';

export const TEAM_LOGO_PRESETS = [
  {
    id: 'preset:maden-faf',
    name: 'MADEN FAF Gold Crest',
    category: 'Academy',
    primaryColor: '#f59e0b',
    secondaryColor: '#0f172a',
    initial: 'M',
  },
  {
    id: 'preset:mohun-bagan',
    name: 'Mohun Bagan Youth Academy',
    category: 'I-League / ISL',
    primaryColor: '#15803d',
    secondaryColor: '#831843',
    initial: 'MB',
  },
  {
    id: 'preset:east-bengal',
    name: 'East Bengal Youth Academy',
    category: 'I-League / ISL',
    primaryColor: '#b91c1c',
    secondaryColor: '#eab308',
    initial: 'EB',
  },
  {
    id: 'preset:mohammedan-sc',
    name: 'Mohammedan SC Academy',
    category: 'I-League / ISL',
    primaryColor: '#0f172a',
    secondaryColor: '#ffffff',
    initial: 'MSC',
  },
  {
    id: 'preset:diamond-harbour',
    name: 'Diamond Harbour FC Youth',
    category: 'CFL Premier',
    primaryColor: '#0284c7',
    secondaryColor: '#fbbf24',
    initial: 'DH',
  },
  {
    id: 'preset:barrackpore',
    name: 'Barrackpore Youth FC',
    category: 'District Youth',
    primaryColor: '#1e3a8a',
    secondaryColor: '#f59e0b',
    initial: 'BY',
  },
  {
    id: 'preset:kolkata-strikers',
    name: 'Kolkata Strikers Academy',
    category: 'Youth Invitational',
    primaryColor: '#7c3aed',
    secondaryColor: '#facc15',
    initial: 'KS',
  },
  {
    id: 'preset:leninnagar',
    name: 'Leninnagar Sporting Club',
    category: 'Club Partner',
    primaryColor: '#b45309',
    secondaryColor: '#fef3c7',
    initial: 'LSC',
  },
  {
    id: 'preset:ifa-bengal',
    name: 'IFA Bengal Select XI',
    category: 'State Federation',
    primaryColor: '#ea580c',
    secondaryColor: '#fef08a',
    initial: 'IFA',
  },
];

interface TeamLogoProps {
  logo?: string;
  teamName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo,
  teamName,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 sm:w-9 sm:h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base',
  }[size];

  // 1. If custom image URL / data URL
  if (logo && (logo.startsWith('http') || logo.startsWith('data:image/'))) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden ${sizeClasses} ${className}`}
      >
        <img
          src={logo}
          alt={`${teamName} Logo`}
          className="w-full h-full object-contain p-1"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to monogram if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // 2. Check if matches preset
  const preset = TEAM_LOGO_PRESETS.find((p) => p.id === logo) ||
    TEAM_LOGO_PRESETS.find((p) => teamName.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));

  if (preset) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 rounded-xl shadow-xs border font-black uppercase tracking-tighter ${sizeClasses} ${className}`}
        style={{
          backgroundColor: preset.primaryColor,
          color: preset.secondaryColor === '#ffffff' ? '#ffffff' : preset.secondaryColor,
          borderColor: preset.secondaryColor,
        }}
        title={teamName}
      >
        <span className="font-mono font-black drop-shadow-xs">{preset.initial}</span>
      </div>
    );
  }

  // 3. Fallback monogram shield based on team name initials
  const initials = teamName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'FC';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 font-mono font-black uppercase shadow-xs ${sizeClasses} ${className}`}
      title={teamName}
    >
      <span>{initials}</span>
    </div>
  );
};
