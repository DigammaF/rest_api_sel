import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const transactionsController = new TransactionsController();

router.use(requireAuth);
router.get('/', (req, res) => transactionsController.list(req, res));
router.get('/:id', (req, res) => transactionsController.getById(req, res));
router.post('/', (req, res) => transactionsController.create(req, res));
router.patch('/:id', (req, res) => transactionsController.update(req, res));


export default router;
