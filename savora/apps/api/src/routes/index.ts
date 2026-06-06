import { Router } from 'express';
import authRouter from './auth';
import genomeRouter from './genome';
import dietaryRouter from './dietary';

const router = Router();

router.use('/auth', authRouter);
router.use('/genome', genomeRouter);
router.use('/dietary', dietaryRouter);

export default router;
