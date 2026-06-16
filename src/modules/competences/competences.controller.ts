import { Request, Response } from 'express';
import { competencesService } from './competences.service';

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

export class CategoriesController {
	async list(req: Request, res: Response): Promise<void> {
		try {
			const categories = await competencesService.listCategories();
			res.status(200).json(categories);
		} catch (error) {
			console.error('Erreur lors de la récupération des catégories:', error);
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

			const category = await competencesService.getCategory(id);
			if (!category) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(category);
		} catch (error) {
			console.error('Erreur lors de la récupération de la catégorie:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const { description } = req.body as { description?: string };
			if (!description?.trim()) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const category = await competencesService.createCategory(description);
			res.status(201).json(category);
		} catch (error) {
			console.error('Erreur lors de la création de la catégorie:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		try {
			const id = parseInteger(req.params.id);
			const { description } = req.body as { description?: string };

			if (id === null || !description?.trim()) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const category = await competencesService.updateCategory(id, description);
			if (!category) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(category);
		} catch (error) {
			console.error('Erreur lors de la mise à jour de la catégorie:', error);
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

			const result = await competencesService.deleteCategory(id);
			if (result === 'not_found') {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			if (result === 'conflict') {
				res.status(409).json({ code: 409, message: 'Conflit de données' });
				return;
			}

			res.status(204).send();
		} catch (error) {
			console.error('Erreur lors de la suppression de la catégorie:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}
}

export class CompetencesController {
	async list(req: Request, res: Response): Promise<void> {
		try {
			const rawCategoryId = req.query.id_categorie;
			const idCategorie = rawCategoryId === undefined ? undefined : parseInteger(rawCategoryId);
			if (rawCategoryId !== undefined && idCategorie === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const competences = await competencesService.listCompetences(idCategorie ?? undefined);
			res.status(200).json(competences);
		} catch (error) {
			console.error('Erreur lors de la récupération des compétences:', error);
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

			const competence = await competencesService.getCompetence(id);
			if (!competence) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(competence);
		} catch (error) {
			console.error('Erreur lors de la récupération de la compétence:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const { description, id_categorie } = req.body as { description?: string; id_categorie?: unknown };
			const parsedCategoryId = parseInteger(id_categorie);

			if (!description?.trim() || parsedCategoryId === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const competence = await competencesService.createCompetence(description, parsedCategoryId);
			res.status(201).json(competence);
		} catch (error) {
			console.error('Erreur lors de la création de la compétence:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		try {
			const id = parseInteger(req.params.id);
			const { description, id_categorie } = req.body as { description?: string; id_categorie?: unknown };
			const parsedCategoryId = parseInteger(id_categorie);

			if (id === null || !description?.trim() || parsedCategoryId === null) {
				res.status(400).json({ code: 400, message: 'Données invalides' });
				return;
			}

			const competence = await competencesService.updateCompetence(id, description, parsedCategoryId);
			if (!competence) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(200).json(competence);
		} catch (error) {
			console.error('Erreur lors de la mise à jour de la compétence:', error);
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

			const deleted = await competencesService.deleteCompetence(id);
			if (!deleted) {
				res.status(404).json({ code: 404, message: 'Ressource introuvable' });
				return;
			}

			res.status(204).send();
		} catch (error) {
			console.error('Erreur lors de la suppression de la compétence:', error);
			res.status(500).json({ code: 500, message: 'Erreur serveur' });
		}
	}
}