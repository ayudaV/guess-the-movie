import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db';

type MovieRow = {
  movie_id: number;
  title: string;
};

export async function GET() {
  try {
    const pool = getDb();
    const { rows } = await pool.query<MovieRow>(
      'select movie_id, title from movies_data.movie'
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /movies] Failed to fetch movies', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
