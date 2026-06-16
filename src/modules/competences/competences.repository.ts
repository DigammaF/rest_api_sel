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

type ResultSet = { insertId: number; affectedRows: number };

export class CompetencesRepository {
	async findAllCategories(): Promise<Categorie[]> {
		const [rows] = await pool.query('SELECT `id`, `description` FROM `Categorie` ORDER BY `id` ASC');
		return rows as Categorie[];
	}

	async findCategoryById(id: number): Promise<Categorie | null> {
		const [rows] = await pool.query('SELECT `id`, `description` FROM `Categorie` WHERE `id` = ? LIMIT 1', [id]);
		return ((rows as Categorie[])[0] ?? null);
	}

	async createCategory(description: string): Promise<Categorie> {
		const [result] = await pool.query('INSERT INTO `Categorie` (`description`) VALUES (?)', [description]);
		const insertId = (result as ResultSet).insertId;

		return {
			id: insertId,
			description,
		};
	}

	async updateCategory(id: number, description: string): Promise<Categorie | null> {
		const [result] = await pool.query('UPDATE `Categorie` SET `description` = ? WHERE `id` = ?', [description, id]);
		if (!(result as ResultSet).affectedRows) {
			return null;
		}

		return { id, description };
	}

	async deleteCategory(id: number): Promise<'deleted' | 'not_found' | 'conflict'> {
		try {
			const [result] = await pool.query('DELETE FROM `Categorie` WHERE `id` = ?', [id]);
			const affectedRows = (result as ResultSet).affectedRows;

			if (!affectedRows) {
				return 'not_found';
			}

			return 'deleted';
		} catch (error) {
			const code = (error as { code?: string }).code;
			if (code === 'ER_ROW_IS_REFERENCED_2') {
				return 'conflict';
			}

			throw error;
		}
	}

	async findAllCompetences(idCategorie?: number): Promise<Competence[]> {
		const params: Array<number> = [];
		let sql = 'SELECT `id`, `description`, `id_categorie` FROM `Competence`';

		if (typeof idCategorie === 'number') {
			sql += ' WHERE `id_categorie` = ?';
			params.push(idCategorie);
		}

		sql += ' ORDER BY `id` ASC';

		const [rows] = await pool.query(sql, params);
		return rows as Competence[];
	}

	async findCompetenceById(id: number): Promise<Competence | null> {
		const [rows] = await pool.query(
			'SELECT `id`, `description`, `id_categorie` FROM `Competence` WHERE `id` = ? LIMIT 1',
			[id],
		);

		return ((rows as Competence[])[0] ?? null);
	}

	async createCompetence(description: string, idCategorie: number): Promise<Competence> {
		const [result] = await pool.query(
			'INSERT INTO `Competence` (`description`, `id_categorie`) VALUES (?, ?)',
			[description, idCategorie],
		);
		const insertId = (result as ResultSet).insertId;

		return {
			id: insertId,
			description,
			id_categorie: idCategorie,
		};
	}

	async updateCompetence(id: number, description: string, idCategorie: number): Promise<Competence | null> {
		const [result] = await pool.query(
			'UPDATE `Competence` SET `description` = ?, `id_categorie` = ? WHERE `id` = ?',
			[description, idCategorie, id],
		);

		if (!(result as ResultSet).affectedRows) {
			return null;
		}

		return {
			id,
			description,
			id_categorie: idCategorie,
		};
	}

	async deleteCompetence(id: number): Promise<boolean> {
		const [result] = await pool.query('DELETE FROM `Competence` WHERE `id` = ?', [id]);
		return Boolean((result as ResultSet).affectedRows);
	}
}

export const competencesRepository = new CompetencesRepository();

