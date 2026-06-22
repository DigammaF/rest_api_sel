import { Router } from 'express';
import { CompetencesController } from './competences.controller';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const competencesController = new CompetencesController();

router.use(requireAuth);

/**
 * @openapi
 * /api/competences:
 *   get:
 *     tags: [Compétences]
 *     summary: Lister toutes les compétences
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_categorie
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtrer par catégorie
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des compétences
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Competence'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => competencesController.list(req, res));

/**
 * @openapi
 * /api/competences/{id}:
 *   get:
 *     tags: [Compétences]
 *     summary: Obtenir une compétence par ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Compétence trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competence'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Compétence introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res) => competencesController.getById(req, res));

/**
 * @openapi
 * /api/competences:
 *   post:
 *     tags: [Compétences]
 *     summary: Créer une compétence (admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, id_categorie]
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Guitare classique"
 *               id_categorie:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Compétence créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competence'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès interdit (admin requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireAdmin, (req, res) => competencesController.create(req, res));

/**
 * @openapi
 * /api/competences/{id}:
 *   patch:
 *     tags: [Compétences]
 *     summary: Modifier une compétence (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Guitare électrique"
 *               id_categorie:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Compétence modifiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competence'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès interdit (admin requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Compétence introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', requireAdmin, (req, res) => competencesController.update(req, res));

/**
 * @openapi
 * /api/competences/{id}:
 *   delete:
 *     tags: [Compétences]
 *     summary: Supprimer une compétence (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Compétence supprimée
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès interdit (admin requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Compétence introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', requireAdmin, (req, res) => competencesController.delete(req, res));

export default router;
