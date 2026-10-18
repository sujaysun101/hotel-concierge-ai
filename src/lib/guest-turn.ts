import { houseBook } from "@/lib/house-book"
import { answerGuest } from "@/lib/ai/answer"
import { getStore } from "@/lib/store"
import type { Store } from "@/lib/store/types"
import { hashToken, newGuestToken, tokenMatches } from "@/lib/tokens"
import type { Conversation, Ticket, TicketType } from "@/lib/types"
import type { widgetChatSchema, widgetRequestSchema } from "@/lib/validators"
import type { z } from "zod"

type ChatInput = z.infer<typeof widgetChatSchema>
type RequestInput = z.infer<typeof widgetRequestSchema>

export type PublicTicket = {
  id: string
  type: TicketType
  status: Ticket["status"]
  summary: string
}

export type WidgetPayload = {
  conversationId: string
  guestToken?: string
  reply: string
  grounded: boolean
  escalate: boolean
  sample: boolean
  degraded: boolean
  ticket: PublicTicket | null
}

function publicTicket(ticket: Ticket): PublicTicket {
  return { id: ticket.id, type: ticket.type, status: ticket.status, summary: ticket.summary }
}

type Opened =
  | { ok: false; error: string }
  | { ok: true; store: Store; conversation: Conversation; guestToken?: string }

async function openConversation(input: {
  propertyId: string
  conversationId?: string
  guestToken?: string
  guestLabel?: string
  room?: string
}): Promise<Opened> {
  const store = getStore()
  if (input.conversationId) {
    const conversation = await store.getConversation(input.conversationId)
    if (!conversation || conversation.propertyId !== input.propertyId) {
      return { ok: false, error: "That conversation is not at this house." }
    }
    if (!input.guestToken || !tokenMatches(conversation.guestTokenHash, input.guestToken)) {
      return { ok: false, error: "That conversation token does not match." }
    }
    return { ok: true, store, conversation }
  }

  const now = new Date().toISOString()
  const guestToken = newGuestToken()
  const conversation = await store.createConversation({
    id: crypto.randomUUID(),
    propertyId: input.propertyId,
    guestLabel: input.guestLabel?.trim() || "Guest",
    room: input.room?.trim() || "",
    topic: "other",
    status: "open",
    escalated: false,
    lastMessagePreview: "",
    guestTokenHash: hashToken(guestToken),
    createdAt: now,
    updatedAt: now,
  })
  return { ok: true, store, conversation, guestToken }
}

export async function turnChat(slug: string, input: ChatInput): Promise<{ ok: true; body: WidgetPayload } | { ok: false; status: number; error: string }> {
  const store = getStore()
  const property = await store.getPropertyBySlug(slug)
  if (!property) return { ok: false, status: 404, error: "This desk is not published." }

  const opened = await openConversation({
    propertyId: property.id,
    conversationId: input.conversationId,
    guestToken: input.guestToken,
    guestLabel: input.guestLabel,
    room: input.room,
  })
  if (!opened.ok) return { ok: false, status: 400, error: opened.error }

  const now = new Date().toISOString()
  await opened.store.addMessage({
    id: crypto.randomUUID(),
    conversationId: opened.conversation.id,
    role: "guest",
    content: input.message,
    grounded: false,
    sample: false,
    citations: [],
    createdAt: now,
  })

  const history = await opened.store.listMessages(opened.conversation.id)
  const articles = await opened.store.listArticles(property.id)
  const entries = houseBook(property, articles)
  const result = await answerGuest({
    propertyName: property.name,
    message: input.message,
    entries,
    rooms: property.rooms,
    history: history.filter((message) => message.role !== "guest" || message.createdAt !== now).map((message) => ({
      role: message.role,
      content: message.content,
    })),
  })

  await opened.store.addMessage({
    id: crypto.randomUUID(),
    conversationId: opened.conversation.id,
    role: "assistant",
    content: result.answer.reply,
    grounded: result.answer.grounded,
    sample: result.sample,
    citations: result.answer.citations,
    createdAt: new Date().toISOString(),
  })

  let ticket: Ticket | null = null
  if (result.answer.request) {
    const existing = await opened.store.findOpenTicket(property.id, opened.conversation.id, result.answer.request.type)
    ticket =
      existing ??
      (await opened.store.createTicket({
        id: crypto.randomUUID(),
        propertyId: property.id,
        conversationId: opened.conversation.id,
        type: result.answer.request.type,
        room: result.answer.request.room || input.room || opened.conversation.room || "",
        guestLabel: opened.conversation.guestLabel,
        summary: result.answer.request.summary,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
  }

  const guestCount = history.filter((message) => message.role === "guest").length
  await opened.store.updateConversation(opened.conversation.id, {
    topic: guestCount <= 1 ? result.answer.topic : opened.conversation.topic,
    room: input.room?.trim() || opened.conversation.room,
    guestLabel: input.guestLabel?.trim() || opened.conversation.guestLabel,
    escalated: opened.conversation.escalated || result.answer.escalate,
    status: result.answer.escalate ? "open" : result.answer.grounded ? "resolved" : opened.conversation.status,
    lastMessagePreview: result.answer.reply.slice(0, 140),
    updatedAt: new Date().toISOString(),
  })

  return {
    ok: true,
    body: {
      conversationId: opened.conversation.id,
      guestToken: opened.guestToken,
      reply: result.answer.reply,
      grounded: result.answer.grounded,
      escalate: result.answer.escalate,
      sample: result.sample,
      degraded: result.degraded,
      ticket: ticket ? publicTicket(ticket) : null,
    },
  }
}

export async function turnRequest(
  slug: string,
  input: RequestInput,
): Promise<{ ok: true; body: WidgetPayload } | { ok: false; status: number; error: string }> {
  const store = getStore()
  const property = await store.getPropertyBySlug(slug)
  if (!property) return { ok: false, status: 404, error: "This desk is not published." }

  const opened = await openConversation({
    propertyId: property.id,
    conversationId: input.conversationId,
    guestToken: input.guestToken,
    guestLabel: input.guestLabel,
    room: input.room,
  })
  if (!opened.ok) return { ok: false, status: 400, error: opened.error }

  const existing = await opened.store.findOpenTicket(property.id, opened.conversation.id, input.type)
  const ticket =
    existing ??
    (await opened.store.createTicket({
      id: crypto.randomUUID(),
      propertyId: property.id,
      conversationId: opened.conversation.id,
      type: input.type,
      room: input.room?.trim() || opened.conversation.room,
      guestLabel: input.guestLabel?.trim() || opened.conversation.guestLabel,
      summary: input.summary,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

  const reply = "I've passed that to the front desk. Someone at the house will pick it up."
  await opened.store.addMessage({
    id: crypto.randomUUID(),
    conversationId: opened.conversation.id,
    role: "assistant",
    content: reply,
    grounded: true,
    sample: false,
    citations: [],
    createdAt: new Date().toISOString(),
  })
  await opened.store.updateConversation(opened.conversation.id, {
    escalated: true,
    status: "open",
    room: input.room?.trim() || opened.conversation.room,
    lastMessagePreview: reply,
    updatedAt: new Date().toISOString(),
  })

  return {
    ok: true,
    body: {
      conversationId: opened.conversation.id,
      guestToken: opened.guestToken,
      reply,
      grounded: true,
      escalate: true,
      sample: false,
      degraded: false,
      ticket: publicTicket(ticket),
    },
  }
}
