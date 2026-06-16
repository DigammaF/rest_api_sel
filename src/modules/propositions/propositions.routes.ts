import { Router } from 'express';
import { PropositionsController } from './propositions.controller';

const router = Router();
const propositionsController = new PropositionsController();

// Propositions routes

export default router;
