import { Router } from 'express';
import { CompetencesController } from './competences.controller';

const router = Router();
const competencesController = new CompetencesController();

// Competences routes

export default router;
