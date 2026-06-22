import pool from '../../config/db';

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

export interface PropositionFilters {
	id_categorie?: number;
	id_competence?: number;
	date_debut?: string;
	date_fin?: string;
	page?: number;
	limit?: number;
}

export interface PropositionInput {
	membre_competence: number;
	date_debut: string;
	date_fin: string;
	description: string;
	tarif: number;
}

export interface PropositionUpdateInput {
	date_debut?: string;
	date_fin?: string;
	description?: string;
	tarif?: number;
}

type QueryResult = { insertId: number; affectedRows: number };

type PropositionRow = {
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
};

type PropositionListRow = PropositionRow & {
	total_rows?: number;
};

export class PropositionsRepository {
	private buildFilters(filters: PropositionFilters): { where: string; params: unknown[] } {
		const clauses: string[] = [];
		const params: unknown[] = [];

		if (typeof filters.id_categorie === 'number') {
			clauses.push('c.`id_categorie` = ?');
			params.push(filters.id_categorie);
		}

		if (typeof filters.id_competence === 'number') {
			clauses.push('c.`id` = ?');
			params.push(filters.id_competence);
		}

		if (filters.date_debut) {
			clauses.push('p.`date_debut` >= ?');
			params.push(filters.date_debut);
		}

		if (filters.date_fin) {
			clauses.push('p.`date_fin` <= ?');
			params.push(filters.date_fin);
		}

		return {
			where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
			params,
		};
	}

	private mapRow(row: PropositionRow): Proposition {
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

	private baseQuery(): string {
		return [
			'FROM `Proposition` p',
			'INNER JOIN `membre_competence` mc ON mc.`id` = p.`membre_competence`',
			'INNER JOIN `Membre` m ON m.`code` = mc.`membre`',
			'INNER JOIN `Competence` c ON c.`id` = mc.`competence`',
			'INNER JOIN `Categorie` cat ON cat.`id` = c.`id_categorie`',
		].join('\n');
	}

	async count(filters: PropositionFilters): Promise<number> {
		const { where, params } = this.buildFilters(filters);
		const [rows] = await pool.query(
			`SELECT COUNT(*) AS total ${this.baseQuery()} ${where}`,
			params,
		);
		const total = (rows as Array<{ total: number }>)[0]?.total;
		return Number(total ?? 0);
	}

	async findAll(filters: PropositionFilters): Promise<Proposition[]> {
		const { where, params } = this.buildFilters(filters);
		const limit = filters.limit ?? 20;
		const page = filters.page ?? 1;
		const offset = (page - 1) * limit;

		const [rows] = await pool.query(
			`
			SELECT
				p.\`id\` AS proposition_id,
				p.\`date_debut\`,
				p.\`date_fin\`,
				p.\`description\`,
				p.\`tarif\`,
				mc.\`id\` AS membre_competence_id,
				mc.\`membre\`,
				mc.\`description\` AS mc_description,
				c.\`id\` AS competence_id,
				c.\`description\` AS competence_description,
				c.\`id_categorie\`,
				cat.\`id\` AS categorie_id,
				cat.\`description\` AS categorie_description
			${this.baseQuery()}
			${where}
			ORDER BY p.\`date_debut\` ASC, p.\`id\` ASC
			LIMIT ? OFFSET ?
			`,
			[...params, limit, offset],
		);

		return (rows as PropositionRow[]).map((row) => this.mapRow(row));
	}

	async findById(id: number): Promise<Proposition | null> {
		const [rows] = await pool.query(
			`
			SELECT
				p.\`id\` AS proposition_id,
				p.\`date_debut\`,
				p.\`date_fin\`,
				p.\`description\`,
				p.\`tarif\`,
				mc.\`id\` AS membre_competence_id,
				mc.\`membre\`,
				mc.\`description\` AS mc_description,
				c.\`id\` AS competence_id,
				c.\`description\` AS competence_description,
				c.\`id_categorie\`,
				cat.\`id\` AS categorie_id,
				cat.\`description\` AS categorie_description
			${this.baseQuery()}
			WHERE p.\`id\` = ?
			LIMIT 1
			`,
			[id],
		);

		const row = (rows as PropositionRow[])[0];
		return row ? this.mapRow(row) : null;
	}

	async findMemberCompetenceById(id: number): Promise<{ id: number; membre: number; competence: number; description: string | null } | null> {
		const [rows] = await pool.query(
			'SELECT `id`, `membre`, `competence`, `description` FROM `membre_competence` WHERE `id` = ? LIMIT 1',
			[id],
		);

		const row = (rows as Array<{ id: number; membre: number; competence: number; description: string | null }>)[0];
		return row ?? null;
	}

	async findMemberCompetenceForMember(memberCode: number, competenceId: number): Promise<{ id: number; membre: number; competence: number; description: string | null } | null> {
		const [rows] = await pool.query(
			'SELECT `id`, `membre`, `competence`, `description` FROM `membre_competence` WHERE `membre` = ? AND `competence` = ? LIMIT 1',
			[memberCode, competenceId],
		);

		const row = (rows as Array<{ id: number; membre: number; competence: number; description: string | null }>)[0];
		return row ?? null;
	}

	async isMemberCotisant(memberCode: number): Promise<boolean> {
		const [rows] = await pool.query('SELECT `status` FROM `Membre` WHERE `code` = ? LIMIT 1', [memberCode]);
		const row = (rows as Array<{ status: string }>)[0];
		return row?.status === 'cotisant' || row?.status === 'actif';
	}

	async create(input: PropositionInput): Promise<Proposition> {
		const [result] = await pool.query(
			'INSERT INTO `Proposition` (`membre_competence`, `date_debut`, `date_fin`, `description`, `tarif`) VALUES (?, ?, ?, ?, ?)',
			[input.membre_competence, input.date_debut, input.date_fin, input.description, input.tarif],
		);

		const insertId = (result as QueryResult).insertId;
		const proposition = await this.findById(insertId);
		if (!proposition) {
			throw new Error('Erreur lors de la lecture de la proposition créée.');
		}

		return proposition;
	}

	async update(id: number, input: PropositionUpdateInput): Promise<Proposition | null> {
		const fields: string[] = [];
		const params: unknown[] = [];

		if (input.date_debut !== undefined) {
			fields.push('`date_debut` = ?');
			params.push(input.date_debut);
		}

		if (input.date_fin !== undefined) {
			fields.push('`date_fin` = ?');
			params.push(input.date_fin);
		}

		if (input.description !== undefined) {
			fields.push('`description` = ?');
			params.push(input.description);
		}

		if (input.tarif !== undefined) {
			fields.push('`tarif` = ?');
			params.push(input.tarif);
		}

		if (!fields.length) {
			return this.findById(id);
		}

		params.push(id);
		const [result] = await pool.query('UPDATE `Proposition` SET ' + fields.join(', ') + ' WHERE `id` = ?', params);
		if (!(result as QueryResult).affectedRows) {
			return null;
		}

		return this.findById(id);
	}

	async delete(id: number): Promise<boolean> {
		const [result] = await pool.query('DELETE FROM `Proposition` WHERE `id` = ?', [id]);
		return Boolean((result as QueryResult).affectedRows);
	}
}

export const propositionsRepository = new PropositionsRepository();

