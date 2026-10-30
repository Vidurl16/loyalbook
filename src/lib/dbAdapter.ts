import { PrismaPg } from "@prisma/adapter-pg";

/** Prisma migrate honours `?schema=` in DATABASE_URL but the pg driver adapter
 *  does not, so each salon's schema has to be passed to the adapter explicitly. */
export function schemaFromDatabaseUrl(databaseUrl: string): string | undefined {
  return new URL(databaseUrl).searchParams.get("schema") ?? undefined;
}

export function createDbAdapter(databaseUrl = process.env.DATABASE_URL!) {
  return new PrismaPg({ connectionString: databaseUrl }, { schema: schemaFromDatabaseUrl(databaseUrl) });
}
