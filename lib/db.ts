import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cached: NeonQueryFunction<false, false> | null = null;

// Returns a Neon query function, or null when DATABASE_URL is not set.
// Callers no-op on null, so the site works without the database connected
// (logging simply stays dormant until Neon is provisioned).
export function getDb(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (cached) return cached;
  cached = neon(url);
  return cached;
}
