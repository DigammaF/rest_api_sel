import { Router } from 'express';
import { MembresController } from './membres.controller';

const router = Router();
const membresController = new MembresController();

// Membres routes

export default router;
