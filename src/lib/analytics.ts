import {
  TICKET_TYPES,
  TOPIC_LABELS,
  TICKET_LABELS,
  TOPICS,
  type Analytics,
  type Conversation,
  type Ticket,
  type Topic,
} from "@/lib/types"

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function shortLabel(day: string): string {
  const [year, month, date] = day.split("-").map(Number)
  const value = new Date(Date.UTC(year, (month ?? 1) - 1, date ?? 1))
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(value)
}

export function computeAnalytics(
  conversations: Conversation[],
  tickets: Ticket[],
  now = new Date(),
): Analytics {
  const days: string[] = []
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() - i)
    days.push(utcDay(date))
  }
  const daySet = new Set(days)

  const dailyMap = new Map(days.map((day) => [day, { conversations: 0, resolved: 0 }]))
  const topicMap = new Map<Topic, number>(TOPICS.map((topic) => [topic, 0]))

  let resolved = 0
  let open = 0
  let escalated = 0

  for (const conversation of conversations) {
    if (conversation.status === "resolved") resolved += 1
    else open += 1
    if (conversation.escalated) escalated += 1
    topicMap.set(conversation.topic, (topicMap.get(conversation.topic) ?? 0) + 1)
    const day = conversation.createdAt.slice(0, 10)
    if (daySet.has(day)) {
      const bucket = dailyMap.get(day)
      if (bucket) {
        bucket.conversations += 1
        if (conversation.status === "resolved") bucket.resolved += 1
      }
    }
  }

  const typeMap = new Map(TICKET_TYPES.map((type) => [type, 0]))
  let openRequests = 0
  for (const ticket of tickets) {
    typeMap.set(ticket.type, (typeMap.get(ticket.type) ?? 0) + 1)
    if (ticket.status !== "done") openRequests += 1
  }

  const totalConversations = conversations.length

  return {
    totalConversations,
    resolved,
    open,
    escalated,
    resolutionRate: totalConversations === 0 ? null : resolved / totalConversations,
    topQuestions: TOPICS.map((topic) => ({
      topic,
      label: TOPIC_LABELS[topic],
      count: topicMap.get(topic) ?? 0,
    }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count),
    requestsByType: TICKET_TYPES.map((type) => ({
      type,
      label: TICKET_LABELS[type],
      count: typeMap.get(type) ?? 0,
    })),
    daily: days.map((date) => ({
      date,
      label: shortLabel(date),
      conversations: dailyMap.get(date)?.conversations ?? 0,
      resolved: dailyMap.get(date)?.resolved ?? 0,
    })),
    openRequests,
  }
}
