import { and, eq } from "drizzle-orm"
import { computeAnalytics } from "@/lib/analytics"
import { getDb } from "@/lib/db/client"
import { articles, conversations, messages, properties, tickets } from "@/lib/db/schema"
import type { PropertyInput } from "@/lib/validators"
import type {
  Article,
  Conversation,
  Graph,
  Message,
  Property,
  Ticket,
  TicketStatus,
  TicketType,
  Topic,
} from "@/lib/types"
import type { ArticlePatch, ConversationPatch, Store } from "@/lib/store/types"

function db() {
  const database = getDb()
  if (!database) throw new Error("DATABASE_URL is not set")
  return database
}

function iso(value: Date): string {
  return value.toISOString()
}

function propertyFromRow(row: typeof properties.$inferSelect): Property {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    slug: row.slug,
    location: row.location,
    tagline: row.tagline,
    description: row.description,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    phone: row.phone,
    email: row.email,
    rooms: row.rooms,
    amenities: row.amenities,
    policies: row.policies,
    recommendations: row.recommendations,
    setupComplete: row.setupComplete,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }
}

function articleFromRow(row: typeof articles.$inferSelect): Article {
  return {
    id: row.id,
    propertyId: row.propertyId,
    title: row.title,
    category: row.category,
    body: row.body,
    published: row.published,
    source: row.source,
    updatedAt: iso(row.updatedAt),
  }
}

function conversationFromRow(row: typeof conversations.$inferSelect): Conversation {
  return {
    id: row.id,
    propertyId: row.propertyId,
    guestLabel: row.guestLabel,
    room: row.room,
    topic: row.topic,
    status: row.status,
    escalated: row.escalated,
    lastMessagePreview: row.lastMessagePreview,
    guestTokenHash: row.guestTokenHash,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }
}

function messageFromRow(row: typeof messages.$inferSelect): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    role: row.role,
    content: row.content,
    grounded: row.grounded,
    sample: row.sample,
    citations: row.citations,
    createdAt: iso(row.createdAt),
  }
}

function ticketFromRow(row: typeof tickets.$inferSelect): Ticket {
  return {
    id: row.id,
    propertyId: row.propertyId,
    conversationId: row.conversationId,
    type: row.type,
    room: row.room,
    guestLabel: row.guestLabel,
    summary: row.summary,
    status: row.status,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }
}

function propertyValues(property: Property) {
  return {
    id: property.id,
    ownerId: property.ownerId,
    name: property.name,
    slug: property.slug,
    location: property.location,
    tagline: property.tagline,
    description: property.description,
    checkIn: property.checkIn,
    checkOut: property.checkOut,
    phone: property.phone,
    email: property.email,
    rooms: property.rooms,
    amenities: property.amenities,
    policies: property.policies,
    recommendations: property.recommendations,
    setupComplete: property.setupComplete,
    createdAt: new Date(property.createdAt),
    updatedAt: new Date(property.updatedAt),
  }
}

function ticketOrder(status: TicketStatus): number {
  if (status === "open") return 0
  if (status === "in_progress") return 1
  return 2
}

