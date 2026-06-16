import { Request, Response } from 'express';
import { transactionsService } from './transactions.service';

function parseInteger(value: unknown): number | null {
	if (typeof value !== 'string' && typeof value !== 'number') {
		return null;
	}

	if (value === '') {
		return null;
	}

	const parsed = Number(value);
	return Number.isInteger(parsed) ? parsed : null;
}

function parseDate(value: unknown): string | null {
	if (typeof value !== 'string' || !value.trim()) {
		return null;
	}

	return value.trim();
}

function currentMemberCode(req: Request): number | null {
	return parseInteger(req.auth?.code_membre);
}

export class TransactionsController {
	async list(req: Request, res: Response): Promise<void> {
		try {
			const viewerCode = currentMemberCode(req);
			if (viewerCode === null) {
				res.status(401).json({ code: 401, message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
				return;
			}

			const isAdmin = req.auth?.profil === 'admin';
			const membreRaw = req.query.membre;
			const etatRaw = req.query.etat;
			const pageRaw = req.query.page;
			const limitRaw = req.query.limit;

			const membre = membreRaw === undefined ? undefined : parseInteger(membreRaw);
			const etat = typeof etatRaw === 'string' ? etatRaw : undefined;
			const page = pageRaw === undefined ? undefined : parseInteger(pageRaw);
			const limit = limitRaw === undefined ? undefined : parseInteger(limitRaw);

			if (
				(membreRaw !== undefined && membre === null) ||
				(etatRaw !== undefined && etat !== 'prevu' && etat !== 'en_cours' && etat !== 'terminee') ||
				(pageRaw !== undefined && page === null) ||
				(limitRaw !== undefined && limit === null) ||
				(page !== undefined && page < 1) ||
				(limit !== undefined && (limit < 1 || limit > 100))
			) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const result = await transactionsService.listTransactions(
				{ membre, etat, page: page ?? undefined, limit: limit ?? undefined },
				viewerCode,
				isAdmin,
			);

			res.status(200).json(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erreur serveur';
			if (message === 'Accès interdit') {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			console.error('Erreur lors de la récupération des transactions:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async getById(req: Request, res: Response): Promise<void> {
		try {
			const viewerCode = currentMemberCode(req);
			if (viewerCode === null) {
				res.status(401).json({ code: 401, message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
				return;
			}

			const id = parseInteger(req.params.id);
			if (id === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const transaction = await transactionsService.getTransaction(id, viewerCode, req.auth?.profil === 'admin');
			if (!transaction) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(transaction);
		} catch (error) {
			console.error('Erreur lors de la récupération de la transaction:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const viewerCode = currentMemberCode(req);
			if (viewerCode === null) {
				res.status(401).json({ code: 401, message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
				return;
			}

			const { acteur, beneficiaire, proposition, duree_theorique, date_prevu } = req.body as {
				acteur?: unknown;
				beneficiaire?: unknown;
				proposition?: unknown;
				duree_theorique?: unknown;
				date_prevu?: unknown;
			};

			const parsedActeur = acteur === undefined ? undefined : parseInteger(acteur);
			const parsedBeneficiaire = parseInteger(beneficiaire);
			const parsedProposition = proposition === undefined || proposition === null || proposition === '' ? undefined : parseInteger(proposition);
			const parsedDuree = parseInteger(duree_theorique);
			const parsedDatePrevu = parseDate(date_prevu);

			if (
				(parsedActeur !== undefined && parsedActeur === null) ||
				parsedBeneficiaire === null ||
				(parsedProposition !== undefined && parsedProposition === null) ||
				parsedDuree === null ||
				parsedDuree < 1 ||
				parsedDatePrevu === null
			) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const transaction = await transactionsService.createTransaction(viewerCode, req.auth?.profil === 'admin', {
				acteur: parsedActeur ?? 0,
				beneficiaire: parsedBeneficiaire,
				proposition: parsedProposition ?? null,
				duree_theorique: parsedDuree,
				date_prevu: parsedDatePrevu,
			});

			res.status(201).json(transaction);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erreur serveur';
			if (message === 'Accès interdit') {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}
			if (message === 'Bénéficiaire introuvable.' || message === 'Compétence déclarée introuvable.' || message === 'Compétence déclarée invalide.' || message === 'Membre non cotisant.' || message === 'Proposition invalide.' || message === 'Acteur introuvable.' || message === 'Acteur invalide.') {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			console.error('Erreur lors de la création de la transaction:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		try {
			const viewerCode = currentMemberCode(req);
			if (viewerCode === null) {
				res.status(401).json({ code: 401, message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
				return;
			}

			const id = parseInteger(req.params.id);
			if (id === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const { etat, nb_heures, date_real } = req.body as {
				etat?: string;
				nb_heures?: unknown;
				date_real?: unknown;
			};

			const parsedEtat = etat === undefined ? undefined : (etat === 'prevu' || etat === 'en_cours' || etat === 'terminee' ? etat : null);
			const parsedNbHeures = nb_heures === undefined ? undefined : parseInteger(nb_heures);
			const parsedDateReal = date_real === undefined ? undefined : parseDate(date_real);

			if ((etat !== undefined && parsedEtat === null) || (nb_heures !== undefined && parsedNbHeures === null) || (date_real !== undefined && parsedDateReal === null) || (parsedNbHeures !== undefined && parsedNbHeures < 1)) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const transaction = await transactionsService.updateTransaction(id, viewerCode, req.auth?.profil === 'admin', {
				etat: parsedEtat ?? undefined,
				nb_heures: parsedNbHeures ?? undefined,
				date_real: parsedDateReal ?? undefined,
			});

			if (!transaction) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(transaction);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erreur serveur';
			if (message === 'Accès interdit' || message === 'Validation réservée au bénéficiaire.') {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			console.error('Erreur lors de la mise à jour de la transaction:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}
}