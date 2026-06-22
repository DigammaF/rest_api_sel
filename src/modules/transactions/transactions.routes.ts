import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const transactionsController = new TransactionsController();

router.use(requireAuth);

/**
 * @openapi
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Lister les transactions
 *     description: Retourne les transactions du membre connecté, ou toutes pour un admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: membre
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtrer par code membre (admin uniquement)
 *       - in: query
 *         name: etat
 *         required: false
 *         schema:
 *           type: string
 *           enum: [prevu, en_cours, terminee]
 *         description: Filtrer par état
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
 *         description: Liste paginée des transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
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
router.get('/', (req, res) => transactionsController.list(req, res));

/**
 * @openapi
 * /api/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Obtenir une transaction par ID
 *     description: Accessible par les membres impliqués ou un admin
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
 *         description: Transaction trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
 *         description: Transaction introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res) => transactionsController.getById(req, res));

/**
 * @openapi
 * /api/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Créer une transaction
 *     description: Le membre connecté crée la transaction en tant que demandeur
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [beneficiaire, duree_theorique, date_prevu]
 *             properties:
 *               acteur:
 *                 type: integer
 *                 description: Code du membre prestataire (0 = non défini)
 *                 example: 2
 *               beneficiaire:
 *                 type: integer
 *                 description: Code du membre bénéficiaire
 *                 example: 3
 *               proposition:
 *                 type: integer
 *                 nullable: true
 *                 description: ID de la proposition de service associée
 *                 example: 1
 *               duree_theorique:
 *                 type: integer
 *                 minimum: 1
 *                 description: Durée prévue en heures
 *                 example: 2
 *               date_prevu:
 *                 type: string
 *                 format: date
 *                 example: "2024-02-15"
 *     responses:
 *       201:
 *         description: Transaction créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
 */
router.post('/', (req, res) => transactionsController.create(req, res));

/**
 * @openapi
 * /api/transactions/{id}:
 *   patch:
 *     tags: [Transactions]
 *     summary: Mettre à jour une transaction
 *     description: Accessible par le bénéficiaire ou un admin
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
 *               etat:
 *                 type: string
 *                 enum: [prevu, en_cours, terminee]
 *               nb_heures:
 *                 type: integer
 *                 minimum: 1
 *                 description: Nombre d'heures réelles effectuées
 *               date_real:
 *                 type: string
 *                 format: date
 *                 description: Date de réalisation effective
 *     responses:
 *       200:
 *         description: Transaction mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
 *         description: Transaction introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', (req, res) => transactionsController.update(req, res));

export default router;
