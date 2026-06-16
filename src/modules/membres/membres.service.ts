import { membresRepository, type Cotisation, type CotisationInput, type Membre, type MembreCreateInput, type MembreResume, type MembreUpdateInput } from './membres.repository';

export class MembresService {
	listMembers(status?: string): Promise<MembreResume[]> {
		return membresRepository.findAll(status);
	}

	getMember(code: number): Promise<Membre | null> {
		return membresRepository.findByCode(code);
	}

	createMember(input: MembreCreateInput): Promise<Membre> {
		return membresRepository.create(input);
	}

	updateMember(code: number, input: MembreUpdateInput): Promise<Membre | null> {
		return membresRepository.update(code, input);
	}

	deleteMember(code: number): Promise<boolean> {
		return membresRepository.softDelete(code);
	}

	listCotisations(code: number): Promise<Cotisation[]> {
		return membresRepository.findCotisationsByMember(code);
	}

	async createCotisation(memberCode: number, input: CotisationInput): Promise<Cotisation> {
		const member = await membresRepository.findByCode(memberCode);
		if (!member) {
			throw new Error('Membre introuvable.');
		}

		return membresRepository.createCotisation(memberCode, input);
	}

	async deleteCotisation(memberCode: number, cotisationId: number): Promise<boolean> {
		const member = await membresRepository.findByCode(memberCode);
		if (!member) {
			throw new Error('Membre introuvable.');
		}

		return membresRepository.deleteCotisation(memberCode, cotisationId);
	}
}

export const membresService = new MembresService();

