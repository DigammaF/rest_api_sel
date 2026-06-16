import { Router } from 'express';
import { PropositionsController } from './propositions.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const propositionsController = new PropositionsController();

router.use(requireAuth);
router.get('/', (req, res) => propositionsController.list(req, res));
router.get('/:id', (req, res) => propositionsController.getById(req, res));
router.post('/', (req, res) => propositionsController.create(req, res));
router.patch('/:id', (req, res) => propositionsController.update(req, res));
router.delete('/:id', (req, res) => propositionsController.delete(req, res));

export default router;
