import pool from '../../config/db';

export interface MembreResume {
	code: number;
	nom: string;
	prenom: string;
	status: string;
	solde_heure: number;
}

export interface Categorie {
	id: number;
	description: string;
}

export interface Competence {
	id: number;
	description: string;
	id_categorie: number;
	categorie?: Categorie;
}

export interface MembreCompetence {
	id: number;
	membre: number;
	competence: Competence;
	description: string | null;
}

export interface Proposition {
	id: number;
	membre_competence: MembreCompetence;
	date_debut: string;
	date_fin: string;
	description: string;
	tarif: number;
}

export interface Transaction {
	id: number;
	acteur: MembreCompetence;
	beneficiaire: MembreResume;
	proposition: Proposition | null;
	nb_heures: number | null;
	duree_theorique: number;
	etat: 'prevu' | 'en_cours' | 'terminee';
	date_prevu: string;
	date_real: string | null;
}

export interface TransactionFilters {
	membre?: number;
	etat?: 'prevu' | 'en_cours' | 'terminee';
	page?: number;
	limit?: number;
}

export interface TransactionInput {
	acteur: number;
	beneficiaire: number;
	proposition?: number | null;
	duree_theorique: number;
	date_prevu: string;
}

export interface TransactionUpdateInput {
	etat?: 'prevu' | 'en_cours' | 'terminee';
	nb_heures?: number;
	date_real?: string;
}

type QueryResult = { insertId: number; affectedRows: number };

type TransactionRow = {
	transaction_id: number;
	acteur_id: number;
	acteur_membre: number;
	acteur_description: string | null;
	acteur_competence_id: number;
	acteur_competence_description: string;
	acteur_id_categorie: number;
	acteur_categorie_id: number;
	acteur_categorie_description: string;
	beneficiaire_code: number;
	beneficiaire_nom: string;
	beneficiaire_prenom: string;
	beneficiaire_status: string;
	beneficiaire_solde: number;
	proposition_id: number | null;
	proposition_date_debut: string | null;
	proposition_date_fin: string | null;
	proposition_description: string | null;
	proposition_tarif: number | null;
	proposition_mc_id: number | null;
	proposition_mc_membre: number | null;
	proposition_mc_description: string | null;
	proposition_competence_id: number | null;
	proposition_competence_description: string | null;
	proposition_id_categorie: number | null;
	proposition_categorie_id: number | null;
	proposition_categorie_description: string | null;
	nb_heures: number | null;
	duree_theorique: number;
	etat: 'prevu' | 'en_cours' | 'terminee';
	date_prevu: string;
	date_real: string | null;
};

export class TransactionsRepository {
	private baseFrom(): string {
		return [
			'FROM `Transaction` t',
			'INNER JOIN `membre_competence` ac ON ac.`id` = t.`acteur`',
			'INNER JOIN `Competence` acp ON acp.`id` = ac.`competence`',
			'INNER JOIN `Categorie` acc ON acc.`id` = acp.`id_categorie`',
			'INNER JOIN `Membre` am ON am.`code` = ac.`membre`',
			'INNER JOIN `Membre` b ON b.`code` = t.`beneficiaire`',
			'LEFT JOIN `Proposition` p ON p.`id` = t.`proposition`',
			'LEFT JOIN `membre_competence` pmc ON pmc.`id` = p.`membre_competence`',
			'LEFT JOIN `Competence` pcp ON pcp.`id` = pmc.`competence`',
			'LEFT JOIN `Categorie` pc ON pc.`id` = pcp.`id_categorie`',
			'LEFT JOIN `Membre` pm ON pm.`code` = pmc.`membre`',
		].join('\n');
	}

	private buildFilters(filters: TransactionFilters): { where: string; params: unknown[] } {
		const clauses: string[] = [];
		const params: unknown[] = [];

		if (typeof filters.membre === 'number') {
			clauses.push('(t.`acteur` IN (SELECT `id` FROM `membre_competence` WHERE `membre` = ?) OR t.`beneficiaire` = ?)');
			params.push(filters.membre, filters.membre);
		}

		if (filters.etat) {
			clauses.push('t.`etat` = ?');
			params.push(filters.etat);
		}

		return {
			where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
			params,
		};
	}

