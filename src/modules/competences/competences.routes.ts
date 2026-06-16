import { Router } from 'express';
import { CompetencesController } from './competences.controller';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const competencesController = new CompetencesController();

router.use(requireAuth);
router.get('/', (req, res) => competencesController.list(req, res));
router.get('/:id', (req, res) => competencesController.getById(req, res));
router.post('/', requireAdmin, (req, res) => competencesController.create(req, res));
router.patch('/:id', requireAdmin, (req, res) => competencesController.update(req, res));
router.delete('/:id', requireAdmin, (req, res) => competencesController.delete(req, res));

export default router;
