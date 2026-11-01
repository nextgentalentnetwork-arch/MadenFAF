'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { FixturesManager } from '@/components/developer/FixturesManager';

export default function DeveloperFixturesPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="fixtures"
      moduleTitle="Match Centre & Fixtures"
      moduleDescription="Log and update IFA Youth Leagues, AIFF Sub-Junior Tournaments, match scores, opponent crests, and Player of the Match awards."
      badge="Youth Competitions"
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
      <FixturesManager onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
