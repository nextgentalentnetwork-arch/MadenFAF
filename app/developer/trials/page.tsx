'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { TrialManager } from '@/components/developer/TrialManager';

export default function DeveloperTrialsPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="trials"
      moduleTitle="Trial Intake & Player Database"
      moduleDescription="Manage candidate registration dossiers, age category evaluations, individual/bulk WhatsApp trial passes, and trial slots pipeline."
      badge="Intake & WhatsApp Passes"
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
      <TrialManager onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
