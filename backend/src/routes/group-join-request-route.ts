import { Router } from 'express';
import { requireAuth } from '../middleware/required-auth-middleware';
import { newJoinRequestController } from '../controllers/group-member-request/new-join-request-controller';
import { requiredGroupModeratorOrAdmin } from '../middleware/require-group-moderator-or-admin-middleware';
import { acceptJoinRequestController } from '../controllers/group-member-request/accept-join-request-controller';
import { rejectJoinReject } from '../controllers/group-member-request/reject-join-request-controller';
import { deleteJoinRequestController } from '../controllers/group-member-request/delete-join-request';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  '/accept-request/:requestId',
  requiredGroupModeratorOrAdmin,
  acceptJoinRequestController
);

router.post('/join-request', newJoinRequestController);

router.delete(
  '/reject-request/:requestId',
  requiredGroupModeratorOrAdmin,
  rejectJoinReject
);

router.delete('/join-request/requestId', deleteJoinRequestController);

export default router;
