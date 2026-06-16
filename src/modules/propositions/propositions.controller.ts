import { Request, Response } from 'express';
import { propositionsService } from './propositions.service';

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

export class PropositionsController {
	async list(req: Request, res: Response): Promise<void> {
		try {
			const idCategorieRaw = req.query.id_categorie;
			const idCompetenceRaw = req.query.id_competence;
			const dateDebutRaw = req.query.date_debut;
			const dateFinRaw = req.query.date_fin;
			const pageRaw = req.query.page;
			const limitRaw = req.query.limit;

			const idCategorie = idCategorieRaw === undefined ? undefined : parseInteger(idCategorieRaw);
			const idCompetence = idCompetenceRaw === undefined ? undefined : parseInteger(idCompetenceRaw);
			const dateDebut = dateDebutRaw === undefined ? undefined : parseDate(dateDebutRaw);
			const dateFin = dateFinRaw === undefined ? undefined : parseDate(dateFinRaw);
			const page = pageRaw === undefined ? undefined : parseInteger(pageRaw);
			const limit = limitRaw === undefined ? undefined : parseInteger(limitRaw);

			if (
				(idCategorieRaw !== undefined && idCategorie === null) ||
				(idCompetenceRaw !== undefined && idCompetence === null) ||
				(dateDebutRaw !== undefined && dateDebut === null) ||
				(dateFinRaw !== undefined && dateFin === null) ||
				(pageRaw !== undefined && page === null) ||
				(limitRaw !== undefined && limit === null) ||
				(page !== undefined && page !== null && page < 1) ||
				(limit !== undefined && limit !== null && (limit < 1 || limit > 100))
			) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const validatedIdCategorie = idCategorie ?? undefined;
			const validatedIdCompetence = idCompetence ?? undefined;
			const validatedDateDebut = dateDebut ?? undefined;
			const validatedDateFin = dateFin ?? undefined;
			const validatedPage = page ?? undefined;
			const validatedLimit = limit ?? undefined;

			const result = await propositionsService.listPropositions({
				id_categorie: validatedIdCategorie,
				id_competence: validatedIdCompetence,
				date_debut: validatedDateDebut,
				date_fin: validatedDateFin,
				page: validatedPage,
				limit: validatedLimit,
			});

			res.status(200).json(result);
		} catch (error) {
			console.error('Erreur lors de la récupération des propositions:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async getById(req: Request, res: Response): Promise<void> {
		try {
			const id = parseInteger(req.params.id);
			if (id === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const proposition = await propositionsService.getProposition(id);
			if (!proposition) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(proposition);
		} catch (error) {
			console.error('Erreur lors de la récupération de la proposition:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const memberCode = currentMemberCode(req);
			if (memberCode === null) {
				res.status(401).json({ code: 401, message: 'Vous n\'êtes pas autorisé à accéder à cette ressource' });
				return;
			}

			const { membre_competence, date_debut, date_fin, description, tarif } = req.body as {
				membre_competence?: unknown;
				date_debut?: unknown;
				date_fin?: unknown;
				description?: string;
				tarif?: unknown;
			};

			const parsedMemberCompetence = parseInteger(membre_competence);
			const parsedTarif = parseInteger(tarif);
			const parsedDateDebut = parseDate(date_debut);
			const parsedDateFin = parseDate(date_fin);

			if (
				parsedMemberCompetence === null ||
				parsedTarif === null ||
				!description?.trim() ||
				parsedDateDebut === null ||
				parsedDateFin === null
			) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const validatedDateDebut = parsedDateDebut;
			const validatedDateFin = parsedDateFin;

			const proposition = await propositionsService.createProposition(memberCode, {
				membre_competence: parsedMemberCompetence,
				date_debut: validatedDateDebut!,
				date_fin: validatedDateFin!,
				description: description.trim(),
				tarif: parsedTarif,
			});

			res.status(201).json(proposition);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erreur serveur';
			if (message === 'Compétence déclarée introuvable.' || message === 'Compétence déclarée invalide.' || message === 'Membre non cotisant.') {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			console.error('Erreur lors de la création de la proposition:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		try {
			const id = parseInteger(req.params.id);
			if (id === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const memberCode = currentMemberCode(req);
			const isAdmin = req.auth?.profil === 'admin';
			if (memberCode === null) {
				res.status(401).json({ code: 401, message: 'Vous n\'êtes pas autorisé à accéder à cette ressource' });
				return;
			}

			const allowed = await propositionsService.canEditProposition(id, memberCode, isAdmin);
			if (!allowed) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const { date_debut, date_fin, description, tarif } = req.body as {
				date_debut?: unknown;
				date_fin?: unknown;
				description?: string;
				tarif?: unknown;
			};

			const parsedTarif = tarif === undefined ? undefined : parseInteger(tarif);
			const parsedDateDebut = date_debut === undefined ? undefined : parseDate(date_debut);
			const parsedDateFin = date_fin === undefined ? undefined : parseDate(date_fin);

			if ((tarif !== undefined && parsedTarif === null) || (date_debut !== undefined && parsedDateDebut === null) || (date_fin !== undefined && parsedDateFin === null)) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const validatedDateDebut = parsedDateDebut;
			const validatedDateFin = parsedDateFin;
			const validatedTarif = parsedTarif;

			const proposition = await propositionsService.updateProposition(id, {
				date_debut: validatedDateDebut!,
				date_fin: validatedDateFin!,
				description: description?.trim() || undefined,
				tarif: validatedTarif ?? undefined,
			});

			if (!proposition) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(proposition);
		} catch (error) {
			console.error('Erreur lors de la mise à jour de la proposition:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async delete(req: Request, res: Response): Promise<void> {
		try {
			const id = parseInteger(req.params.id);
			if (id === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const memberCode = currentMemberCode(req);
			const isAdmin = req.auth?.profil === 'admin';
			if (memberCode === null) {
				res.status(401).json({ code: 401, message: 'Vous n\'êtes pas autorisé à accéder à cette ressource' });
				return;
			}

			const allowed = await propositionsService.canEditProposition(id, memberCode, isAdmin);
			if (!allowed) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const deleted = await propositionsService.deleteProposition(id);
			if (!deleted) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(204).send();
		} catch (error) {
			console.error('Erreur lors de la suppression de la proposition:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}
}