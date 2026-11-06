'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { SectionBackgroundsManager } from '@/components/developer/SectionBackgroundsManager';

export default function DeveloperSectionsPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="sections"
      moduleTitle="Homepage Section Backgrounds & Visual Themes"
      moduleDescription="Customize backgrounds, overlay gradients, opacity, and text modes for every section on the homepage."
      badge="Visual Customizer"
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
      <SectionBackgroundsManager onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
