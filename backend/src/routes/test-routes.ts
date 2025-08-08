import { Router } from 'express';
import { auth } from '../lib/auth';
import { requireAuth } from '../middleware/required-auth-middleware';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  console.log(req.user);

  return res.status(200).json({
    message: 'ok',
  });
});

export default router;
