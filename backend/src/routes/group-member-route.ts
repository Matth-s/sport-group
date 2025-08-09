import { Router } from 'express';
import { requiredGroupModeratorOrAdmin } from '../middleware/require-group-moderator-or-admin-middleware';
import { updateRoleController } from '../controllers/group-member/update-role-controller';
import { requireAuth } from '../middleware/required-auth-middleware';
import { requireUserInGroup } from '../middleware/require-user-in-group-middleware';
import { leaveGroupController } from '../controllers/group-member/leave-group-controller';
import { kickMemberController } from '../controllers/group-member/kick-member-controller';

const router = Router({
  mergeParams: true,
});

// l utilisateur doit être authentifié
router.use(requireAuth);

router.put(
  '/new-role/:userId',
  requiredGroupModeratorOrAdmin,
  updateRoleController
);

router.delete(
  '/kick/:userId',
  requireUserInGroup,
  kickMemberController
);

router.delete('/leave', requireUserInGroup, leaveGroupController);

export default router;
