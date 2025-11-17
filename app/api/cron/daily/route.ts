import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db';

/**
 * Cron endpoint to insert the daily movie.
 *
 * Configure your scheduler (Vercel Cron, external cron, GitHub Actions) to
 * request this endpoint at 00:00 daily. If `CRON_SECRET` is set in env,
 * the request must include header `x-cron-secret: <value>`.
 */
export async function GET(request: Request) {
  try {
    const secretEnv = process.env.CRON_SECRET;
    if (secretEnv) {
      const provided = request.headers.get('x-cron-secret') ?? '';
      if (provided !== secretEnv) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const pool = getDb();
    const { rows } = await pool.query('select * from movies_data.insert_daily_movie()');

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/cron/daily] Failed to run cron query', error);
    return NextResponse.json({ error: 'Failed to run cron task' }, { status: 500 });
  }
}
