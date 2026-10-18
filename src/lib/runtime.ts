type ClerkKeys = { publishableKey: string; secretKey: string }

function envKeys(): ClerkKeys | null {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!publishableKey || !secretKey) return null
  return { publishableKey, secretKey }
}

export function clerkConfigured(): boolean {
  return Boolean(envKeys())
}

export function demoEntryAllowed(): boolean {
  return !clerkConfigured() && !process.env.DATABASE_URL
}

export async function resolveClerkKeys(): Promise<ClerkKeys | null> {
  const existing = envKeys()
  if (existing) return existing
  if (process.env.NODE_ENV !== "development") return null
  if (process.env.DEMO_SCREENSHOT === "1") return null
  if (process.env.CI) return null

  const globalKeys = globalThis as unknown as { __turndownClerkKeys?: ClerkKeys | null }
  if (globalKeys.__turndownClerkKeys !== undefined) return globalKeys.__turndownClerkKeys

  try {
    const mod = (await import("@clerk/nextjs/dist/esm/server/keyless-node.js")) as {
      keyless: () => { getOrCreateKeys: () => Promise<Partial<ClerkKeys> | null> }
    }
    const created = await mod.keyless().getOrCreateKeys()
    if (created?.publishableKey && created.secretKey) {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = created.publishableKey
      process.env.CLERK_SECRET_KEY = created.secretKey
      globalKeys.__turndownClerkKeys = {
        publishableKey: created.publishableKey,
        secretKey: created.secretKey,
      }
      return globalKeys.__turndownClerkKeys
    }
  } catch {
    // Keyless provisioning is best-effort. The desk still runs in demo.
  }

  globalKeys.__turndownClerkKeys = null
  return null
}
