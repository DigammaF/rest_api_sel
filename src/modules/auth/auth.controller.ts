import { Request, Response } from "express";
import { authService } from './auth.service';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { code_membre, password, isAdmin } = req.body as {
        code_membre?: string;
        password?: string;
        isAdmin?: boolean;
      };

      if (!code_membre || !password || typeof isAdmin !== 'boolean') {
        res.status(400).json({ code: 400, message: 'Données invalides' });
        return;
      }

      const result = await authService.login({ code_membre, password, isAdmin });

      res.cookie('connect.sid', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: result.expiresAt - Date.now(),
      });

      const codeMembre = Number(result.code_membre);

      res.status(200).json({
        profil: result.profil,
        code_membre: Number.isNaN(codeMembre) ? result.code_membre : codeMembre,
      });
    } catch (error) {
      res.status(401).json({ code: 401, message: 'Identifiants invalides' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const token = authService.parseTokenCookieHeader(req.headers.cookie);

    if (token) {
      authService.logout(token);
    }

    res.clearCookie('connect.sid', { path: '/' });
    res.status(204).send();
  }
}
