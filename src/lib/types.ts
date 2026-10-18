export const TOPICS = [
  "breakfast",
  "arrival",
  "departure",
  "wifi",
  "pets",
  "dining",
  "nearby",
  "housekeeping",
  "maintenance",
  "policies",
  "other",
] as const

export type Topic = (typeof TOPICS)[number]

export const TICKET_TYPES = ["late_checkout", "towels", "maintenance", "other"] as const
export type TicketType = (typeof TICKET_TYPES)[number]

export const TICKET_STATUSES = ["open", "in_progress", "done"] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TOPIC_LABELS: Record<Topic, string> = {
  breakfast: "Breakfast",
  arrival: "Arrival",
  departure: "Checkout",
  wifi: "Wi-Fi",
  pets: "Pets",
  dining: "Dinner nearby",
  nearby: "Nearby",
  housekeeping: "Towels and linens",
  maintenance: "Something to fix",
  policies: "Policies",
  other: "Other",
}

export const TICKET_LABELS: Record<TicketType, string> = {
  late_checkout: "Late checkout",
  towels: "Towels",
  maintenance: "Maintenance",
  other: "Other",
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
}

export type Room = {
  id: string
  name: string
  type: string
  sleeps: number
  description: string
}

export type Amenity = {
  id: string
  name: string
  detail: string
}

export type Policy = {
  id: string
  title: string
  body: string
}

export type Recommendation = {
  id: string
  name: string
  category: "dining" | "outing" | "transit"
  detail: string
  distance: string
}

export type Property = {
  id: string
  ownerId: string
  name: string
  slug: string
  location: string
  tagline: string
  description: string
  checkIn: string
  checkOut: string
  phone: string
  email: string
  rooms: Room[]
  amenities: Amenity[]
  policies: Policy[]
  recommendations: Recommendation[]
  setupComplete: boolean
  createdAt: string
  updatedAt: string
}

export type Article = {
  id: string
  propertyId: string
  title: string
  category: string
  body: string
  published: boolean
  source: "profile" | "custom"
  updatedAt: string
}

export type Conversation = {
  id: string
  propertyId: string
  guestLabel: string
  room: string
  topic: Topic
  status: "open" | "resolved"
  escalated: boolean
  lastMessagePreview: string
  guestTokenHash: string
  createdAt: string
  updatedAt: string
}

export type PublicConversation = Omit<Conversation, "guestTokenHash">

export type Message = {
  id: string
  conversationId: string
  role: "guest" | "assistant" | "staff"
  content: string
  grounded: boolean
  sample: boolean
  citations: string[]
  createdAt: string
}

export type Ticket = {
  id: string
  propertyId: string
  conversationId: string | null
  type: TicketType
  room: string
  guestLabel: string
  summary: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
}

export type Graph = {
  property: Property
  articles: Article[]
  conversations: Conversation[]
  messages: Message[]
  tickets: Ticket[]
}

export type HouseEntry = {
  id: string
  title: string
  category: string
  body: string
}

export type DeskRequest = {
  type: TicketType
  summary: string
  room: string | null
}

export type DeskAnswer = {
  reply: string
  grounded: boolean
  escalate: boolean
  topic: Topic
  citations: string[]
  request: DeskRequest | null
}

export type Analytics = {
  totalConversations: number
  resolved: number
  open: number
  escalated: number
  resolutionRate: number | null
  topQuestions: { topic: Topic; label: string; count: number }[]
  requestsByType: { type: TicketType; label: string; count: number }[]
  daily: { date: string; label: string; conversations: number; resolved: number }[]
  openRequests: number
}

export function toPublicConversation(conversation: Conversation): PublicConversation {
  const { guestTokenHash, ...publicConversation } = conversation
  void guestTokenHash
  return publicConversation
}
