import pool from '../../config/db';

type MemberRecord = Record<string, unknown>;

export interface MemberAuthRow {
  code_membre: string;
  password: string;
  profil: string;
}

export class AuthRepository {
  async findMemberForAuth(codeMembre: string | number): Promise<MemberAuthRow | null> {
    try {
      const [rows] = (await pool.query(
          'SELECT * FROM `Membre` WHERE `code` = ? LIMIT 1',
          [codeMembre],
      )) as [MemberRecord[], unknown[]];

      const member = rows[0];
      if (!member) {
        return null;
      }

      return {
        code_membre: String(member["code"]),
        password: String(member["password"] ?? ''),
        profil: String(member["profil"] ?? ''),
      };
    } catch (error) {
      console.error('Erreur dans findMemberForAuth:', error);
      throw error;
    }
  }
}
