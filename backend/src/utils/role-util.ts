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

export const canKickMember = ({
  currentUserRole,
  targetRole,
}: {
  currentUserRole: MemberRole;
  targetRole: MemberRole;
}) => {
  // Un membre ne peut jamais kicker
  if (currentUserRole === 'MEMBER') return false;

  // Si ce n'est pas ADMIN ou MODERATOR, refus (au cas où)
  if (!['ADMIN', 'MODERATOR'].includes(currentUserRole)) return false;

  // Cas ADMIN → peut uniquement kicker un membre simple
  if (currentUserRole === 'ADMIN' && targetRole !== 'MEMBER')
    return false;

  // Cas MODERATOR → peut kicker tout le monde (y compris ADMIN)
  if (currentUserRole === 'MODERATOR') return true;

  return true;
};
