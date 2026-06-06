type UserProfileInput = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  dob?: string | Date | null;
  gender?: string | null;
};

export function calculateProfileCompletion(user: UserProfileInput) {
  const checks = [
    Boolean(user.full_name),
    Boolean(user.email),
    Boolean(user.phone),
    Boolean(user.dob),
    Boolean(user.gender),
  ];

  const completed = checks.filter(Boolean).length;
  const score = Math.round((completed / checks.length) * 100);
  const isComplete = completed === checks.length;

  return {
    isComplete,
    score,
  };
}