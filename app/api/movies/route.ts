import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

    return NextResponse.json({ data: rows }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('[GET /movies] Failed to fetch movies', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  // Handle CORS preflight
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}
