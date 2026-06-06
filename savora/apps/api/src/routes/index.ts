import { Router } from 'express';
import authRouter from './auth';
import genomeRouter from './genome';
import dietaryRouter from './dietary';
import insightsRouter from './insights';
import homeRouter from './home';
import recipeRouter from './recipe';

const router = Router();

router.use('/auth', authRouter);
router.use('/genome', genomeRouter);
router.use('/dietary', dietaryRouter);
router.use('/insights', insightsRouter);
router.use('/home', homeRouter);
router.use('/recipe', recipeRouter);

export default router;
