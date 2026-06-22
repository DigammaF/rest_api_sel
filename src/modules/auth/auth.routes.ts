import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion membre
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codeMembre:
 *                 type: string
 *                 example: "1"
 *               password:
 *                 type: string
 *                 example: "monMotDePasse"
 *               isAdmin:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Connexion réussie — utiliser le token retourné dans Authorization
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profil:
 *                   type: string
 *                   enum: [admin, utilisateur]
 *                 code_membre:
 *                   type: string
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Déconnexion
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', requireAuth, (req, res) => authController.logout(req, res));

export default router;
