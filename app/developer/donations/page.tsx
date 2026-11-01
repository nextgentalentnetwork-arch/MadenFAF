'use client';

import React, { useState } from 'react';
import { DeveloperPageWrapper } from '@/components/developer/DeveloperPageWrapper';
import { AdminDonationsManager } from '@/components/portal/AdminDonationsManager';
import { useAuth } from '@/lib/AuthContext';

export default function DeveloperDonationsPage() {
  const { profile } = useAuth();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <DeveloperPageWrapper
      moduleId="donations"
      moduleTitle="Foundation Donations & Member Dossiers"
      moduleDescription="Supporters & Donators portal backend: Member profiles, recurring donation plans, UPI QR verifications, 80G tax receipts, and payment ledger."
      badge="80G Tax & Donors"
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
      <AdminDonationsManager profile={profile} onNotify={handleNotify} />
    </DeveloperPageWrapper>
  );
}
