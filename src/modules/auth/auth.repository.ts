import pool from '../../config/db';

type MemberRecord = Record<string, unknown>;
type ColumnRow = { Field: string };

const CODE_COLUMNS = ['code_membre', 'code', 'id'];
const PASSWORD_COLUMNS = ['password', 'mot_de_passe', 'mdp'];
const PROFIL_COLUMNS = ['profil', 'role'];

async function getColumns(table: string): Promise<string[]> {
  const [rows] = (await pool.query(`SHOW COLUMNS FROM \`${table}\``)) as [ColumnRow[], unknown[]];
  return rows
    .map((row) => row.Field)
    .filter((field): field is string => typeof field === 'string');
}

function pickColumn(columns: string[], candidates: string[]): string | null {
  return candidates.find((candidate) => columns.includes(candidate)) ?? null;
}

export interface MemberAuthRow {
  code_membre: string;
  password: string;
  profil: string;
}

export class AuthRepository {
  async findMemberForAuth(codeMembre: string): Promise<MemberAuthRow | null> {
    const columns = await getColumns('membres');
    const codeColumn = pickColumn(columns, CODE_COLUMNS);
    const passwordColumn = pickColumn(columns, PASSWORD_COLUMNS);
    const profilColumn = pickColumn(columns, PROFIL_COLUMNS);

    if (!codeColumn || !passwordColumn || !profilColumn) {
      throw new Error('La table membres ne contient pas les colonnes attendues pour l’authentification.');
    }

    const [rows] = (await pool.query(
      `SELECT * FROM \`membres\` WHERE \`${codeColumn}\` = ? LIMIT 1`,
      [codeMembre],
    )) as [MemberRecord[], unknown[]];

    const member = rows[0];
    if (!member) {
      return null;
    }

    return {
      code_membre: String(member[codeColumn]),
      password: String(member[passwordColumn] ?? ''),
      profil: String(member[profilColumn] ?? ''),
    };
  }
}
