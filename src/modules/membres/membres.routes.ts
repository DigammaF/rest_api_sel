import { Router } from 'express';
import { MembresController } from './membres.controller';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const membresController = new MembresController();

router.use(requireAuth);
router.get('/', requireAdmin, (req, res) => membresController.list(req, res));
router.get('/:code', (req, res) => membresController.getByCode(req, res));
router.get('/:code/cotisations', (req, res) => membresController.listCotisations(req, res));
router.post('/:code/cotisations', requireAdmin, (req, res) => membresController.createCotisation(req, res));
router.delete('/:code/cotisations/:id', requireAdmin, (req, res) => membresController.deleteCotisation(req, res));
router.post('/', requireAdmin, (req, res) => membresController.create(req, res));
router.patch('/:code', (req, res) => membresController.update(req, res));
router.delete('/:code', requireAdmin, (req, res) => membresController.delete(req, res));

export default router;
