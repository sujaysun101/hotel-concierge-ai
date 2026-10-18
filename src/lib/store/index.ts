import { memoryStore } from "@/lib/store/memory"
import { postgresStore } from "@/lib/store/postgres"
import type { Store } from "@/lib/store/types"

export function getStore(): Store {
  if (process.env.DATABASE_URL) return postgresStore
  return memoryStore
}

export function isDemoStore(): boolean {
  return getStore().mode === "demo"
}
