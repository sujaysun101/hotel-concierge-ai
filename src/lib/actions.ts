"use server"

import { revalidatePath } from "next/cache"
import { profileArticles } from "@/lib/house-book"
import { requireDesk } from "@/lib/actor"
import { buildLindenHouse, cloneGraphForOwner } from "@/lib/demo/linden"
import { slugify } from "@/lib/tokens"
import {
  articleInputSchema,
  conversationStatusSchema,
  issueMessage,
  propertyInputSchema,
  staffReplySchema,
  ticketStatusSchema,
} from "@/lib/validators"

function refresh() {
  revalidatePath("/app")
  revalidatePath("/app/setup")
  revalidatePath("/app/knowledge")
  revalidatePath("/app/inbox")
  revalidatePath("/app/requests")
  revalidatePath("/app/analytics")
  revalidatePath("/app/embed")
}

async function uniqueSlug(base: string, exceptId?: string) {
  const { store } = await requireDesk()
  let slug = base
  let n = 2
  while (await store.slugTaken(slug, exceptId)) {
    slug = `${base}-${n}`
    n += 1
    if (n > 20) return `${base}-${crypto.randomUUID().slice(0, 6)}`
  }
  return slug
}

export async function saveProperty(input: unknown) {
  const parsed = propertyInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: issueMessage(parsed.error) }
  const desk = await requireDesk()
  const data = parsed.data
  const property = desk.property
    ? await desk.store.updateProperty(desk.property.id, desk.actor.userId, data, desk.demo)
    : await desk.store.createProperty(
        desk.actor.userId,
        await uniqueSlug(slugify(data.name)),
        data,
      )
  if (!property) return { ok: false as const, error: "That house could not be saved." }
  await desk.store.replaceProfileArticles(property.id, profileArticles(property, property.updatedAt))
  refresh()
  return { ok: true as const, slug: property.slug }
}

export async function loadSampleHouse() {
  const desk = await requireDesk()
  if (desk.property) return { ok: true as const, slug: desk.property.slug }
  const slug = await uniqueSlug("linden-house")
  const graph = cloneGraphForOwner(buildLindenHouse(desk.actor.userId), desk.actor.userId, slug)
  await desk.store.importGraph(graph)
  refresh()
  return { ok: true as const, slug }
}

export async function saveArticle(id: string | null, input: unknown) {
  const parsed = articleInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: issueMessage(parsed.error) }
  const desk = await requireDesk()
  if (!desk.property) return { ok: false as const, error: "Set up the house first." }
  const now = new Date().toISOString()
  if (!id) {
    await desk.store.createArticle({
      id: crypto.randomUUID(),
      propertyId: desk.property.id,
      ...parsed.data,
      source: "custom",
      updatedAt: now,
    })
  } else {
    const updated = await desk.store.updateArticle(id, desk.property.id, { ...parsed.data, updatedAt: now })
    if (!updated) return { ok: false as const, error: "That note is part of the house profile. Edit it under House." }
  }
  refresh()
  return { ok: true as const }
}

export async function removeArticle(id: string) {
  const desk = await requireDesk()
  if (!desk.property) return { ok: false as const, error: "Set up the house first." }
  const removed = await desk.store.deleteArticle(id, desk.property.id)
  if (!removed) return { ok: false as const, error: "That note could not be removed." }
  refresh()
  return { ok: true as const }
}

export async function setTicketStatus(input: unknown) {
  const parsed = ticketStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: issueMessage(parsed.error) }
  const desk = await requireDesk()
  if (!desk.property) return { ok: false as const, error: "Set up the house first." }
  const ticket = await desk.store.updateTicketStatus(parsed.data.id, desk.property.id, parsed.data.status)
  if (!ticket) return { ok: false as const, error: "That request was not found." }
  refresh()
  return { ok: true as const }
}

export async function replyToGuest(input: unknown) {
  const parsed = staffReplySchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: issueMessage(parsed.error) }
  const desk = await requireDesk()
  if (!desk.property) return { ok: false as const, error: "Set up the house first." }
  const conversation = await desk.store.getConversation(parsed.data.conversationId)
  if (!conversation || conversation.propertyId !== desk.property.id) {
    return { ok: false as const, error: "That conversation is not at this house." }
  }
  const now = new Date().toISOString()
  await desk.store.addMessage({
    id: crypto.randomUUID(),
    conversationId: conversation.id,
    role: "staff",
    content: parsed.data.content,
    grounded: true,
    sample: false,
    citations: [],
    createdAt: now,
  })
  await desk.store.updateConversation(conversation.id, {
    lastMessagePreview: parsed.data.content.slice(0, 140),
    updatedAt: now,
  })
  refresh()
  return { ok: true as const }
}

export async function setConversationStatus(input: unknown) {
  const parsed = conversationStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: issueMessage(parsed.error) }
  const desk = await requireDesk()
  if (!desk.property) return { ok: false as const, error: "Set up the house first." }
  const conversation = await desk.store.getConversation(parsed.data.conversationId)
  if (!conversation || conversation.propertyId !== desk.property.id) {
    return { ok: false as const, error: "That conversation is not at this house." }
  }
  await desk.store.updateConversation(conversation.id, {
    status: parsed.data.status,
    updatedAt: new Date().toISOString(),
  })
  refresh()
  return { ok: true as const }
}