export const postgresStore: Store = {
  mode: "database",

  async getProperty(id) {
    const rows = await db().select().from(properties).where(eq(properties.id, id)).limit(1)
    return rows[0] ? propertyFromRow(rows[0]) : null
  },

  async getPropertyForOwner(ownerId) {
    const rows = await db().select().from(properties).where(eq(properties.ownerId, ownerId)).limit(1)
    return rows[0] ? propertyFromRow(rows[0]) : null
  },

  async getPropertyBySlug(slug) {
    const rows = await db().select().from(properties).where(eq(properties.slug, slug)).limit(1)
    return rows[0] ? propertyFromRow(rows[0]) : null
  },

  async slugTaken(slug, exceptId) {
    const rows = await db().select().from(properties).where(eq(properties.slug, slug)).limit(1)
    return Boolean(rows[0] && rows[0].id !== exceptId)
  },

  async createProperty(ownerId, slug, input: PropertyInput) {
    const now = new Date().toISOString()
    const property: Property = {
      id: crypto.randomUUID(),
      ownerId,
      slug,
      ...input,
      setupComplete: true,
      createdAt: now,
      updatedAt: now,
    }
    await db().insert(properties).values(propertyValues(property))
    return property
  },

  async updateProperty(id, ownerId, input, demo) {
    const current = await this.getProperty(id)
    if (!current) return null
    if (!demo && current.ownerId !== ownerId) return null
    const next: Property = {
      ...current,
      ...input,
      setupComplete: true,
      updatedAt: new Date().toISOString(),
    }
    await db()
      .update(properties)
      .set(propertyValues(next))
      .where(eq(properties.id, id))
    return next
  },

  async listArticles(propertyId) {
    const rows = await db().select().from(articles).where(eq(articles.propertyId, propertyId))
    return rows.map(articleFromRow).sort((a, b) => a.title.localeCompare(b.title))
  },

  async replaceProfileArticles(propertyId, nextArticles) {
    const database = db()
    await database.delete(articles).where(and(eq(articles.propertyId, propertyId), eq(articles.source, "profile")))
    if (nextArticles.length === 0) return
    await database.insert(articles).values(
      nextArticles.map((article) => ({
        id: article.id,
        propertyId: article.propertyId,
        title: article.title,
        category: article.category,
        body: article.body,
        published: article.published,
        source: article.source,
        updatedAt: new Date(article.updatedAt),
      })),
    )
  },

  async createArticle(article) {
    await db().insert(articles).values({
      id: article.id,
      propertyId: article.propertyId,
      title: article.title,
      category: article.category,
      body: article.body,
      published: article.published,
      source: article.source,
      updatedAt: new Date(article.updatedAt),
    })
    return article
  },

  async updateArticle(id, propertyId, patch: ArticlePatch) {
    const rows = await db()
      .select()
      .from(articles)
      .where(and(eq(articles.id, id), eq(articles.propertyId, propertyId)))
      .limit(1)
    const current = rows[0] ? articleFromRow(rows[0]) : null
    if (!current || current.source === "profile") return null
    const next: Article = {
      ...current,
      ...patch,
      updatedAt: patch.updatedAt ?? new Date().toISOString(),
    }
    await db()
      .update(articles)
      .set({
        title: next.title,
        category: next.category,
        body: next.body,
        published: next.published,
        updatedAt: new Date(next.updatedAt),
      })
      .where(eq(articles.id, id))
    return next
  },

  async deleteArticle(id, propertyId) {
    const rows = await db()
      .select()
      .from(articles)
      .where(and(eq(articles.id, id), eq(articles.propertyId, propertyId)))
      .limit(1)
    if (!rows[0] || rows[0].source === "profile") return false
    await db().delete(articles).where(eq(articles.id, id))
    return true
  },

  async listConversations(propertyId) {
    const rows = await db().select().from(conversations).where(eq(conversations.propertyId, propertyId))
    return rows.map(conversationFromRow).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  async getConversation(id) {
    const rows = await db().select().from(conversations).where(eq(conversations.id, id)).limit(1)
    return rows[0] ? conversationFromRow(rows[0]) : null
  },

  async createConversation(conversation) {
    await db().insert(conversations).values({
      id: conversation.id,
      propertyId: conversation.propertyId,
      guestLabel: conversation.guestLabel,
      room: conversation.room,
      topic: conversation.topic as Topic,
      status: conversation.status,
      escalated: conversation.escalated,
      lastMessagePreview: conversation.lastMessagePreview,
      guestTokenHash: conversation.guestTokenHash,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
    })
    return conversation
  },

  async listMessages(conversationId) {
    const rows = await db().select().from(messages).where(eq(messages.conversationId, conversationId))
    return rows.map(messageFromRow).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },

  async addMessage(message) {
    await db().insert(messages).values({
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      grounded: message.grounded,
      sample: message.sample,
      citations: message.citations,
      createdAt: new Date(message.createdAt),
    })
    return message
  },

  async updateConversation(id, patch: ConversationPatch) {
    const current = await this.getConversation(id)
    if (!current) return null
    const next = { ...current, ...patch }
    await db()
      .update(conversations)
      .set({
        guestLabel: next.guestLabel,
        room: next.room,
        topic: next.topic,
        status: next.status,
        escalated: next.escalated,
        lastMessagePreview: next.lastMessagePreview,
        updatedAt: new Date(next.updatedAt),
      })
      .where(eq(conversations.id, id))
    return next
  },

  async listTickets(propertyId) {
    const rows = await db().select().from(tickets).where(eq(tickets.propertyId, propertyId))
    return rows
      .map(ticketFromRow)
      .sort((a, b) => ticketOrder(a.status) - ticketOrder(b.status) || b.updatedAt.localeCompare(a.updatedAt))
  },

  async createTicket(ticket) {
    await db().insert(tickets).values({
      id: ticket.id,
      propertyId: ticket.propertyId,
      conversationId: ticket.conversationId,
      type: ticket.type as TicketType,
      room: ticket.room,
      guestLabel: ticket.guestLabel,
      summary: ticket.summary,
      status: ticket.status as TicketStatus,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
    })
    return ticket
  },

  async updateTicketStatus(id, propertyId, status) {
    const rows = await db()
      .select()
      .from(tickets)
      .where(and(eq(tickets.id, id), eq(tickets.propertyId, propertyId)))
      .limit(1)
    if (!rows[0]) return null
    const next = ticketFromRow(rows[0])
    next.status = status
    next.updatedAt = new Date().toISOString()
    await db()
      .update(tickets)
      .set({ status, updatedAt: new Date(next.updatedAt) })
      .where(eq(tickets.id, id))
    return next
  },

  async findOpenTicket(propertyId, conversationId, type) {
    const rows = await db()
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.propertyId, propertyId),
          eq(tickets.conversationId, conversationId),
          eq(tickets.type, type),
        ),
      )
    const open = rows.map(ticketFromRow).find((ticket) => ticket.status !== "done")
    return open ?? null
  },

  async importGraph(graph: Graph) {
    const existing = await this.getPropertyBySlug(graph.property.slug)
    if (existing) return
    const database = db()
    await database.transaction(async (tx) => {
      await tx.insert(properties).values(propertyValues(graph.property))
      if (graph.articles.length) {
        await tx.insert(articles).values(
          graph.articles.map((article) => ({
            id: article.id,
            propertyId: article.propertyId,
            title: article.title,
            category: article.category,
            body: article.body,
            published: article.published,
            source: article.source,
            updatedAt: new Date(article.updatedAt),
          })),
        )
      }
      if (graph.conversations.length) {
        await tx.insert(conversations).values(
          graph.conversations.map((conversation) => ({
            id: conversation.id,
            propertyId: conversation.propertyId,
            guestLabel: conversation.guestLabel,
            room: conversation.room,
            topic: conversation.topic,
            status: conversation.status,
            escalated: conversation.escalated,
            lastMessagePreview: conversation.lastMessagePreview,
            guestTokenHash: conversation.guestTokenHash,
            createdAt: new Date(conversation.createdAt),
            updatedAt: new Date(conversation.updatedAt),
          })),
        )
      }
      if (graph.messages.length) {
        await tx.insert(messages).values(
          graph.messages.map((message) => ({
            id: message.id,
            conversationId: message.conversationId,
            role: message.role,
            content: message.content,
            grounded: message.grounded,
            sample: message.sample,
            citations: message.citations,
            createdAt: new Date(message.createdAt),
          })),
        )
      }
      if (graph.tickets.length) {
        await tx.insert(tickets).values(
          graph.tickets.map((ticket) => ({
            id: ticket.id,
            propertyId: ticket.propertyId,
            conversationId: ticket.conversationId,
            type: ticket.type,
            room: ticket.room,
            guestLabel: ticket.guestLabel,
            summary: ticket.summary,
            status: ticket.status,
            createdAt: new Date(ticket.createdAt),
            updatedAt: new Date(ticket.updatedAt),
          })),
        )
      }
    })
  },

  async analytics(propertyId) {
    const [conversationRows, ticketRows] = await Promise.all([
      this.listConversations(propertyId),
      this.listTickets(propertyId),
    ])
    return computeAnalytics(conversationRows, ticketRows)
  },
}
