'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { SponsorsManager } from '@/components/developer/SponsorsManager';

export default function DeveloperSponsorsPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="sponsors"
      moduleTitle="Sponsors & Brand Partners"
      moduleDescription="Manage official kit partners, nutrition sponsors, medical associates, and brand partner carousels."
      badge="Partners & Kits"
    >
      {notification && (
        <div
          className={`p-4 rounded-2xl mb-4 text-xs font-bold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.text}
        </div>
      )}
      <SponsorsManager onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
