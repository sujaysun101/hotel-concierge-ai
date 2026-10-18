import type { PropertyInput } from "@/lib/validators"
import type {
  Analytics,
  Article,
  Conversation,
  Graph,
  Message,
  Property,
  Ticket,
  TicketStatus,
  TicketType,
} from "@/lib/types"

export type ConversationPatch = Partial<
  Pick<
    Conversation,
    "status" | "escalated" | "topic" | "room" | "guestLabel" | "lastMessagePreview" | "updatedAt"
  >
>

export type ArticlePatch = Partial<Pick<Article, "title" | "category" | "body" | "published" | "updatedAt">>

export type Store = {
  mode: "demo" | "database"
  getProperty(id: string): Promise<Property | null>
  getPropertyForOwner(ownerId: string): Promise<Property | null>
  getPropertyBySlug(slug: string): Promise<Property | null>
  slugTaken(slug: string, exceptId?: string): Promise<boolean>
  createProperty(ownerId: string, slug: string, input: PropertyInput): Promise<Property>
  updateProperty(id: string, ownerId: string, input: PropertyInput, demo: boolean): Promise<Property | null>
  listArticles(propertyId: string): Promise<Article[]>
  replaceProfileArticles(propertyId: string, articles: Article[]): Promise<void>
  createArticle(article: Article): Promise<Article>
  updateArticle(id: string, propertyId: string, patch: ArticlePatch): Promise<Article | null>
  deleteArticle(id: string, propertyId: string): Promise<boolean>
  listConversations(propertyId: string): Promise<Conversation[]>
  getConversation(id: string): Promise<Conversation | null>
  createConversation(conversation: Conversation): Promise<Conversation>
  listMessages(conversationId: string): Promise<Message[]>
  addMessage(message: Message): Promise<Message>
  updateConversation(id: string, patch: ConversationPatch): Promise<Conversation | null>
  listTickets(propertyId: string): Promise<Ticket[]>
  createTicket(ticket: Ticket): Promise<Ticket>
  updateTicketStatus(id: string, propertyId: string, status: TicketStatus): Promise<Ticket | null>
  findOpenTicket(propertyId: string, conversationId: string, type: TicketType): Promise<Ticket | null>
  importGraph(graph: Graph): Promise<void>
  analytics(propertyId: string): Promise<Analytics>
}
