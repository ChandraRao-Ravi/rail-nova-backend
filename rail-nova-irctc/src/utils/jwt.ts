import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const JWT_SIGN_OPTIONS: SignOptions = {
  expiresIn: '7d',
};

export type AppJwtPayload = {
  sub: string;
  email: string | null;
};

export function signAccessToken(payload: AppJwtPayload): string {
  return jwt.sign({ sub: payload.sub, email: payload.email }, JWT_SECRET, JWT_SIGN_OPTIONS);
}

export function verifyAccessToken(token: string): AppJwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string' || !decoded) {
    throw new Error('Invalid token payload');
  }

  const jwtPayload = decoded as JwtPayload;

  if (!jwtPayload.sub) {
    throw new Error('Token missing sub');
  }

  return {
    sub: String(jwtPayload.sub),
    email: jwtPayload.email ? String(jwtPayload.email) : null,
  };
}