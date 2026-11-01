'use client';

import React, { use, Suspense } from 'react';
import { PortalContent } from '@/components/portal/PortalContent';

export default function RoleSpecificPortalPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const resolved = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Loading Portal...
          </div>
        </div>
      }
    >
      <PortalContent forcedRoleProp={resolved.role} />
    </Suspense>
  );
}
