'use client';

import React, { use } from 'react';
import PortalPage from '@/app/portal/page';

export default function RoleSpecificPortalPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const resolved = use(params);
  return <PortalPage forcedRoleProp={resolved.role} />;
}
