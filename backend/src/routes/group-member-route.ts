import { Router } from 'express';
import { requiredGroupModeratorOrAdmin } from '../middleware/require-group-moderator-or-admin-middleware';
import { updateRoleController } from '../controllers/group-member/update-role-controller';

const router = Router({
  mergeParams: true,
});

router.put(
  '/new-role/:userId',
  requiredGroupModeratorOrAdmin,
  updateRoleController
);

export default router;
