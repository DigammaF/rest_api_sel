import { NextFunction, Request, Response } from 'express';
import { authService } from '../modules/auth/auth.service';

function unauthorized(res: Response): Response {
  return res.status(401).json({ code: 401, message: 'Entêtes invalides' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = authService.parseTokenCookieHeader(req.headers.cookie) ?? req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    unauthorized(res);
    return;
  }

  const session = authService.validateToken(token);
  if (!session) {
    unauthorized(res);
    return;
  }

  req.auth = session;
  next();
}
//TODO: à suppr
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = authService.parseTokenCookieHeader(req.headers.cookie) ?? req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token) {
    const session = authService.validateToken(token);
    if (session) {
      req.auth = session;
    }
  }

  next();
}
