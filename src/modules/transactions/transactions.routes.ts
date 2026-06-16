import { Router } from 'express';
import { TransactionsController } from './transactions.controller';

const router = Router();
const transactionsController = new TransactionsController();

// Transactions routes


export default router;
