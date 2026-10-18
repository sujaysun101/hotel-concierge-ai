import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import type { Amenity, Policy, Recommendation, Room, TicketStatus, TicketType, Topic } from "@/lib/types"

export const properties = pgTable(
  "properties",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    location: text("location").notNull().default(""),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    checkIn: text("check_in").notNull().default("3:00 PM"),
    checkOut: text("check_out").notNull().default("11:00 AM"),
    phone: text("phone").notNull().default(""),
    email: text("email").notNull().default(""),
    rooms: jsonb("rooms").$type<Room[]>().notNull(),
    amenities: jsonb("amenities").$type<Amenity[]>().notNull(),
    policies: jsonb("policies").$type<Policy[]>().notNull(),
    recommendations: jsonb("recommendations").$type<Recommendation[]>().notNull(),
    setupComplete: boolean("setup_complete").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("properties_owner_idx").on(table.ownerId),
    uniqueIndex("properties_slug_idx").on(table.slug),
  ],
)

export const articles = pgTable(
  "articles",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    body: text("body").notNull(),
    published: boolean("published").notNull().default(true),
    source: text("source").$type<"profile" | "custom">().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("articles_property_idx").on(table.propertyId)],
)

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id").notNull(),
    guestLabel: text("guest_label").notNull(),
    room: text("room").notNull().default(""),
    topic: text("topic").$type<Topic>().notNull(),
    status: text("status").$type<"open" | "resolved">().notNull(),
    escalated: boolean("escalated").notNull().default(false),
    lastMessagePreview: text("last_message_preview").notNull().default(""),
    guestTokenHash: text("guest_token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("conversations_property_idx").on(table.propertyId)],
)

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    role: text("role").$type<"guest" | "assistant" | "staff">().notNull(),
    content: text("content").notNull(),
    grounded: boolean("grounded").notNull().default(false),
    sample: boolean("sample").notNull().default(false),
    citations: jsonb("citations").$type<string[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId)],
)

export const tickets = pgTable(
  "tickets",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id").notNull(),
    conversationId: text("conversation_id"),
    type: text("type").$type<TicketType>().notNull(),
    room: text("room").notNull().default(""),
    guestLabel: text("guest_label").notNull().default(""),
    summary: text("summary").notNull(),
    status: text("status").$type<TicketStatus>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("tickets_property_idx").on(table.propertyId)],
)
