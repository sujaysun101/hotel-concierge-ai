import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { formatHouseBook } from "@/lib/house-book"
import { answerFromHouseBook, detectRequest, findRoom } from "@/lib/ai/sample"
import { TOPICS, TICKET_TYPES, type DeskAnswer, type HouseEntry, type Room } from "@/lib/types"

const MAX_TOKENS = 700

const modelSchema = z.object({
  reply: z.string().min(1).max(1800),
  grounded: z.boolean(),
  escalate: z.boolean(),
  topic: z.enum(TOPICS),
  citations: z.array(z.string()).max(6),
  request: z
    .object({
      type: z.enum(TICKET_TYPES),
      summary: z.string().min(1).max(400),
      room: z.string().max(80).nullable(),
    })
    .nullable(),
})

const HOLDING =
  "I don't have that in the house book, so I don't want to guess. I'll ask the front desk to follow up."

function extractJson(text: string): unknown {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

function enforceGrounding(
  answer: DeskAnswer,
  entries: HouseEntry[],
  message: string,
  rooms: Pick<Room, "name">[],
): DeskAnswer {
  const known = new Set(entries.map((entry) => entry.id))
  const citations = answer.citations.filter((id) => known.has(id))
  const detected = detectRequest(message)
  const room = answer.request?.room || findRoom(message, rooms)
  let request = answer.request
  if (!request && detected) {
    request = { type: detected.type, summary: message.trim().slice(0, 180), room }
  }
  if (request && !detected && request.type !== "other") {
    request = null
  }

  const grounded = answer.grounded && citations.length > 0
  if (!grounded) {
    return {
      reply: HOLDING,
      grounded: false,
      escalate: true,
      topic: detected?.topic ?? answer.topic ?? "other",
      citations: [],
      request: request ?? { type: "other", summary: message.trim().slice(0, 180), room },
    }
  }

  const escalate = answer.escalate || Boolean(request)
  let reply = answer.reply.trim()
  if (request && !/front desk/i.test(reply)) {
    reply = `${reply} I've sent this to the front desk.`
  }
  return {
    reply,
    grounded: true,
    escalate,
    topic: detected?.topic ?? answer.topic,
    citations,
    request,
  }
}

export async function answerGuest(input: {
  propertyName: string
  message: string
  entries: HouseEntry[]
  rooms: Pick<Room, "name">[]
  history: { role: "guest" | "assistant" | "staff"; content: string }[]
}): Promise<{ answer: DeskAnswer; sample: boolean; degraded: boolean }> {
  const fallback = answerFromHouseBook(input.message, input.entries, input.rooms)
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { answer: fallback, sample: true, degraded: false }
  }

  try {
    const client = new Anthropic({ apiKey })
    const history = input.history.slice(-8).map((message) => ({
      role: message.role === "guest" ? ("user" as const) : ("assistant" as const),
      content: message.role === "staff" ? `Front desk: ${message.content}` : message.content,
    }))
    const response = await client.messages.create({
      model: process.env.AI_MODEL || "claude-sonnet-4-5",
      max_tokens: MAX_TOKENS,
      system: [
        `You are the front desk at ${input.propertyName}.`,
        "Answer ONLY from the house book below. Do not use outside knowledge, even about the town.",
        "If the house book does not contain the answer, set grounded to false, escalate to true, citations to [], and say you will ask the front desk. Do not guess.",
        "Never invent a password, price, time, room, or place.",
        "If the guest wants late checkout, towels brought to the room, or a repair, include a request object.",
        "A question about where towels are is not a request. A question about checkout time is not a late-checkout request.",
        "Cite the entry ids you used. grounded must be false when citations is empty.",
        "Reply in plain sentences, under 120 words.",
        'Return JSON only: {"reply":"","grounded":true,"escalate":false,"topic":"other","citations":[],"request":null}',
        `topic is one of: ${TOPICS.join(", ")}.`,
        "request is null or {type, summary, room}. type is late_checkout, towels, maintenance, or other.",
        "",
        "House book:",
        formatHouseBook(input.entries),
      ].join("\n"),
      messages: [...history, { role: "user", content: input.message }],
    })
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
    const parsed = modelSchema.safeParse(extractJson(text))
    if (!parsed.success) {
      return { answer: fallback, sample: true, degraded: true }
    }
    return {
      answer: enforceGrounding(parsed.data, input.entries, input.message, input.rooms),
      sample: false,
      degraded: false,
    }
  } catch {
    return { answer: fallback, sample: true, degraded: true }
  }
}
