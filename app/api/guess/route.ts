import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/lib/db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

type GuessRequestBody = {
  movie_id?: number | string;
  movieId?: number | string;
};

type ComparisonValue<T> = {
  value: T;
  status: string;
};

type GuessComparison = {
  movie_id: ComparisonValue<number>;
  title: ComparisonValue<string>;
  release_date: ComparisonValue<string>;
  duration_minutes: ComparisonValue<number>;
  rating: ComparisonValue<number>;
  budget: ComparisonValue<number>;
  revenue: ComparisonValue<number>;
  genres: ComparisonValue<string>[];
  director_names: ComparisonValue<string>[];
  main_actors: ComparisonValue<string>[];
  writers: ComparisonValue<string>[];
  producer_company: ComparisonValue<string>;
  producer_country: ComparisonValue<string>;
};

type GuessQueryRow = {
  result: GuessComparison;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GuessRequestBody;

    const rawMovieId = body.movie_id ?? body.movieId;
    if (rawMovieId === undefined || rawMovieId === null) {
      return NextResponse.json(
        { error: 'movie_id is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const movieId =
      typeof rawMovieId === 'string' ? Number(rawMovieId) : rawMovieId;

    if (typeof movieId !== 'number' || Number.isNaN(movieId)) {
      return NextResponse.json(
        { error: 'movie_id must be a valid number' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const pool = getDb();
    const { rows } = await pool.query<GuessQueryRow>(
      `
        with guess as (
          select *
          from movies_data.compare_movie_with_today($1)
        )
        select json_build_object(
          'movie_id', json_build_object(
            'value', ((g.movie_id).value)::bigint,
            'status', (g.movie_id).status
          ),
          'title', to_jsonb(g.title),
          'release_date', to_jsonb(g.release_date),
          'duration_minutes', json_build_object(
            'value', ((g.duration_minutes).value)::bigint,
            'status', (g.duration_minutes).status
          ),
          'rating', to_jsonb(g.rating),
          'budget', json_build_object(
            'value', ((g.budget).value)::bigint,
            'status', (g.budget).status
          ),
          'revenue', json_build_object(
            'value', ((g.revenue).value)::bigint,
            'status', (g.revenue).status
          ),
          'genres', (
            select coalesce(jsonb_agg(to_jsonb(genre)), '[]'::jsonb)
            from unnest(g.genres) as genre
          ),
          'director_names', (
            select coalesce(jsonb_agg(to_jsonb(director)), '[]'::jsonb)
            from unnest(g.director_names) as director
          ),
          'main_actors', (
            select coalesce(jsonb_agg(to_jsonb(actor)), '[]'::jsonb)
            from unnest(g.main_actors) as actor
          ),
          'writers', (
            select coalesce(jsonb_agg(to_jsonb(writer)), '[]'::jsonb)
            from unnest(g.writers) as writer
          ),
          'producer_company', to_jsonb(g.producer_company),
          'producer_country', to_jsonb(g.producer_country)
        ) as result
        from guess g
      `,
      [movieId]
    );

    const data = rows.map(({ result }: GuessQueryRow) => result);

    return NextResponse.json({ data }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('[POST /guess] Failed to execute query', error);
    return NextResponse.json(
      { error: 'Failed to process guess request' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  // Handle CORS preflight
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}
