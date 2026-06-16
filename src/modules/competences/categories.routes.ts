import { Router } from 'express';
import { CategoriesController } from './competences.controller';

const router = Router();
const categoriesController = new CategoriesController();

function requireAdmin(req: any, res: any, next: any): void {
  if (req.auth?.profil !== 'admin') {
    res.status(403).json({ code: 403, message: 'Accès interdit' });
    return;
  }

  next();
}

router.get('/', (req, res) => categoriesController.list(req, res));
router.get('/:id', (req, res) => categoriesController.getById(req, res));
router.post('/', requireAdmin, (req, res) => categoriesController.create(req, res));
router.patch('/:id', requireAdmin, (req, res) => categoriesController.update(req, res));
router.delete('/:id', requireAdmin, (req, res) => categoriesController.delete(req, res));

export default router;
