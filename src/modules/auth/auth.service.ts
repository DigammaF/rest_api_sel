import crypto from 'node:crypto';
import { AuthRepository } from './auth.repository';
import type { AuthSession, MemberProfile } from '../../types';

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

interface LoginInput {
  code_membre: string;
  password: string;
  isAdmin: boolean;
}

interface LoginResult {
  profil: MemberProfile;
  code_membre: string;
  token: string;
  expiresAt: number;
}

class AuthService {
  private readonly repository = new AuthRepository();
  private readonly sessions = new Map<string, AuthSession>();

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(token);
      }
    }
  }

  private hashPassword(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private matchesPassword(stored: string, provided: string): boolean {
    return stored === provided || stored === this.hashPassword(provided);
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const member = await this.repository.findMemberForAuth(input.code_membre);
    if (!member || !this.matchesPassword(member.password, input.password)) {
      throw new Error('Identifiants invalides.');
    }

    const expectedAdmin = member.profil === 'admin';
    if (Boolean(input.isAdmin) !== expectedAdmin) {
      throw new Error('Profil de connexion invalide.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const session: AuthSession = {
      code_membre: member.code_membre,
      profil: expectedAdmin ? 'admin' : 'utilisateur',
      token,
      expiresAt,
    };

    this.sessions.set(token, session);

    return {
      profil: session.profil,
      code_membre: session.code_membre,
      token,
      expiresAt,
    };
  }

  validateToken(token: string): AuthSession | null {
    this.cleanupExpiredSessions();

    const session = this.sessions.get(token);
    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  logout(token: string): void {
    this.sessions.delete(token);
  }

  parseTokenCookieHeader(header: string | undefined): string | null {
    if (!header) {
      return null;
    }

    const match = header.match(/(?:^|;\s*)connect\.sid=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export const authService = new AuthService();
