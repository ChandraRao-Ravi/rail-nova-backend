import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export type AppJwtPayload = {
  sub: string;
  email: string | null;
};

export function signAccessToken(payload: AppJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): AppJwtPayload {
  return jwt.verify(token, JWT_SECRET) as AppJwtPayload;
}