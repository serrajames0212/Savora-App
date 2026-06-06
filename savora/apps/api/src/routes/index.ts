import { Router } from 'express';
import authRouter from './auth';
import genomeRouter from './genome';
import dietaryRouter from './dietary';
import insightsRouter from './insights';
import homeRouter from './home';
import recipeRouter from './recipe';
import discoveryRouter from './discovery';

const router = Router();

router.use('/auth', authRouter);
router.use('/genome', genomeRouter);
router.use('/dietary', dietaryRouter);
router.use('/insights', insightsRouter);
router.use('/home', homeRouter);
router.use('/recipe', recipeRouter);
router.use('/discovery', discoveryRouter);

export default router;
