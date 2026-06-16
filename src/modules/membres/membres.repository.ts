import pool from '../../config/db';

export interface MembreResume {
	code: number;
	nom: string;
	prenom: string;
	status: string;
	solde_heure: number;
}

export interface Membre extends MembreResume {
	adresse: string;
	date_de_naissance: string;
	adresse_mail: string;
	num_tel: number;
	espace_de_donnees: string | null;
	profil: string;
}

export interface MembreCreateInput {
	nom: string;
	prenom: string;
	adresse: string;
	date_de_naissance: string;
	adresse_mail: string;
	num_tel: number;
	espace_de_donnees?: string | null;
	password: string;
	profil: string;
}

export interface MembreUpdateInput {
	nom?: string;
	prenom?: string;
	adresse?: string;
	date_de_naissance?: string;
	adresse_mail?: string;
	num_tel?: number;
	espace_de_donnees?: string | null;
	password?: string;
}

export interface Cotisation {
	id: number;
	membre: number;
	annee: number;
	prix: number;
	date: string;
}

export interface CotisationInput {
	annee: number;
	prix: number;
	date: string;
}

type QueryResult = { insertId: number; affectedRows: number };

export class MembresRepository {
	private normalizeStatusForQuery(status: string): string {
		if (status === 'cotisant') {
			return 'actif';
		}

		if (status === 'non-cotisant') {
			return 'inactif';
		}

		return status;
	}

	async findAll(status?: string): Promise<MembreResume[]> {
		const params: unknown[] = [];
		let sql = 'SELECT `code`, `nom`, `prenom`, `status`, `solde_heure` FROM `Membre`';

		if (status) {
			sql += ' WHERE `status` = ?';
			params.push(this.normalizeStatusForQuery(status));
		}

		sql += ' ORDER BY `code` ASC';

		const [rows] = await pool.query(sql, params);
		return rows as MembreResume[];
	}

	async findByCode(code: number): Promise<Membre | null> {
		const [rows] = await pool.query(
			'SELECT `code`, `nom`, `prenom`, `adresse`, `date_de_naissance`, `adresse_mail`, `num_tel`, `espace_de_donnees`, `solde_heure`, `status`, `profil` FROM `Membre` WHERE `code` = ? LIMIT 1',
			[code],
		);

		return ((rows as Membre[])[0] ?? null);
	}

	async create(input: MembreCreateInput): Promise<Membre> {
		const [result] = await pool.query(
			'INSERT INTO `Membre` (`nom`, `prenom`, `adresse`, `date_de_naissance`, `adresse_mail`, `num_tel`, `espace_de_donnees`, `password`, `profil`, `status`, `solde_heure`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[
				input.nom,
				input.prenom,
				input.adresse,
				input.date_de_naissance,
				input.adresse_mail,
				input.num_tel,
				input.espace_de_donnees ?? null,
				input.password,
				input.profil,
				'inactif',
				0,
			],
		);

		const insertId = (result as QueryResult).insertId;
		const member = await this.findByCode(insertId);
		if (!member) {
			throw new Error('Erreur lors de la lecture du membre créé.');
		}

		return member;
	}

	async update(code: number, input: MembreUpdateInput): Promise<Membre | null> {
		const fields: string[] = [];
		const params: unknown[] = [];

		if (input.nom !== undefined) {
			fields.push('`nom` = ?');
			params.push(input.nom);
		}

		if (input.prenom !== undefined) {
			fields.push('`prenom` = ?');
			params.push(input.prenom);
		}

		if (input.adresse !== undefined) {
			fields.push('`adresse` = ?');
			params.push(input.adresse);
		}

		if (input.date_de_naissance !== undefined) {
			fields.push('`date_de_naissance` = ?');
			params.push(input.date_de_naissance);
		}

		if (input.adresse_mail !== undefined) {
			fields.push('`adresse_mail` = ?');
			params.push(input.adresse_mail);
		}

		if (input.num_tel !== undefined) {
			fields.push('`num_tel` = ?');
			params.push(input.num_tel);
		}

		if (input.espace_de_donnees !== undefined) {
			fields.push('`espace_de_donnees` = ?');
			params.push(input.espace_de_donnees);
		}

		if (input.password !== undefined) {
			fields.push('`password` = ?');
			params.push(input.password);
		}

		if (!fields.length) {
			return this.findByCode(code);
		}

		params.push(code);
		const [result] = await pool.query(`UPDATE \`Membre\` SET ${fields.join(', ')} WHERE \`code\` = ?`, params);
		if (!(result as QueryResult).affectedRows) {
			return null;
		}

		return this.findByCode(code);
	}

	async softDelete(code: number): Promise<boolean> {
		const [result] = await pool.query('UPDATE `Membre` SET `status` = ? WHERE `code` = ?', ['inactif', code]);
		return Boolean((result as QueryResult).affectedRows);
	}

	async findCotisationsByMember(code: number): Promise<Cotisation[]> {
		const [rows] = await pool.query(
			'WITH `cotisations_member` AS (SELECT `id`, `membre`, `annee`, `prix`, `date` FROM `Cotisation` WHERE `membre` = ?) SELECT `id`, `membre`, `annee`, `prix`, `date` FROM `cotisations_member` ORDER BY `annee` DESC, `date` DESC, `id` DESC',
			[code],
		);

		return rows as Cotisation[];
	}

	async createCotisation(memberCode: number, input: CotisationInput): Promise<Cotisation> {
		const [result] = await pool.query(
			'INSERT INTO `Cotisation` (`membre`, `annee`, `prix`, `date`) VALUES (?, ?, ?, ?)',
			[memberCode, input.annee, input.prix, input.date],
		);

		await pool.query('CALL `maj_member_status`(?)', [memberCode]);

		const insertId = (result as QueryResult).insertId;
		const [rows] = await pool.query('SELECT `id`, `membre`, `annee`, `prix`, `date` FROM `Cotisation` WHERE `id` = ? LIMIT 1', [insertId]);
		const cotisation = (rows as Cotisation[])[0];
		if (!cotisation) {
			throw new Error('Erreur lors de la lecture de la cotisation créée.');
		}

		return cotisation;
	}

	async deleteCotisation(memberCode: number, cotisationId: number): Promise<boolean> {
		const [result] = await pool.query('DELETE FROM `Cotisation` WHERE `id` = ? AND `membre` = ?', [cotisationId, memberCode]);
		const deleted = Boolean((result as QueryResult).affectedRows);

		if (deleted) {
			await pool.query('CALL `maj_member_status`(?)', [memberCode]);
		}

		return deleted;
	}
}

export const membresRepository = new MembresRepository();

