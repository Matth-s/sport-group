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

import groupMemberRoutes from './group-member-request-route';

const router = Router({ mergeParams: true });

// routes pour handle les demande d'adhesion
router.use('/:groupId/request', groupMemberRoutes);

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

export default router;
