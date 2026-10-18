'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { ParentExperience } from '@/components/home/ParentExperience';
import { DigitalPortalModal } from '@/components/modals/DigitalPortalModal';
import { MessageSquareQuote, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function ParentExperiencePage() {
  const [portalOpen, setPortalOpen] = useState(false);

  return (
    <PublicPageShell
      title="Parent Experience & Reviews"
      subtitle="Complete transparency for parents: weekly WhatsApp progress notes, GPS performance stats, and safety standards."
      badge="Parent Partnership"
      breadcrumbs={[{ label: 'Parent Experience' }]}
      ctaText="Open Parent Portal"
      ctaAction={() => setPortalOpen(true)}
    >
      <div className="py-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParentExperience onOpenParentPortal={() => setPortalOpen(true)} />
        </div>
      </div>

      <DigitalPortalModal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        initialRole="parent"
      />
    </PublicPageShell>
  );
}
