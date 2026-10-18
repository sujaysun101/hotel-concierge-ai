import { auth } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { clerkConfigured, demoEntryAllowed } from "@/lib/runtime"
import { getStore, isDemoStore } from "@/lib/store"

export { clerkConfigured, demoEntryAllowed }

export const getActor = cache(async () => {
  const headerList = await headers()
  const marked = headerList.get("x-turndown-demo") === "1"
  if ((process.env.DEMO_SCREENSHOT === "1" || demoEntryAllowed()) && marked) {
    return { userId: "demo", demoBypass: true }
  }
  if (!clerkConfigured()) return null
  const session = await auth()
  if (!session.userId) return null
  return { userId: session.userId, demoBypass: false }
})

export const requireDesk = cache(async () => {
  const actor = await getActor()
  if (!actor) redirect("/sign-in")
  const store = getStore()
  const demo = isDemoStore()
  const property = demo
    ? await store.getPropertyBySlug("linden-house")
    : await store.getPropertyForOwner(actor.userId)
  return { actor, store, property, demo }
})
