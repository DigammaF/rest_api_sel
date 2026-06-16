import { Request, Response } from 'express';
import { membresService } from './membres.service';

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

function isAdmin(req: Request): boolean {
	return req.auth?.profil === 'admin';
}

function currentMemberCode(req: Request): number | null {
	return parseInteger(req.auth?.code_membre);
}

export class MembresController {
	async list(req: Request, res: Response): Promise<void> {
		try {
			if (!isAdmin(req)) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const status = typeof req.query.status === 'string' ? req.query.status : undefined;
			if (status !== undefined && status !== 'cotisant' && status !== 'non-cotisant' && status !== 'actif' && status !== 'inactif') {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const members = await membresService.listMembers(status);
			res.status(200).json(members);
		} catch (error) {
			console.error('Erreur lors de la récupération des membres:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async getByCode(req: Request, res: Response): Promise<void> {
		try {
			const code = parseInteger(req.params.code);
			if (code === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const currentCode = currentMemberCode(req);
			if (!isAdmin(req) && currentCode !== code) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const member = await membresService.getMember(code);
			if (!member) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(member);
		} catch (error) {
			console.error('Erreur lors de la récupération du membre:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			if (!isAdmin(req)) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const {
				nom,
				prenom,
				adresse,
				date_de_naissance,
				adresse_mail,
				num_tel,
				espace_de_donnees,
				password,
				profil,
			} = req.body as {
				nom?: string;
				prenom?: string;
				adresse?: string;
				date_de_naissance?: string;
				adresse_mail?: string;
				num_tel?: unknown;
				espace_de_donnees?: string | null;
				password?: string;
				profil?: string;
			};

			const parsedTel = parseInteger(num_tel);
			if (
				!nom?.trim() ||
				!prenom?.trim() ||
				!adresse?.trim() ||
				!date_de_naissance?.trim() ||
				!adresse_mail?.trim() ||
				parsedTel === null ||
				!password?.trim() ||
				(profil !== 'admin' && profil !== 'utilisateur')
			) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const member = await membresService.createMember({
				nom,
				prenom,
				adresse,
				date_de_naissance,
				adresse_mail,
				num_tel: parsedTel,
				espace_de_donnees: espace_de_donnees ?? null,
				password,
				profil,
			});

			res.status(201).json(member);
		} catch (error) {
			console.error('Erreur lors de la création du membre:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		try {
			const code = parseInteger(req.params.code);
			if (code === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const currentCode = currentMemberCode(req);
			if (!isAdmin(req) && currentCode !== code) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const {
				nom,
				prenom,
				adresse,
				date_de_naissance,
				adresse_mail,
				num_tel,
				espace_de_donnees,
				password,
			} = req.body as {
				nom?: string;
				prenom?: string;
				adresse?: string;
				date_de_naissance?: string;
				adresse_mail?: string;
				num_tel?: unknown;
				espace_de_donnees?: string | null;
				password?: string;
			};

			const parsedTel = num_tel === undefined ? undefined : parseInteger(num_tel);
			if (parsedTel === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const member = await membresService.updateMember(code, {
				nom,
				prenom,
				adresse,
				date_de_naissance,
				adresse_mail,
				num_tel: parsedTel,
				espace_de_donnees,
				password,
			});

			if (!member) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(member);
		} catch (error) {
			console.error('Erreur lors de la mise à jour du membre:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async delete(req: Request, res: Response): Promise<void> {
		try {
			if (!isAdmin(req)) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const code = parseInteger(req.params.code);
			if (code === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const deleted = await membresService.deleteMember(code);
			if (!deleted) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(204).send();
		} catch (error) {
			console.error('Erreur lors de la suppression du membre:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async listCotisations(req: Request, res: Response): Promise<void> {
		try {
			const code = parseInteger(req.params.code);
			if (code === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const currentCode = currentMemberCode(req);
			if (!isAdmin(req) && currentCode !== code) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const cotisations = await membresService.listCotisations(code);
			res.status(200).json(cotisations);
		} catch (error) {
			console.error('Erreur lors de la récupération des cotisations:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async createCotisation(req: Request, res: Response): Promise<void> {
		try {
			if (!isAdmin(req)) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const code = parseInteger(req.params.code);
			if (code === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const { annee, prix, date } = req.body as {
				annee?: unknown;
				prix?: unknown;
				date?: unknown;
			};

			const parsedAnnee = parseInteger(annee);
			const parsedPrix = typeof prix === 'number' ? prix : typeof prix === 'string' && prix.trim() !== '' ? Number(prix) : NaN;
			const parsedDate = typeof date === 'string' && date.trim() ? date.trim() : null;

			if (
				parsedAnnee === null ||
				!Number.isFinite(parsedPrix) ||
				parsedPrix < 0 ||
				parsedDate === null
			) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const cotisation = await membresService.createCotisation(code, {
				annee: parsedAnnee,
				prix: parsedPrix,
				date: parsedDate,
			});

			res.status(201).json(cotisation);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erreur serveur';
			if (message === 'Membre introuvable.') {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			console.error('Erreur lors de la création de la cotisation:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async deleteCotisation(req: Request, res: Response): Promise<void> {
		try {
			if (!isAdmin(req)) {
				res.status(403).json({ code: 403, message: 'Accès interdit' });
				return;
			}

			const code = parseInteger(req.params.code);
			const cotisationId = parseInteger(req.params.id);
			if (code === null || cotisationId === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const deleted = await membresService.deleteCotisation(code, cotisationId);
			if (!deleted) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(204).send();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erreur serveur';
			if (message === 'Membre introuvable.') {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			console.error('Erreur lors de la suppression de la cotisation:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}
}