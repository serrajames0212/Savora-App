import { Router } from 'express';
import authRouter from './auth';
import genomeRouter from './genome';
import dietaryRouter from './dietary';
import insightsRouter from './insights';
import homeRouter from './home';
import recipeRouter from './recipe';
import discoveryRouter from './discovery';
import favoritesRouter from './favorites';
import memoryRouter from './memory';

const router = Router();

router.use('/auth', authRouter);
router.use('/genome', genomeRouter);
router.use('/dietary', dietaryRouter);
router.use('/insights', insightsRouter);
router.use('/home', homeRouter);
router.use('/recipe', recipeRouter);
router.use('/discovery', discoveryRouter);
router.use('/favorites', favoritesRouter);
router.use('/memory', memoryRouter);

export default router;
