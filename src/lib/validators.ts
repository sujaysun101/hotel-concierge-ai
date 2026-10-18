import { z } from "zod"
import { TICKET_STATUSES, TICKET_TYPES } from "@/lib/types"

const id = z.string().trim().min(1).max(80)

export const roomSchema = z.object({
  id,
  name: z.string().trim().min(1).max(80),
  type: z.string().trim().min(1).max(40),
  sleeps: z.number().int().min(1).max(8),
  description: z.string().trim().max(400),
})

export const amenitySchema = z.object({
  id,
  name: z.string().trim().min(1).max(80),
  detail: z.string().trim().max(600),
})

export const policySchema = z.object({
  id,
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().max(800),
})

export const recommendationSchema = z.object({
  id,
  name: z.string().trim().min(1).max(80),
  category: z.enum(["dining", "outing", "transit"]),
  detail: z.string().trim().max(500),
  distance: z.string().trim().max(80),
})

export const propertyInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  location: z.string().trim().max(160),
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(800),
  phone: z.string().trim().max(40),
  email: z.string().trim().max(120),
  checkIn: z.string().trim().min(1).max(20),
  checkOut: z.string().trim().min(1).max(20),
  rooms: z.array(roomSchema).max(40),
  amenities: z.array(amenitySchema).max(40),
  policies: z.array(policySchema).max(40),
  recommendations: z.array(recommendationSchema).max(40),
})

export const articleInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(40),
  body: z.string().trim().min(2).max(2000),
  published: z.boolean(),
})

export const ticketStatusSchema = z.object({
  id,
  status: z.enum(TICKET_STATUSES),
})

export const staffReplySchema = z.object({
  conversationId: id,
  content: z.string().trim().min(1).max(1000),
})

export const conversationStatusSchema = z.object({
  conversationId: id,
  status: z.enum(["open", "resolved"]),
})

const guestToken = z.string().trim().min(16).max(120)

export const widgetChatSchema = z
  .object({
    message: z.string().trim().min(1).max(1000),
    conversationId: id.optional(),
    guestToken: guestToken.optional(),
    guestLabel: z.string().trim().max(80).optional(),
    room: z.string().trim().max(80).optional(),
  })
  .refine((value) => !value.conversationId || Boolean(value.guestToken), {
    message: "A guest token is required to continue a conversation.",
  })

export const widgetRequestSchema = z
  .object({
    conversationId: id.optional(),
    guestToken: guestToken.optional(),
    guestLabel: z.string().trim().max(80).optional(),
    room: z.string().trim().max(80).optional(),
    type: z.enum(TICKET_TYPES),
    summary: z.string().trim().min(2).max(400),
  })
  .refine((value) => !value.conversationId || Boolean(value.guestToken), {
    message: "A guest token is required to continue a conversation.",
  })

export type PropertyInput = z.infer<typeof propertyInputSchema>
export type ArticleInput = z.infer<typeof articleInputSchema>

export function issueMessage(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(" ") || "Invalid input"
}
