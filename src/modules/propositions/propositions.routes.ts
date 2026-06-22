import { Router } from 'express';
import { PropositionsController } from './propositions.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const propositionsController = new PropositionsController();

router.use(requireAuth);

/**
 * @openapi
 * /api/propositions:
 *   get:
 *     tags: [Propositions]
 *     summary: Lister les propositions de service
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_categorie
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: id_competence
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtrer par compétence
 *       - in: query
 *         name: date_debut
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début minimale
 *       - in: query
 *         name: date_fin
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin maximale
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste paginée des propositions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Proposition'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => propositionsController.list(req, res));

/**
 * @openapi
 * /api/propositions/{id}:
 *   get:
 *     tags: [Propositions]
 *     summary: Obtenir une proposition par ID
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
 *         description: Proposition trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposition'
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
 *         description: Proposition introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res) => propositionsController.getById(req, res));

/**
 * @openapi
 * /api/propositions:
 *   post:
 *     tags: [Propositions]
 *     summary: Créer une proposition de service
 *     description: Le membre doit être cotisant pour créer une proposition
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [membre_competence, date_debut, date_fin, description, tarif]
 *             properties:
 *               membre_competence:
 *                 type: integer
 *                 description: ID de la compétence du membre
 *                 example: 1
 *               date_debut:
 *                 type: string
 *                 format: date
 *                 example: "2024-02-01"
 *               date_fin:
 *                 type: string
 *                 format: date
 *                 example: "2024-02-28"
 *               description:
 *                 type: string
 *                 example: "Cours de guitare pour débutants"
 *               tarif:
 *                 type: integer
 *                 description: Tarif en unités d'échange
 *                 example: 20
 *     responses:
 *       201:
 *         description: Proposition créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposition'
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
 *         description: Accès interdit (membre non cotisant)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', (req, res) => propositionsController.create(req, res));

/**
 * @openapi
 * /api/propositions/{id}:
 *   patch:
 *     tags: [Propositions]
 *     summary: Modifier une proposition
 *     description: Accessible par le créateur ou un admin
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
 *               date_debut:
 *                 type: string
 *                 format: date
 *               date_fin:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               tarif:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Proposition modifiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposition'
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
 *         description: Accès interdit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proposition introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', (req, res) => propositionsController.update(req, res));

/**
 * @openapi
 * /api/propositions/{id}:
 *   delete:
 *     tags: [Propositions]
 *     summary: Supprimer une proposition
 *     description: Accessible par le créateur ou un admin
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
 *         description: Proposition supprimée
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
 *         description: Accès interdit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proposition introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (req, res) => propositionsController.delete(req, res));

export default router;
