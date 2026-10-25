import { NextRequest, NextResponse } from 'next/server';
import {
  loadAuthoritativeAccountsMap,
  saveAuthoritativeAccountsMap,
  getAuthoritativeAccountByEmail,
  signRbacToken,
  verifyRbacToken,
  recordRbacSecurityAudit,
  getRbacSecurityAuditLogs,
  canSelfAssignRole,
  canUserAccessPortal,
  isValidRole,
  normalizeToTwoRoles,
  normalizePortalRoleParam,
  isProtectedAdminEmail,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
  AuthoritativeAccountRecord,
} from '@/lib/serverRbac';
import { UserRole } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase().trim();
  const rawTargetPortalRole = searchParams.get('targetPortalRole');
  const targetPortalRole = rawTargetPortalRole
    ? normalizePortalRoleParam(rawTargetPortalRole)
    : null;
  const adminView = searchParams.get('adminView') === 'true';
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : searchParams.get('token');

  try {
    const accountsMap = await loadAuthoritativeAccountsMap();

    if (adminView) {
      const tokenCheck = verifyRbacToken(token);
      const callerEmail = tokenCheck.valid
        ? tokenCheck.payload?.email
        : searchParams.get('callerEmail')?.toLowerCase().trim();
      const callerAccount = callerEmail ? accountsMap[callerEmail] : null;

      if (!callerAccount || !callerAccount.roles.includes('admin')) {
        return NextResponse.json(
          {
            success: false,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
          },
          { status: 403 }
        );
      }

      const auditLogs = await getRbacSecurityAuditLogs();
      return NextResponse.json({
        success: true,
        accounts: Object.values(accountsMap),
        auditLogs,
      });
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required for RBAC verification.' },
        { status: 400 }
      );
    }

    let account = accountsMap[email];
    if (!account && !isProtectedAdminEmail(email)) {
      const now = new Date().toISOString();
      account = {
        id: `usr-member-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'member',
        roles: ['member'],
        campus: 'Kalyani & Nadia District',
        status: 'active',
        migrationStatus: 'verified',
        migrationNotes: 'Auto-synced Member account.',
        createdAt: now,
        updatedAt: now,
      };
      accountsMap[email] = account;
      await saveAuthoritativeAccountsMap(accountsMap);
    }

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
        },
        { status: 404 }
      );
    }

    if (rawTargetPortalRole) {
      if (!targetPortalRole) {
        return NextResponse.json(
          {
            success: false,
            authorized: false,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
            authoritativeProfile: account,
          },
          { status: 403 }
        );
      }
      const allowed = canUserAccessPortal(account.role, targetPortalRole, account.roles);
      if (!allowed) {
        await recordRbacSecurityAudit({
          eventType: 'UNAUTHORIZED_PORTAL_ATTEMPT',
          actorEmail: account.email,
          actorRole: account.role,
          targetPortalOrRole: targetPortalRole,
          details: `Blocked direct URL/API access to '${targetPortalRole}' portal by '${account.role}' account.`,
        });
        return NextResponse.json(
          {
            success: false,
            authorized: false,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
            authoritativeProfile: account,
          },
          { status: 403 }
        );
      }
    }

    const freshToken = signRbacToken({
      id: account.id,
      email: account.email,
      role: account.role,
      roles: account.roles,
    });

    return NextResponse.json({
      success: true,
      authorized: true,
      authoritativeProfile: account,
      rbacToken: freshToken,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'RBAC server verification error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const accountsMap = await loadAuthoritativeAccountsMap();

    // 1. REGISTRATION: Public users can only register as 'member'. Never overwrite or downgrade an Admin account.
    if (action === 'register') {
      const email = (body.email || '').toLowerCase().trim();
      const fullName = (body.fullName || '').trim();
      const requestedRole = body.requestedRole ?? 'member';
      const uid = body.uid || `usr-${Date.now()}`;

      if (!email || !fullName) {
        return NextResponse.json(
          { success: false, error: 'Email and full name are required for registration.' },
          { status: 400 }
        );
      }

      if (!canSelfAssignRole(requestedRole)) {
        await recordRbacSecurityAudit({
          eventType: 'SELF_ROLE_MODIFICATION_BLOCKED',
          actorEmail: email,
          targetPortalOrRole: String(requestedRole),
          details: `Blocked attempt to self-register with privileged or invalid role '${String(requestedRole)}'. Only 'member' is permitted for self-registration.`,
        });
        return NextResponse.json(
          {
            success: false,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
          },
          { status: 403 }
        );
      }

      const now = new Date().toISOString();

      // If a protected Admin account registers on the Member Portal form, preserve Admin role AND grant Member portal access
      if (isProtectedAdminEmail(email) || accountsMap[email]?.role === 'admin') {
        const existingAdmin = accountsMap[email];
        const adminRecord: AuthoritativeAccountRecord = {
          id: existingAdmin?.id || uid,
          email,
          fullName: fullName || existingAdmin?.fullName || email.split('@')[0],
          role: 'admin',
          roles: ['admin', 'member'],
          approvedByAdmin: 'system',
          campus: body.campus || existingAdmin?.campus || 'All Campuses (Headquarters)',
          avatarUrl: existingAdmin?.avatarUrl,
          status: 'active',
          migrationStatus: 'verified',
          migrationNotes:
            'Verified Executive Admin account with Member Donation & Support Portal access enabled.',
          createdAt: existingAdmin?.createdAt || now,
          updatedAt: now,
        };

        accountsMap[email] = adminRecord;
        await saveAuthoritativeAccountsMap(accountsMap);

        const rbacToken = signRbacToken({
          id: adminRecord.id,
          email: adminRecord.email,
          role: adminRecord.role,
          roles: adminRecord.roles,
        });

        return NextResponse.json({
          success: true,
          authoritativeProfile: adminRecord,
          rbacToken,
        });
      }

      const assignedRole: UserRole = 'member';
      const existingMember = accountsMap[email];
      const newRecord: AuthoritativeAccountRecord = {
        id: existingMember?.id || uid,
        email,
        fullName: fullName || existingMember?.fullName || email.split('@')[0],
        role: assignedRole,
        roles: [assignedRole],
        campus: body.campus || existingMember?.campus || 'Kalyani & Nadia District',
        status: 'active',
        migrationStatus: 'verified',
        migrationNotes: `Registered via MADEN FAF Portal with locked Member (Donation & Support Portal) role.`,
        createdAt: existingMember?.createdAt || now,
        updatedAt: now,
      };

      accountsMap[email] = newRecord;
      await saveAuthoritativeAccountsMap(accountsMap);

      await recordRbacSecurityAudit({
        eventType: 'REGISTRATION',
        actorEmail: email,
        actorRole: assignedRole,
        targetPortalOrRole: assignedRole,
        details: `Registered Member account authorized for the Member Donation & Support Portal.`,
      });

      const rbacToken = signRbacToken({
        id: newRecord.id,
        email: newRecord.email,
        role: newRecord.role,
        roles: newRecord.roles,
      });

      return NextResponse.json({
        success: true,
        authoritativeProfile: newRecord,
        rbacToken,
      });
    }

    // 2. LOGIN VERIFICATION: Never trust browser role; verify against server store & target portal
    if (action === 'loginVerify') {
      const email = (body.email || '').toLowerCase().trim();
      const rawRequestedPortalRole = body.requestedPortalRole;
      const requestedPortalRole =
        rawRequestedPortalRole && rawRequestedPortalRole !== 'auto'
          ? normalizePortalRoleParam(rawRequestedPortalRole)
          : 'auto';

      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email is required for login verification.' },
          { status: 400 }
        );
      }

      let account = accountsMap[email];

      // If account exists in Supabase Auth metadata (passed when a prior Supabase user logs in), migrate it safely into 'member' or 'admin'
      if (!account && body.supabaseUser) {
        const sbMeta = body.supabaseUser.user_metadata || {};
        const candidate = sbMeta.portal_role || sbMeta.maden_role || sbMeta.role;
        const migratedRole: UserRole = isProtectedAdminEmail(email)
          ? 'admin'
          : normalizeToTwoRoles(candidate);
        const now = new Date().toISOString();
        account = {
          id: body.supabaseUser.id || `usr-${Date.now()}`,
          email,
          fullName: sbMeta.full_name || email.split('@')[0],
          role: migratedRole,
          roles: migratedRole === 'admin' ? ['admin', 'member'] : ['member'],
          approvedByAdmin: migratedRole === 'admin' ? 'system' : undefined,
          campus: sbMeta.campus || 'Kalyani & Nadia District',
          status: 'active',
          migrationStatus: 'verified',
          migrationNotes: `Migrated from authenticated Supabase user metadata to '${migratedRole}'.`,
          createdAt: now,
          updatedAt: now,
        };
        accountsMap[email] = account;
        await saveAuthoritativeAccountsMap(accountsMap);
      }

      // If a registered Member is signing in and the server cache was reset, restore as 'member' (never 'admin')
      if (!account && !isProtectedAdminEmail(email) && requestedPortalRole !== 'admin') {
        const now = new Date().toISOString();
        account = {
          id: `usr-member-${Date.now()}`,
          email,
          fullName: body.fullName || email.split('@')[0],
          role: 'member',
          roles: ['member'],
          campus: 'Kalyani & Nadia District',
          status: 'active',
          migrationStatus: 'verified',
          migrationNotes: 'Verified Member account restored on sign-in.',
          createdAt: now,
          updatedAt: now,
        };
        accountsMap[email] = account;
        await saveAuthoritativeAccountsMap(accountsMap);
      }

      if (!account) {
        return NextResponse.json(
          {
            success: false,
            error:
              'No registered account found for this email address. Please register a Member account first.',
          },
          { status: 401 }
        );
      }

      if (account.status === 'suspended') {
        return NextResponse.json(
          {
            success: false,
            error: 'Access Denied: This account has been suspended by Academy Administration.',
          },
          { status: 403 }
        );
      }

      // If user selected or attempted to log into a specific portal role, enforce strict role match!
      if (rawRequestedPortalRole && rawRequestedPortalRole !== 'auto') {
        if (!requestedPortalRole) {
          return NextResponse.json(
            {
              success: false,
              authorized: false,
              registeredRole: account.role,
              error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
            },
            { status: 403 }
          );
        }
        const isAllowed = canUserAccessPortal(
          account.role,
          requestedPortalRole,
          account.roles
        );
        if (!isAllowed) {
          await recordRbacSecurityAudit({
            eventType: 'UNAUTHORIZED_PORTAL_ATTEMPT',
            actorEmail: account.email,
            actorRole: account.role,
            targetPortalOrRole: requestedPortalRole,
            details: `Unauthorized login attempt: Account registered as '${account.role}' attempted to sign in to '${requestedPortalRole}' portal.`,
          });
          return NextResponse.json(
            {
              success: false,
              authorized: false,
              registeredRole: account.role,
              error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
            },
            { status: 403 }
          );
        }
      }

      await recordRbacSecurityAudit({
        eventType: 'LOGIN_SUCCESS',
        actorEmail: account.email,
        actorRole: account.role,
        targetPortalOrRole: account.role,
        details: `Verified login for '${account.email}' with authoritative role '${account.role}'.`,
      });

      const rbacToken = signRbacToken({
        id: account.id,
        email: account.email,
        role: account.role,
        roles: account.roles,
      });

      return NextResponse.json({
        success: true,
        authorized: true,
        authoritativeProfile: account,
        rbacToken,
      });
    }

    // 3. SESSION & TAMPER VALIDATION: Detect localStorage / request role manipulation & URL changes
    if (action === 'validateSession') {
      const email = (body.email || '').toLowerCase().trim();
      const clientRole = body.clientRole;
      const clientRoles: string[] | undefined = body.clientRoles;
      const rawTargetPortalRole = body.targetPortalRole;
      const targetPortalRole = rawTargetPortalRole
        ? normalizePortalRoleParam(rawTargetPortalRole)
        : null;
      const rbacToken = body.rbacToken;

      let account = accountsMap[email] || (await getAuthoritativeAccountByEmail(email));

      // If account is not yet in accountsMap, check if the client holds a valid server-signed HMAC rbacToken
      const tokenCheck = rbacToken ? verifyRbacToken(rbacToken) : { valid: false };
      if (!account && tokenCheck.valid && tokenCheck.payload?.email === email) {
        const verifiedRole: UserRole = isProtectedAdminEmail(email)
          ? 'admin'
          : normalizeToTwoRoles(tokenCheck.payload.role);
        const now = new Date().toISOString();
        account = {
          id: tokenCheck.payload.id || `usr-${Date.now()}`,
          email,
          fullName: body.fullName || email.split('@')[0],
          role: verifiedRole,
          roles: verifiedRole === 'admin' ? ['admin', 'member'] : ['member'],
          approvedByAdmin: verifiedRole === 'admin' ? 'system' : undefined,
          campus: 'Kalyani & Nadia District',
          status: 'active',
          migrationStatus: 'verified',
          migrationNotes: 'Restored from verified HMAC RBAC session token.',
          createdAt: now,
          updatedAt: now,
        };
        accountsMap[email] = account;
        await saveAuthoritativeAccountsMap(accountsMap);
      }

      // If still not found and user is a non-admin Member session, register as 'member' (never 'admin')
      if (!account && email && !isProtectedAdminEmail(email)) {
        const now = new Date().toISOString();
        account = {
          id: body.uid || `usr-member-${Date.now()}`,
          email,
          fullName: body.fullName || email.split('@')[0],
          role: 'member',
          roles: ['member'],
          campus: 'Kalyani & Nadia District',
          status: 'active',
          migrationStatus: 'verified',
          migrationNotes: 'Auto-synced Member session into authoritative store.',
          createdAt: now,
          updatedAt: now,
        };
        accountsMap[email] = account;
        await saveAuthoritativeAccountsMap(accountsMap);
      }

      if (!account) {
        return NextResponse.json(
          {
            success: false,
            authorized: false,
            tampered: true,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
          },
          { status: 401 }
        );
      }

      // Check if a non-admin client tampered with role or roles array in localStorage to claim 'admin'
      const isAccountAdmin =
        account.role === 'admin' || account.roles.includes('admin');
      const clientClaimsAdmin =
        (typeof clientRole === 'string' && clientRole.trim().toLowerCase() === 'admin') ||
        (Array.isArray(clientRoles) &&
          clientRoles.some(
            (r) => typeof r === 'string' && r.trim().toLowerCase() === 'admin'
          ));

      if (!isAccountAdmin && clientClaimsAdmin) {
        await recordRbacSecurityAudit({
          eventType: 'ROLE_TAMPER_BLOCKED',
          actorEmail: account.email,
          actorRole: account.role,
          targetPortalOrRole: String(clientRole || rawTargetPortalRole || 'admin'),
          details: `Blocked client-side privilege escalation attempt for '${account.email}'. Client claimed role='${String(
            clientRole
          )}' roles='${JSON.stringify(clientRoles)}', server authoritative role='${account.role}'.`,
        });

        const freshToken = signRbacToken({
          id: account.id,
          email: account.email,
          role: account.role,
          roles: account.roles,
        });

        return NextResponse.json(
          {
            success: false,
            authorized: false,
            tampered: true,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
            authoritativeProfile: account,
            rbacToken: freshToken,
          },
          { status: 403 }
        );
      }

      // Check target portal authorization if specified
      if (rawTargetPortalRole) {
        if (!targetPortalRole) {
          return NextResponse.json(
            {
              success: false,
              authorized: false,
              tampered: false,
              error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
              authoritativeProfile: account,
            },
            { status: 403 }
          );
        }
        const allowed = canUserAccessPortal(
          account.role,
          targetPortalRole,
          account.roles
        );
        if (!allowed) {
          await recordRbacSecurityAudit({
            eventType: 'UNAUTHORIZED_PORTAL_ATTEMPT',
            actorEmail: account.email,
            actorRole: account.role,
            targetPortalOrRole: targetPortalRole,
            details: `Blocked unauthorized portal access: '${account.email}' (${account.role}) attempted to access '${targetPortalRole}' portal.`,
          });

          return NextResponse.json(
            {
              success: false,
              authorized: false,
              tampered: false,
              error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
              authoritativeProfile: account,
            },
            { status: 403 }
          );
        }
      }

      const freshToken = signRbacToken({
        id: account.id,
        email: account.email,
        role: account.role,
        roles: account.roles,
      });

      return NextResponse.json({
        success: true,
        authorized: true,
        tampered: false,
        authoritativeProfile: account,
        rbacToken: freshToken,
      });
    }

    // 4. BLOCK SELF-ROLE MODIFICATION ATTEMPTS
    if (action === 'selfModifyRoleAttempt') {
      const email = (body.email || 'unknown').toLowerCase().trim();
      const attemptedRole = String(body.attemptedRole || 'unknown');
      await recordRbacSecurityAudit({
        eventType: 'SELF_ROLE_MODIFICATION_BLOCKED',
        actorEmail: email,
        targetPortalOrRole: attemptedRole,
        details: `Denied user attempt to self-assign or switch to role '${attemptedRole}'.`,
      });
      return NextResponse.json(
        {
          success: false,
          error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
        },
        { status: 403 }
      );
    }

    // 5. ADMIN-ONLY ROLE ASSIGNMENT (Strictly between 'member' and 'admin'; protected Admins cannot be downgraded)
    if (action === 'adminUpdateUserRoles') {
      const adminToken = body.adminToken;
      const callerEmail = (body.adminEmail || '').toLowerCase().trim();
      const targetEmail = (body.targetEmail || '').toLowerCase().trim();
      const newPrimaryRole: UserRole = body.newPrimaryRole;
      const newAuthorizedRoles: UserRole[] = body.newAuthorizedRoles;

      const tokenVerification = verifyRbacToken(adminToken);
      const verifiedAdminEmail = tokenVerification.valid
        ? tokenVerification.payload?.email
        : callerEmail;

      const adminAccount = verifiedAdminEmail ? accountsMap[verifiedAdminEmail] : null;
      if (!adminAccount || !adminAccount.roles.includes('admin')) {
        await recordRbacSecurityAudit({
          eventType: 'SELF_ROLE_MODIFICATION_BLOCKED',
          actorEmail: callerEmail || 'unauthenticated',
          targetPortalOrRole: 'adminUpdateUserRoles',
          details: `Unauthorized non-admin attempt to modify user roles for '${targetEmail}'.`,
        });
        return NextResponse.json(
          {
            success: false,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
          },
          { status: 403 }
        );
      }

      const targetAccount = accountsMap[targetEmail];
      if (!targetAccount) {
        return NextResponse.json(
          { success: false, error: `Target account '${targetEmail}' not found.` },
          { status: 404 }
        );
      }

      if (!isValidRole(newPrimaryRole)) {
        return NextResponse.json(
          { success: false, error: 'Only Member and Admin roles are permitted.' },
          { status: 400 }
        );
      }

      if (isProtectedAdminEmail(targetEmail) && newPrimaryRole !== 'admin') {
        return NextResponse.json(
          {
            success: false,
            error: 'Primary Admin accounts are protected and cannot be downgraded.',
          },
          { status: 403 }
        );
      }

      const sanitizedRoles: UserRole[] = Array.isArray(newAuthorizedRoles)
        ? Array.from(
            new Set([
              newPrimaryRole,
              ...newAuthorizedRoles.filter((r): r is UserRole => isValidRole(r)),
            ])
          )
        : [newPrimaryRole];

      const updatedAccount: AuthoritativeAccountRecord = {
        ...targetAccount,
        role: newPrimaryRole,
        roles: sanitizedRoles,
        status: 'active',
        migrationStatus: 'verified',
        migrationNotes: `Verified & authorized by Admin (${adminAccount.email}) on ${new Date().toLocaleDateString()}. Authorized roles: [${sanitizedRoles.join(', ')}].`,
        approvedByAdmin: adminAccount.email,
        updatedAt: new Date().toISOString(),
      };

      accountsMap[targetEmail] = updatedAccount;
      await saveAuthoritativeAccountsMap(accountsMap);

      await recordRbacSecurityAudit({
        eventType: 'ADMIN_ROLE_ASSIGNMENT',
        actorEmail: adminAccount.email,
        actorRole: 'admin',
        targetPortalOrRole: `${targetEmail} -> [${sanitizedRoles.join(', ')}]`,
        details: `Admin '${adminAccount.email}' updated '${targetEmail}' primary role to '${newPrimaryRole}' and authorized roles to [${sanitizedRoles.join(', ')}].`,
      });

      const auditLogs = await getRbacSecurityAuditLogs();

      return NextResponse.json({
        success: true,
        updatedAccount,
        accounts: Object.values(accountsMap),
        auditLogs,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported RBAC action.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'RBAC server processing error' },
      { status: 500 }
    );
  }
}
