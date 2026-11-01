'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { WebsiteComponentsGrid } from '@/components/developer/WebsiteComponentsGrid';

export default function DeveloperComponentsPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSelectTab = (tabId: string) => {
    // If there is a dedicated sub-route, navigate there; otherwise go to developer tab
    const routeMap: Record<string, string> = {
      trials: '/developer/trials',
      coaches: '/developer/coaches',
      programs: '/developer/programs',
      campuses: '/developer/campuses',
      fixtures: '/developer/fixtures',
      events: '/developer/events',
      news: '/developer/news',
      scholarships: '/developer/scholarships',
      sponsors: '/developer/sponsors',
      memberPortal: '/developer/donations',
      componentsGrid: '/developer/components',
    };

    if (routeMap[tabId]) {
      router.push(routeMap[tabId]);
    } else {
      router.push(`/developer?tab=${tabId}`);
    }
  };

  return (
    <DeveloperPageWrapper
      moduleId="components"
      moduleTitle="Website Components & Visibility Deck"
      moduleDescription="Visual Grid View of all 21 components across MADEN FAF. Toggle live visibility, configure layouts, or jump into dedicated module managers."
      badge="21 Modular Sections"
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
      <WebsiteComponentsGrid onSelectTab={handleSelectTab} onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