	private mapRow(row: TransactionRow): Transaction {
		return {
			id: row.transaction_id,
			acteur: {
				id: row.acteur_id,
				membre: row.acteur_membre,
				competence: {
					id: row.acteur_competence_id,
					description: row.acteur_competence_description,
					id_categorie: row.acteur_id_categorie,
					categorie: {
						id: row.acteur_categorie_id,
						description: row.acteur_categorie_description,
					},
				},
				description: row.acteur_description,
			},
			beneficiaire: {
				code: row.beneficiaire_code,
				nom: row.beneficiaire_nom,
				prenom: row.beneficiaire_prenom,
				status: row.beneficiaire_status,
				solde_heure: row.beneficiaire_solde,
			},
			proposition: row.proposition_id === null ? null : {
				id: row.proposition_id,
				membre_competence: {
					id: row.proposition_mc_id ?? 0,
					membre: row.proposition_mc_membre ?? 0,
					competence: {
						id: row.proposition_competence_id ?? 0,
						description: row.proposition_competence_description ?? '',
						id_categorie: row.proposition_id_categorie ?? 0,
						categorie: {
							id: row.proposition_categorie_id ?? 0,
							description: row.proposition_categorie_description ?? '',
						},
					},
					description: row.proposition_mc_description,
				},
				date_debut: row.proposition_date_debut ?? '',
				date_fin: row.proposition_date_fin ?? '',
				description: row.proposition_description ?? '',
				tarif: row.proposition_tarif ?? 0,
			},
			nb_heures: row.nb_heures,
			duree_theorique: row.duree_theorique,
			etat: row.etat,
			date_prevu: row.date_prevu,
			date_real: row.date_real,
		};
	}

	async count(filters: TransactionFilters): Promise<number> {
		const { where, params } = this.buildFilters(filters);
		const [rows] = await pool.query('SELECT COUNT(*) AS total ' + this.baseFrom() + ' ' + where, params);
		return Number((rows as Array<{ total: number }>)[0]?.total ?? 0);
	}

	async findAll(filters: TransactionFilters): Promise<Transaction[]> {
		const { where, params } = this.buildFilters(filters);
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;

		const [rows] = await pool.query(
			'SELECT t.`id` AS transaction_id, ac.`id` AS acteur_id, ac.`membre` AS acteur_membre, ac.`description` AS acteur_description, acp.`id` AS acteur_competence_id, acp.`description` AS acteur_competence_description, acp.`id_categorie` AS acteur_id_categorie, acc.`id` AS acteur_categorie_id, acc.`description` AS acteur_categorie_description, b.`code` AS beneficiaire_code, b.`nom` AS beneficiaire_nom, b.`prenom` AS beneficiaire_prenom, b.`status` AS beneficiaire_status, b.`solde_heure` AS beneficiaire_solde, p.`id` AS proposition_id, p.`date_debut` AS proposition_date_debut, p.`date_fin` AS proposition_date_fin, p.`description` AS proposition_description, p.`tarif` AS proposition_tarif, pmc.`id` AS proposition_mc_id, pmc.`membre` AS proposition_mc_membre, pmc.`description` AS proposition_mc_description, pcp.`id` AS proposition_competence_id, pcp.`description` AS proposition_competence_description, pcp.`id_categorie` AS proposition_id_categorie, pc.`id` AS proposition_categorie_id, pc.`description` AS proposition_categorie_description, t.`nb_heures`, t.`duree_theorique`, t.`etat`, t.`date_prevu`, t.`date_real` ' +
			this.baseFrom() + ' ' +
			where + ' ' +
			'ORDER BY t.`id` ASC LIMIT ? OFFSET ?',
			[...params, limit, offset],
		);

		return (rows as TransactionRow[]).map((row) => this.mapRow(row));
	}

	async findById(id: number): Promise<Transaction | null> {
		const [rows] = await pool.query(
			'SELECT t.`id` AS transaction_id, ac.`id` AS acteur_id, ac.`membre` AS acteur_membre, ac.`description` AS acteur_description, acp.`id` AS acteur_competence_id, acp.`description` AS acteur_competence_description, acp.`id_categorie` AS acteur_id_categorie, acc.`id` AS acteur_categorie_id, acc.`description` AS acteur_categorie_description, b.`code` AS beneficiaire_code, b.`nom` AS beneficiaire_nom, b.`prenom` AS beneficiaire_prenom, b.`status` AS beneficiaire_status, b.`solde_heure` AS beneficiaire_solde, p.`id` AS proposition_id, p.`date_debut` AS proposition_date_debut, p.`date_fin` AS proposition_date_fin, p.`description` AS proposition_description, p.`tarif` AS proposition_tarif, pmc.`id` AS proposition_mc_id, pmc.`membre` AS proposition_mc_membre, pmc.`description` AS proposition_mc_description, pcp.`id` AS proposition_competence_id, pcp.`description` AS proposition_competence_description, pcp.`id_categorie` AS proposition_id_categorie, pc.`id` AS proposition_categorie_id, pc.`description` AS proposition_categorie_description, t.`nb_heures`, t.`duree_theorique`, t.`etat`, t.`date_prevu`, t.`date_real` ' +
			this.baseFrom() + ' ' +
			'WHERE t.`id` = ? LIMIT 1',
			[id],
		);

		const row = (rows as TransactionRow[])[0];
		return row ? this.mapRow(row) : null;
	}

	async findByParticipant(transactionId: number, memberCode: number): Promise<Transaction | null> {
		const transaction = await this.findById(transactionId);
		if (!transaction) {
			return null;
		}

		const actorMember = transaction.acteur.membre;
		const beneficiaryMember = transaction.beneficiaire.code;
		return actorMember === memberCode || beneficiaryMember === memberCode ? transaction : null;
	}

