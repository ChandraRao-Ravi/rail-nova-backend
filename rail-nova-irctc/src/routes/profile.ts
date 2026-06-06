import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { calculateProfileCompletion } from '../utils/profile';

const router = Router();

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

// GET /api/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [req.user!.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: mapUser(result.rows[0]),
    });
  } catch (error) {
    console.error('Get me error', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PATCH /api/me/profile
router.patch(
  '/me/profile',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      fullName,
      phone,
      dob,
      gender,
      nationality,
      city,
      state,
    } = req.body as {
      fullName?: string | null;
      phone?: string | null;
      dob?: string | null;
      gender?: string | null;
      nationality?: string | null;
      city?: string | null;
      state?: string | null;
    };

    try {
      const existingResult = await pool.query(
        `SELECT * FROM users WHERE id = $1 LIMIT 1`,
        [req.user!.id]
      );

      if (existingResult.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existing = existingResult.rows[0];

      const nextProfile = {
        full_name: fullName ?? existing.full_name,
        email: existing.email,
        phone: phone ?? existing.phone,
        dob: dob ?? existing.dob,
        gender: gender ?? existing.gender,
      };

      const completion = calculateProfileCompletion(nextProfile);

      const updatedResult = await pool.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             dob = COALESCE($3, dob),
             gender = COALESCE($4, gender),
             nationality = COALESCE($5, nationality),
             city = COALESCE($6, city),
             state = COALESCE($7, state),
             is_profile_complete = $8,
             profile_completion_score = $9,
             updated_at = now()
         WHERE id = $10
         RETURNING *`,
        [
          fullName ?? null,
          phone ?? null,
          dob ?? null,
          gender ?? null,
          nationality ?? null,
          city ?? null,
          state ?? null,
          completion.isComplete,
          completion.score,
          req.user!.id,
        ]
      );

      return res.json({
        user: mapUser(updatedResult.rows[0]),
      });
    } catch (error) {
      console.error('Update profile error', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

export default router;