import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import pool from '../db';
import { signAccessToken } from '../utils/jwt';
import { calculateProfileCompletion } from '../utils/profile';
import { firebaseAdmin } from '../lib/firebaseAdmin';

const router = Router();
const SALT_ROUNDS = 10;

function mapUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    dob: row.dob,
    gender: row.gender,
    nationality: row.nationality,
    city: row.city,
    state: row.state,
    authProvider: row.auth_provider,
    googleId: row.google_id,
    appleId: row.apple_id,
    isEmailVerified: row.is_email_verified,
    isPhoneVerified: row.is_phone_verified,
    isProfileComplete: row.is_profile_complete,
    profileCompletionScore: row.profile_completion_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// POST /api/auth/signup
router.post('/auth/signup', async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body as {
    fullName?: string;
    email?: string;
    password?: string;
  };

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email and password are required' });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const profile = calculateProfileCompletion({
      full_name: fullName,
      email,
    });

    const result = await pool.query(
      `INSERT INTO users (
        id, email, password_hash, full_name, auth_provider,
        is_profile_complete, profile_completion_score, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, now())
      RETURNING *`,
      [
        `usr_${randomUUID()}`,
        email,
        passwordHash,
        fullName,
        'email',
        profile.isComplete,
        profile.score,
      ]
    );

    const user = result.rows[0];
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    return res.status(201).json({
      accessToken,
      user: mapUser(user),
    });
  } catch (error) {
    console.error('Signup error', error);
    return res.status(500).json({ error: 'Failed to sign up' });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(400).json({
        error: 'This account uses social login. Please continue with Google or Apple.',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    return res.json({
      accessToken,
      user: mapUser(user),
    });
  } catch (error) {
    console.error('Login error', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/auth/social-login', async (req: Request, res: Response) => {
  const { provider, firebaseIdToken } = req.body as {
    provider?: 'google' | 'apple';
    firebaseIdToken?: string;
  };

  if (!provider || !firebaseIdToken) {
    return res.status(400).json({ error: 'provider and firebaseIdToken are required' });
  }

  if (!['google', 'apple'].includes(provider)) {
    return res.status(400).json({ error: 'Unsupported provider' });
  }

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(firebaseIdToken);

    const firebaseUid = decoded.uid;
    const email = decoded.email ?? null;
    const fullName = (decoded.name as string | undefined) ?? null;

    const identities = decoded.firebase?.identities ?? {};
    const signInProvider = decoded.firebase?.sign_in_provider ?? null;

    if (provider === 'google' && signInProvider !== 'google.com') {
      return res.status(400).json({ error: 'Firebase token is not a Google login' });
    }

    if (provider === 'apple' && signInProvider !== 'apple.com') {
      return res.status(400).json({ error: 'Firebase token is not an Apple login' });
    }

    let providerId: string | null = null;

    if (provider === 'google') {
      const googleIds = identities['google.com'];
      providerId = Array.isArray(googleIds) && googleIds.length > 0 ? String(googleIds[0]) : firebaseUid;
    } else if (provider === 'apple') {
      const appleIds = identities['apple.com'];
      providerId = Array.isArray(appleIds) && appleIds.length > 0 ? String(appleIds[0]) : firebaseUid;
    }

    let result;

    if (provider === 'google') {
      result = await pool.query(
        `SELECT * FROM users WHERE google_id = $1 LIMIT 1`,
        [providerId]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM users WHERE apple_id = $1 LIMIT 1`,
        [providerId]
      );
    }

    if (result.rowCount === 0 && email) {
      result = await pool.query(
        `SELECT * FROM users WHERE email = $1 LIMIT 1`,
        [email]
      );
    }

    let user;

    if (result.rowCount && result.rowCount > 0) {
      const existing = result.rows[0];
      const mergedProfile = calculateProfileCompletion({
        full_name: fullName ?? existing.full_name,
        email: email ?? existing.email,
        phone: existing.phone,
        dob: existing.dob,
        gender: existing.gender,
      });

      if (provider === 'google') {
        const updated = await pool.query(
          `UPDATE users
           SET google_id = $1,
               email = COALESCE($2, email),
               full_name = COALESCE($3, full_name),
               auth_provider = 'google',
               is_email_verified = COALESCE($4, is_email_verified),
               is_profile_complete = $5,
               profile_completion_score = $6,
               updated_at = now()
           WHERE id = $7
           RETURNING *`,
          [
            providerId,
            email,
            fullName,
            decoded.email_verified ?? null,
            mergedProfile.isComplete,
            mergedProfile.score,
            existing.id,
          ]
        );
        user = updated.rows[0];
      } else {
        const updated = await pool.query(
          `UPDATE users
           SET apple_id = $1,
               email = COALESCE($2, email),
               full_name = COALESCE($3, full_name),
               auth_provider = 'apple',
               is_email_verified = COALESCE($4, is_email_verified),
               is_profile_complete = $5,
               profile_completion_score = $6,
               updated_at = now()
           WHERE id = $7
           RETURNING *`,
          [
            providerId,
            email,
            fullName,
            decoded.email_verified ?? null,
            mergedProfile.isComplete,
            mergedProfile.score,
            existing.id,
          ]
        );
        user = updated.rows[0];
      }
    } else {
      const profile = calculateProfileCompletion({
        full_name: fullName,
        email,
      });

      if (provider === 'google') {
        const created = await pool.query(
          `INSERT INTO users (
            id, email, password_hash, full_name, google_id, auth_provider,
            is_email_verified, is_profile_complete, profile_completion_score, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, 'google', $6, $7, $8, now())
          RETURNING *`,
          [
            `usr_${randomUUID()}`,
            email,
            null,
            fullName,
            providerId,
            decoded.email_verified ?? false,
            profile.isComplete,
            profile.score,
          ]
        );
        user = created.rows[0];
      } else {
        const created = await pool.query(
          `INSERT INTO users (
            id, email, password_hash, full_name, apple_id, auth_provider,
            is_email_verified, is_profile_complete, profile_completion_score, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, 'apple', $6, $7, $8, now())
          RETURNING *`,
          [
            `usr_${randomUUID()}`,
            email,
            null,
            fullName,
            providerId,
            decoded.email_verified ?? false,
            profile.isComplete,
            profile.score,
          ]
        );
        user = created.rows[0];
      }
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    return res.json({
      accessToken,
      user: mapUser(user),
    });
  } catch (error) {
    console.error('Social login error', error);
    return res.status(401).json({ error: 'Invalid or expired Firebase token' });
  }
});

export default router;