import { Router, type Router as ExpressRouter } from 'express';
import { listNationalities } from '../controllers/nationality.controller';

const router: ExpressRouter = Router();

router.get('/', listNationalities);

export default router;
