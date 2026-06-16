import { transactionsRepository, type Transaction, type TransactionFilters, type TransactionInput, type TransactionUpdateInput } from './transactions.repository';

export class TransactionsService {
	async listTransactions(filters: TransactionFilters, viewerCode: number, isAdmin: boolean): Promise<{ total: number; page: number; limit: number; data: Transaction[] }> {
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const effectiveFilters: TransactionFilters = { ...filters, page, limit };

		if (!isAdmin) {
			if (effectiveFilters.membre !== undefined && effectiveFilters.membre !== viewerCode) {
				throw new Error('Accès interdit');
			}

			effectiveFilters.membre = viewerCode;
		}

		const total = await transactionsRepository.count(effectiveFilters);
		const data = await transactionsRepository.findAll(effectiveFilters);

		return { total, page, limit, data };
	}

	async getTransaction(id: number, viewerCode: number, isAdmin: boolean): Promise<Transaction | null> {
		const transaction = isAdmin ? await transactionsRepository.findById(id) : await transactionsRepository.findByParticipant(id, viewerCode);
		return transaction;
	}

	async createTransaction(viewerCode: number, isAdmin: boolean, input: TransactionInput): Promise<Transaction> {
		const beneficiary = await transactionsRepository.findMemberByCode(input.beneficiaire);
		if (!beneficiary) {
			throw new Error('Bénéficiaire introuvable.');
		}

		const proposition = input.proposition !== undefined && input.proposition !== null ? await transactionsRepository.findPropositionById(input.proposition) : null;
		let actorId = input.acteur;

		if (proposition) {
			actorId = proposition.membre_competence.id;
			const propositionOwner = proposition.membre_competence.membre;
			if (!isAdmin && propositionOwner !== viewerCode) {
				throw new Error('Proposition invalide.');
			}
		} else {
			const actor = await transactionsRepository.findMemberCompetenceById(actorId);
			if (!actor) {
				throw new Error('Acteur introuvable.');
			}

			if (!isAdmin && actor.membre !== viewerCode) {
				throw new Error('Acteur invalide.');
			}
		}

		const actor = await transactionsRepository.findMemberCompetenceById(actorId);
		if (!actor) {
			throw new Error('Acteur introuvable.');
		}

		const actorCotisant = await transactionsRepository.isMemberCotisant(actor.membre);
		const beneficiaryCotisant = await transactionsRepository.isMemberCotisant(beneficiary.code);
		if (!actorCotisant || !beneficiaryCotisant) {
			throw new Error('Membre non cotisant.');
		}

		return transactionsRepository.create({
			acteur: actorId,
			beneficiaire: input.beneficiaire,
			proposition: proposition?.id ?? input.proposition ?? null,
			duree_theorique: input.duree_theorique,
			date_prevu: input.date_prevu,
		});
	}

	async updateTransaction(id: number, viewerCode: number, isAdmin: boolean, input: TransactionUpdateInput): Promise<Transaction | null> {
		const transaction = await transactionsRepository.findById(id);
		if (!transaction) {
			return null;
		}

		if (!isAdmin && transaction.acteur.membre !== viewerCode && transaction.beneficiaire.code !== viewerCode) {
			throw new Error('Accès interdit');
		}

		if (input.etat === 'terminee' && !isAdmin && transaction.beneficiaire.code !== viewerCode) {
			throw new Error('Validation réservée au bénéficiaire.');
		}

		return transactionsRepository.update(id, input);
	}
}

export const transactionsService = new TransactionsService();

