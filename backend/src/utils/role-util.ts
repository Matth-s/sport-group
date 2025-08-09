import { MemberRole } from '@prisma/client';

export const canUpdateRole = (
  currentUserRole: MemberRole,
  targetRole: MemberRole,
  newRole: MemberRole
) => {
  if (currentUserRole === 'MEMBER') return false;
  if (!['ADMIN', 'MODERATOR'].includes(currentUserRole)) return false;
  if (
    currentUserRole === 'ADMIN' &&
    ['ADMIN', 'MODERATOR'].includes(targetRole)
  )
    return false;
  if (currentUserRole === 'ADMIN' && newRole === 'MODERATOR')
    return false;
  return true;
};
