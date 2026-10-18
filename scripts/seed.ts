import { config } from "dotenv"
import { buildLindenHouse } from "../src/lib/demo/linden"
import { getStore } from "../src/lib/store"

config({ path: ".env.local" })
config({ path: ".env" })

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required. Without it, Turndown already serves The Linden House from memory.")
    process.exit(1)
  }
  const ownerId = process.env.SEED_OWNER_ID || "demo"
  const store = getStore()
  const existing = await store.getPropertyBySlug("linden-house")
  if (existing) {
    console.log("The Linden House is already seeded.")
    return
  }
  await store.importGraph(buildLindenHouse(ownerId))
  console.log(`Seeded The Linden House B&B for owner ${ownerId}.`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
