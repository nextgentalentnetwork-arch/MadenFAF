'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { ProgramsManager } from '@/components/developer/ProgramsManager';

export default function DeveloperProgramsPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="programs"
      moduleTitle="Football Training Programs & Curriculum"
      moduleDescription="Configure Grassroots, Youth Development, Elite Performance, Girls & Women, and Goalkeeping curriculums."
      badge="Curriculum Matrix"
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
      <ProgramsManager onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
