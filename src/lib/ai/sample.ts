import { topicFromCategory } from "@/lib/house-book"
import type { DeskAnswer, HouseEntry, Room, TicketType, Topic } from "@/lib/types"

const STOP = new Set([
  "the", "and", "for", "you", "our", "can", "what", "when", "where", "how", "is", "are",
  "a", "to", "of", "in", "on", "please", "there", "this", "that", "with", "have", "do",
  "does", "time", "your", "we", "i", "my", "me", "it", "at", "from", "about", "any",
  "would", "could", "should", "just", "like", "need", "want", "get", "tell",
])

const REQUEST_RULES: { type: TicketType; topic: Topic; detect: RegExp; act: RegExp }[] = [
  {
    type: "late_checkout",
    topic: "departure",
    detect: /late check-?out|check-?out later|leave later|stay past|extend (my |our )?check-?out|check out at|checkout at|stay until/i,
    act: /late|later|extend|until|past|after 11|12:30|one more hour/i,
  },
  {
    type: "towels",
    topic: "housekeeping",
    detect: /towel|bath mat|washcloth|extra linen/i,
    act: /bring|send|deliver|need|can (i|we) get|could (i|we) get|another|two extra|more towel/i,
  },
  {
    type: "maintenance",
    topic: "maintenance",
    detect: /leak|drip|radiator|broken|toilet|light ?bulb|no hot water|won't lock|knocking/i,
    act: /cold|leak|drip|broken|not working|won't|knock|no heat|no hot|stuck|burst/i,
  },
]

export function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/wi-fi/g, "wifi")
    .replace(/check-in/g, "checkin")
    .replace(/check-out/g, "checkout")
    .replace(/gluten-free/g, "glutenfree")
  return normalized.split(/[^a-z0-9]+/).filter((word) => word.length >= 3 && !STOP.has(word))
}

function scoreEntry(entry: HouseEntry, words: string[]): number {
  const titleWords = new Set(tokenize(entry.title))
  const bodyWords = new Set(tokenize(entry.body))
  let score = 0
  for (const word of words) {
    if (titleWords.has(word)) score += 3
    else if (bodyWords.has(word)) score += 1
  }
  return score
}

function chunks(body: string): string[] {
  return body
    .split(/\n+|(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function excerpt(entry: HouseEntry, words: string[]): string {
  const parts = chunks(entry.body)
  const hits = parts.filter((part) => {
    const tokens = tokenize(part)
    return words.some((word) => tokens.includes(word) || part.toLowerCase().includes(word))
  })
  const chosen = (hits.length > 0 ? hits : parts).slice(0, 3)
  return chosen.join(" ")
}

export function findRoom(message: string, rooms: Pick<Room, "name">[]): string | null {
  const lower = message.toLowerCase()
  for (const room of rooms) {
    if (room.name && lower.includes(room.name.toLowerCase())) return room.name
  }
  return null
}

export function detectRequest(message: string): { type: TicketType; topic: Topic } | null {
  for (const rule of REQUEST_RULES) {
    if (rule.detect.test(message) && rule.act.test(message)) {
      return { type: rule.type, topic: rule.topic }
    }
  }
  return null
}

export function answerFromHouseBook(
  message: string,
  entries: HouseEntry[],
  rooms: Pick<Room, "name">[] = [],
): DeskAnswer {
  const words = tokenize(message)
  let best: HouseEntry | null = null
  let bestScore = 0
  for (const entry of entries) {
    const score = scoreEntry(entry, words)
    if (score > bestScore) {
      best = entry
      bestScore = score
    }
  }

  const requestHit = detectRequest(message)
  const room = findRoom(message, rooms)
  const summary = message.trim().slice(0, 180)

  if (!best || bestScore < 3) {
    return {
      reply: "I don't have that in the house book, so I don't want to guess. I'll ask the front desk to follow up.",
      grounded: false,
      escalate: true,
      topic: requestHit?.topic ?? "other",
      citations: [],
      request: requestHit
        ? { type: requestHit.type, summary, room }
        : { type: "other", summary, room },
    }
  }

  const replyBody = excerpt(best, words)
  const request = requestHit ? { type: requestHit.type, summary, room } : null
  const reply = request
    ? `${replyBody} I've sent this to the front desk.`
    : replyBody

  return {
    reply,
    grounded: true,
    escalate: Boolean(request),
    topic: requestHit?.topic ?? topicFromCategory(best.category),
    citations: [best.id],
    request,
  }
}
