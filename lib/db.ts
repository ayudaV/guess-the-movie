import { Pool } from 'pg';
import type { PoolConfig } from 'pg';

let pool: Pool | undefined;

export function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Define it in your environment.');
    }

    const sslEnv = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
    let ssl: PoolConfig['ssl'];

    if (sslEnv !== undefined) {
      ssl = { rejectUnauthorized: sslEnv !== 'false' };
    } else if (process.env.NODE_ENV === 'production') {
      ssl = { rejectUnauthorized: true };
    } else {
      ssl = false;
    }

    pool = new Pool({
      connectionString,
      ssl,
    });
  }

  return pool;
}
