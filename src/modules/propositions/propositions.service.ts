import { propositionsRepository, type Proposition, type PropositionFilters, type PropositionInput, type PropositionUpdateInput } from './propositions.repository';

export class PropositionsService {
	listPropositions(filters: PropositionFilters): Promise<{ total: number; page: number; limit: number; data: Proposition[] }> {
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;

		return propositionsRepository.count(filters).then(async (total) => ({
			total,
			page,
			limit,
			data: await propositionsRepository.findAll({ ...filters, page, limit }),
		}));
	}

	getProposition(id: number): Promise<Proposition | null> {
		return propositionsRepository.findById(id);
	}

	async createProposition(memberCode: number, input: PropositionInput): Promise<Proposition> {
		const member = await propositionsRepository.findMemberCompetenceById(input.membre_competence);
		if (!member) {
			throw new Error('Compétence déclarée introuvable.');
		}

		if (member.membre !== memberCode) {
			throw new Error('Compétence déclarée invalide.');
		}

		const cotisant = await propositionsRepository.isMemberCotisant(memberCode);
		if (!cotisant) {
			throw new Error('Membre non cotisant.');
		}

		return propositionsRepository.create(input);
	}

	async updateProposition(id: number, input: PropositionUpdateInput): Promise<Proposition | null> {
		return propositionsRepository.update(id, input);
	}

	deleteProposition(id: number): Promise<boolean> {
		return propositionsRepository.delete(id);
	}

	async canEditProposition(propositionId: number, memberCode: number, isAdmin: boolean): Promise<boolean> {
		if (isAdmin) {
			return true;
		}

		const proposition = await propositionsRepository.findById(propositionId);
		if (!proposition) {
			return false;
		}

		return proposition.membre_competence.membre === memberCode;
	}
}

export const propositionsService = new PropositionsService();

