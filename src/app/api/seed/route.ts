import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";

async function getClient() {
  const cs =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  const client = new Client({
    connectionString: cs,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

// GET => introspect schema
export async function GET() {
  let client;
  try {
    client = await getClient();
    const cols = await client.query(
      `select table_name, column_name, data_type, is_nullable, column_default
       from information_schema.columns
       where table_schema='public' and table_name in ('looks','actors','votes')
       order by table_name, ordinal_position`
    );
    const counts: Record<string, number> = {};
    for (const t of ["looks", "actors", "votes"]) {
      const r = await client.query(`select count(*)::int n from ${t}`);
      counts[t] = r.rows[0].n;
    }
    const fn = await client.query(
      `select pg_get_functiondef(oid) def from pg_proc where proname='get_tension_contenders'`
    );
    return NextResponse.json({
      columns: cols.rows,
      counts,
      rpc: fn.rows[0]?.def ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    if (client) await client.end();
  }
}