	async findMemberCompetenceById(id: number): Promise<{ id: number; membre: number; competence: number; description: string | null } | null> {
		const [rows] = await pool.query('SELECT `id`, `membre`, `competence`, `description` FROM `membre_competence` WHERE `id` = ? LIMIT 1', [id]);
		return ((rows as Array<{ id: number; membre: number; competence: number; description: string | null }>)[0] ?? null);
	}

	async findMemberCompetenceForMember(memberCode: number, competenceId: number): Promise<{ id: number; membre: number; competence: number; description: string | null } | null> {
		const [rows] = await pool.query('SELECT `id`, `membre`, `competence`, `description` FROM `membre_competence` WHERE `membre` = ? AND `competence` = ? LIMIT 1', [memberCode, competenceId]);
		return ((rows as Array<{ id: number; membre: number; competence: number; description: string | null }>)[0] ?? null);
	}

	async findMemberByCode(code: number): Promise<MembreResume | null> {
		const [rows] = await pool.query('SELECT `code`, `nom`, `prenom`, `status`, `solde_heure` FROM `Membre` WHERE `code` = ? LIMIT 1', [code]);
		return ((rows as MembreResume[])[0] ?? null);
	}

	async isMemberCotisant(memberCode: number): Promise<boolean> {
		const member = await this.findMemberByCode(memberCode);
		return member?.status === 'cotisant' || member?.status === 'actif';
	}

	async findPropositionById(id: number): Promise<Proposition | null> {
		const [rows] = await pool.query(
			'SELECT p.`id` AS proposition_id, p.`date_debut`, p.`date_fin`, p.`description`, p.`tarif`, pmc.`id` AS membre_competence_id, pmc.`membre`, pmc.`description` AS mc_description, pcp.`id` AS competence_id, pcp.`description` AS competence_description, pcp.`id_categorie`, pc.`id` AS categorie_id, pc.`description` AS categorie_description FROM `Proposition` p INNER JOIN `membre_competence` pmc ON pmc.`id` = p.`membre_competence` INNER JOIN `Competence` pcp ON pcp.`id` = pmc.`competence` INNER JOIN `Categorie` pc ON pc.`id` = pcp.`id_categorie` WHERE p.`id` = ? LIMIT 1',
			[id],
		);

		const row = (rows as Array<{
			proposition_id: number;
			date_debut: string;
			date_fin: string;
			description: string;
			tarif: number;
			membre_competence_id: number;
			membre: number;
			mc_description: string | null;
			competence_id: number;
			competence_description: string;
			id_categorie: number;
			categorie_id: number;
			categorie_description: string;
		}>)[0];
		if (!row) {
			return null;
		}

		return {
			id: row.proposition_id,
			membre_competence: {
				id: row.membre_competence_id,
				membre: row.membre,
				competence: {
					id: row.competence_id,
					description: row.competence_description,
					id_categorie: row.id_categorie,
					categorie: {
						id: row.categorie_id,
						description: row.categorie_description,
					},
				},
				description: row.mc_description,
			},
			date_debut: row.date_debut,
			date_fin: row.date_fin,
			description: row.description,
			tarif: row.tarif,
		};
	}

	async create(input: TransactionInput): Promise<Transaction> {
		const [result] = await pool.query(
			'INSERT INTO `Transaction` (`acteur`, `beneficiaire`, `proposition`, `nb_heures`, `duree_theorique`, `etat`, `date_prevu`, `date_real`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			[
				input.acteur,
				input.beneficiaire,
				input.proposition ?? null,
				null,
				input.duree_theorique,
				'prevu',
				input.date_prevu,
				null,
			],
		);

		const insertId = (result as QueryResult).insertId;
		const transaction = await this.findById(insertId);
		if (!transaction) {
			throw new Error('Erreur lors de la lecture de la transaction créée.');
		}

		return transaction;
	}

	async update(id: number, input: TransactionUpdateInput): Promise<Transaction | null> {
		const fields: string[] = [];
		const params: unknown[] = [];

		if (input.etat !== undefined) {
			fields.push('`etat` = ?');
			params.push(input.etat);
		}

		if (input.nb_heures !== undefined) {
			fields.push('`nb_heures` = ?');
			params.push(input.nb_heures);
		}

		if (input.date_real !== undefined) {
			fields.push('`date_real` = ?');
			params.push(input.date_real);
		}

		if (!fields.length) {
			return this.findById(id);
		}

		params.push(id);
		const [result] = await pool.query('UPDATE `Transaction` SET ' + fields.join(', ') + ' WHERE `id` = ?', params);
		if (!(result as QueryResult).affectedRows) {
			return null;
		}

		return this.findById(id);
	}

	async delete(id: number): Promise<boolean> {
		const [result] = await pool.query('DELETE FROM `Transaction` WHERE `id` = ?', [id]);
		return Boolean((result as QueryResult).affectedRows);
	}
}

export const transactionsRepository = new TransactionsRepository();

