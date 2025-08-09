import { Router } from 'express';
import { requireAuth } from '../middleware/required-auth-middleware';
import { requiredGroupModerator } from '../middleware/required-group-moderator-middleware';
import {
  getGroupController,
  createGroupController,
  getMyGroupController,
  updateGroupController,
  getGroupJoinedController,
} from '../controllers/group/group-index';
import { deleteGroupController } from '../controllers/group/delete-group-controller';

import groupRequestRoutes from './group-join-request-route';
import groupMemberRequestRoutes from './group-member-route';

const router = Router({ mergeParams: true });

// routes pour handle les demande d'adhesion
router.use('/:groupId/request', groupRequestRoutes);
//route pour gerer les membres
router.use('/:groupId/member', groupMemberRequestRoutes);

//get
router.get('/', getGroupController);
router.get('/my-group', requireAuth, getMyGroupController);
router.get('/group-joined', requireAuth, getGroupJoinedController);

//post
router.post('/new-group', requireAuth, createGroupController);

// update data
router.put(
  '/update-group/:groupId',
  [requireAuth, requiredGroupModerator],
  updateGroupController
);

router.delete('/:groupId/delete', [
  requireAuth,
  requiredGroupModerator,
  deleteGroupController,
]);

export default router;
