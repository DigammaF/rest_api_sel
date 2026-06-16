import { competencesRepository } from './competences.repository';
import type { Categorie, Competence } from './competences.repository';

export class CompetencesService {
	async listCategories(): Promise<Categorie[]> {
		return competencesRepository.findAllCategories();
	}

	async getCategory(id: number): Promise<Categorie | null> {
		return competencesRepository.findCategoryById(id);
	}

	async createCategory(description: string): Promise<Categorie> {
		return competencesRepository.createCategory(description.trim());
	}

	async updateCategory(id: number, description: string): Promise<Categorie | null> {
		return competencesRepository.updateCategory(id, description.trim());
	}

	async deleteCategory(id: number): Promise<'deleted' | 'not_found' | 'conflict'> {
		return competencesRepository.deleteCategory(id);
	}

	async listCompetences(idCategorie?: number): Promise<Competence[]> {
		return competencesRepository.findAllCompetences(idCategorie);
	}

	async getCompetence(id: number): Promise<Competence | null> {
		return competencesRepository.findCompetenceById(id);
	}

	async createCompetence(description: string, idCategorie: number): Promise<Competence> {
		return competencesRepository.createCompetence(description.trim(), idCategorie);
	}

	async updateCompetence(id: number, description: string, idCategorie: number): Promise<Competence | null> {
		return competencesRepository.updateCompetence(id, description.trim(), idCategorie);
	}

	async deleteCompetence(id: number): Promise<boolean> {
		return competencesRepository.deleteCompetence(id);
	}
}

export const competencesService = new CompetencesService();

