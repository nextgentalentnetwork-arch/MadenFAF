'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { NewsManager } from '@/components/developer/NewsManager';

export default function DeveloperNewsPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="news"
      moduleTitle="News, Press Releases & Stories"
      moduleDescription="Publish academy announcements, match recap articles, player spotlights, and video interviews."
      badge="Editorial & Media"
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
      <NewsManager onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
