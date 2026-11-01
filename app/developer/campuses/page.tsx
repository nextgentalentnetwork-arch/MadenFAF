'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { CampusesManager } from '@/components/developer/CampusesManager';

export default function DeveloperCampusesPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="campuses"
      moduleTitle="Campus Network & Facilities"
      moduleDescription="Manage flagship training centers in Gayeshpur, Kalyani, and Kolkata with turf specs, schedules, head coaches, and facilities."
      badge="Infrastructure & Turfs"
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
      <CampusesManager onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
