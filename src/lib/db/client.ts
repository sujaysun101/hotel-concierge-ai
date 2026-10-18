import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/lib/db/schema"

type Database = PostgresJsDatabase<typeof schema>

const globalForDb = globalThis as unknown as { turndownSql?: ReturnType<typeof postgres>; turndownDb?: Database }

export function getDb(): Database | null {
  const url = process.env.DATABASE_URL
  if (!url) return null
  if (!globalForDb.turndownSql) {
    globalForDb.turndownSql = postgres(url, { max: 5, prepare: false })
    globalForDb.turndownDb = drizzle(globalForDb.turndownSql, { schema })
  }
  return globalForDb.turndownDb ?? null
}
