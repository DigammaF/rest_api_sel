import { Router } from 'express';
import { MembresController } from './membres.controller';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const membresController = new MembresController();

router.use(requireAuth);

/**
 * @openapi
 * /api/membres:
 *   get:
 *     tags: [Membres]
 *     summary: Lister les membres (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [cotisant, non-cotisant, actif, inactif]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des membres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
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
router.get('/', requireAdmin, (req, res) => membresController.list(req, res));

/**
 * @openapi
 * /api/membres/{code}:
 *   get:
 *     tags: [Membres]
 *     summary: Obtenir un membre par code
 *     description: Accessible par le membre lui-même ou un admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Membre trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Code invalide
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
 *         description: Membre introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:code', (req, res) => membresController.getByCode(req, res));

/**
 * @openapi
 * /api/membres/{code}/cotisations:
 *   get:
 *     tags: [Cotisations]
 *     summary: Lister les cotisations d'un membre
 *     description: Accessible par le membre lui-même ou un admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des cotisations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cotisation'
 *       400:
 *         description: Code invalide
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
 *         description: Membre introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:code/cotisations', (req, res) => membresController.listCotisations(req, res));

/**
 * @openapi
 * /api/membres/{code}/cotisations:
 *   post:
 *     tags: [Cotisations]
 *     summary: Créer une cotisation (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
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
 *             required: [annee, prix, date]
 *             properties:
 *               annee:
 *                 type: integer
 *                 example: 2024
 *               prix:
 *                 type: number
 *                 minimum: 0
 *                 example: 25.00
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Cotisation créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotisation'
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
 *         description: Membre introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:code/cotisations', requireAdmin, (req, res) => membresController.createCotisation(req, res));

/**
 * @openapi
 * /api/membres/{code}/cotisations/{id}:
 *   delete:
 *     tags: [Cotisations]
 *     summary: Supprimer une cotisation (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Cotisation supprimée
 *       400:
 *         description: Paramètres invalides
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
 *         description: Cotisation introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:code/cotisations/:id', requireAdmin, (req, res) => membresController.deleteCotisation(req, res));

/**
 * @openapi
 * /api/membres:
 *   post:
 *     tags: [Membres]
 *     summary: Créer un membre (admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenom, adresse_mail, password]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               adresse:
 *                 type: string
 *                 example: "1 rue de la Paix, 75001 Paris"
 *               date_de_naissance:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *               adresse_mail:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@mail.com"
 *               num_tel:
 *                 type: integer
 *                 example: 612345678
 *               espace_de_donnees:
 *                 type: string
 *                 nullable: true
 *               password:
 *                 type: string
 *                 example: "motdepasse123"
 *               profil:
 *                 type: string
 *                 enum: [admin, utilisateur]
 *                 example: "utilisateur"
 *     responses:
 *       201:
 *         description: Membre créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
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
router.post('/', requireAdmin, (req, res) => membresController.create(req, res));

/**
 * @openapi
 * /api/membres/{code}:
 *   patch:
 *     tags: [Membres]
 *     summary: Modifier un membre
 *     description: Accessible par le membre lui-même ou un admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
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
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               adresse:
 *                 type: string
 *               date_de_naissance:
 *                 type: string
 *                 format: date
 *               adresse_mail:
 *                 type: string
 *                 format: email
 *               num_tel:
 *                 type: integer
 *               espace_de_donnees:
 *                 type: string
 *                 nullable: true
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Membre modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
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
 *         description: Membre introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:code', (req, res) => membresController.update(req, res));

/**
 * @openapi
 * /api/membres/{code}:
 *   delete:
 *     tags: [Membres]
 *     summary: Supprimer un membre (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Membre supprimé
 *       400:
 *         description: Code invalide
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
 *         description: Membre introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:code', requireAdmin, (req, res) => membresController.delete(req, res));

export default router;
