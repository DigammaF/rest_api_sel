import { Router } from 'express';
import competencesRoutes from '../modules/competences/competences.routes';
import membresRoutes from '../modules/membres/membres.routes';
import propositionsRoutes from '../modules/propositions/propositions.routes';
import transactionsRoutes from '../modules/transactions/transactions.routes';

const router = Router();

// Protected module routes
router.use('/competences', competencesRoutes);
router.use('/membres', membresRoutes);
router.use('/propositions', propositionsRoutes);
router.use('/transactions', transactionsRoutes);

export default router;
