import { computeAnalytics } from "@/lib/analytics"
import { buildLindenHouse } from "@/lib/demo/linden"
import type { PropertyInput } from "@/lib/validators"
import type {
  Article,
  Conversation,
  Graph,
  Message,
  Property,
  Ticket,
  TicketStatus,
} from "@/lib/types"
import type { ArticlePatch, ConversationPatch, Store } from "@/lib/store/types"

type State = {
  properties: Property[]
  articles: Article[]
  conversations: Conversation[]
  messages: Message[]
  tickets: Ticket[]
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function state(): State {
  const globalState = globalThis as unknown as { __turndownState?: State }
  if (!globalState.__turndownState) {
    const graph = buildLindenHouse("demo")
    globalState.__turndownState = {
      properties: [graph.property],
      articles: graph.articles,
      conversations: graph.conversations,
      messages: graph.messages,
      tickets: graph.tickets,
    }
  }
  return globalState.__turndownState
}

function ticketOrder(status: TicketStatus): number {
  if (status === "open") return 0
  if (status === "in_progress") return 1
  return 2
}

function propertyFromInput(id: string, ownerId: string, slug: string, input: PropertyInput, createdAt: string): Property {
  const now = new Date().toISOString()
  return {
    id,
    ownerId,
    slug,
    ...input,
    setupComplete: true,
    createdAt,
    updatedAt: now,
  }
}

export const memoryStore: Store = {
  mode: "demo",

  async getProperty(id) {
    const found = state().properties.find((property) => property.id === id)
    return found ? clone(found) : null
  },

  async getPropertyForOwner(ownerId) {
    const found = state().properties.find((property) => property.ownerId === ownerId)
    return found ? clone(found) : null
  },

  async getPropertyBySlug(slug) {
    const found = state().properties.find((property) => property.slug === slug)
    return found ? clone(found) : null
  },

  async slugTaken(slug, exceptId) {
    return state().properties.some((property) => property.slug === slug && property.id !== exceptId)
  },

  async createProperty(ownerId, slug, input) {
    const property = propertyFromInput(crypto.randomUUID(), ownerId, slug, input, new Date().toISOString())
    state().properties.push(property)
    return clone(property)
  },

  async updateProperty(id, ownerId, input, demo) {
    const db = state()
    const index = db.properties.findIndex(
      (property) => property.id === id && (demo || property.ownerId === ownerId),
    )
    const current = db.properties[index]
    if (!current) return null
    const next = propertyFromInput(current.id, current.ownerId, current.slug, input, current.createdAt)
    db.properties[index] = next
    return clone(next)
  },

  async listArticles(propertyId) {
    return state()
      .articles.filter((article) => article.propertyId === propertyId)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(clone)
  },

  async replaceProfileArticles(propertyId, articles) {
    const db = state()
    db.articles = db.articles.filter((article) => article.propertyId !== propertyId || article.source !== "profile")
    db.articles.push(...articles.map(clone))
  },

  async createArticle(article) {
    state().articles.push(clone(article))
    return clone(article)
  },

  async updateArticle(id, propertyId, patch: ArticlePatch) {
    const db = state()
    const index = db.articles.findIndex((article) => article.id === id && article.propertyId === propertyId)
    const current = db.articles[index]
    if (!current || current.source === "profile") return null
    const next = { ...current, ...patch, updatedAt: patch.updatedAt ?? new Date().toISOString() }
    db.articles[index] = next
    return clone(next)
  },

  async deleteArticle(id, propertyId) {
    const db = state()
    const article = db.articles.find((item) => item.id === id && item.propertyId === propertyId)
    if (!article || article.source === "profile") return false
    db.articles = db.articles.filter((item) => item.id !== id)
    return true
  },

  async listConversations(propertyId) {
    return state()
      .conversations.filter((conversation) => conversation.propertyId === propertyId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(clone)
  },

  async getConversation(id) {
    const found = state().conversations.find((conversation) => conversation.id === id)
    return found ? clone(found) : null
  },

  async createConversation(conversation) {
    state().conversations.push(clone(conversation))
    return clone(conversation)
  },

  async listMessages(conversationId) {
    return state()
      .messages.filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(clone)
  },

  async addMessage(message) {
    state().messages.push(clone(message))
    return clone(message)
  },

  async updateConversation(id, patch: ConversationPatch) {
    const db = state()
    const index = db.conversations.findIndex((conversation) => conversation.id === id)
    const current = db.conversations[index]
    if (!current) return null
    const next = { ...current, ...patch }
    db.conversations[index] = next
    return clone(next)
  },

  async listTickets(propertyId) {
    return state()
      .tickets.filter((ticket) => ticket.propertyId === propertyId)
      .sort((a, b) => ticketOrder(a.status) - ticketOrder(b.status) || b.updatedAt.localeCompare(a.updatedAt))
      .map(clone)
  },

  async createTicket(ticket) {
    state().tickets.push(clone(ticket))
    return clone(ticket)
  },

  async updateTicketStatus(id, propertyId, status) {
    const db = state()
    const index = db.tickets.findIndex((ticket) => ticket.id === id && ticket.propertyId === propertyId)
    const current = db.tickets[index]
    if (!current) return null
    const next: Ticket = { ...current, status, updatedAt: new Date().toISOString() }
    db.tickets[index] = next
    return clone(next)
  },

  async findOpenTicket(propertyId, conversationId, type) {
    const found = state().tickets.find(
      (ticket) =>
        ticket.propertyId === propertyId &&
        ticket.conversationId === conversationId &&
        ticket.type === type &&
        ticket.status !== "done",
    )
    return found ? clone(found) : null
  },

  async importGraph(graph: Graph) {
    const db = state()
    if (db.properties.some((property) => property.id === graph.property.id || property.slug === graph.property.slug)) {
      return
    }
    db.properties.push(clone(graph.property))
    db.articles.push(...graph.articles.map(clone))
    db.conversations.push(...graph.conversations.map(clone))
    db.messages.push(...graph.messages.map(clone))
    db.tickets.push(...graph.tickets.map(clone))
  },

  async analytics(propertyId) {
    const conversations = await this.listConversations(propertyId)
    const tickets = await this.listTickets(propertyId)
    return computeAnalytics(conversations, tickets)
  },
}
