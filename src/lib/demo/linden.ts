import { createHash } from "node:crypto"
import { profileArticles } from "@/lib/house-book"
import type { Article, Graph, Message, Property, Ticket, TicketStatus, Topic } from "@/lib/types"

const PROPERTY_ID = "prop-linden-house"

const BREAKFAST =
  "Breakfast is cooked to order from 8:00 to 9:30 in the dining room. Tell us the night before if you need gluten-free, dairy-free, or vegetarian. Coffee and tea are in the lounge from 6:30 if you are up earlier."
const PARKING =
  "Three spots sit behind the carriage house, first come. After that, Willow Lane allows overnight street parking. Please don't block the neighbor's drive."
const WIFI =
  "The network is LindenGuest. The password is printed on the card on the desk in your room. If the card is missing, ask the front desk and we will read it to you. We don't send the password in chat."
const ARRIVAL =
  "Check-in is at 3:00 PM. We can usually hold bags from noon. If you need the room earlier, ask the morning you arrive and we will say yes when the room is ready. The key is a real key, left in an envelope at the hall table if we are out."
const LATE =
  "Checkout is 11:00 AM. We can often extend to 12:30 PM when nobody arrives that day. After 12:30 the fee is $40. Ask the desk and we will confirm."
const DOGS =
  "One dog under 30 pounds is welcome in the Garden Room and the Willow Room. The fee is $40 a night. Dogs stay off the beds and out of the dining room during breakfast. Other rooms are not dog rooms."
const TOWELS =
  "Extra towels are in the cupboard at the end of the upstairs hall. If you need more, or a bath mat, tell the desk which room and we will bring them."
const HEAT =
  "The house is heated with radiators. If a room is cold, tell us which room. Please don't shut the radiator valve all the way, and please don't bring a space heater."
const QUIET = "Quiet hours are 10:00 PM to 7:00 AM. The porch is included. If a neighbor's noise is the problem, tell the desk."
const SMOKE = "No smoking, including the porch and the garden."
const CANCEL =
  "Cancel 7 days before arrival for a full refund. Inside 7 days, the first night is kept. We make exceptions for weather that closes the road."
const FIRE =
  "The lounge and the Maple Suite have gas fireplaces. Ask the desk to light them. Please don't try the switch yourself."
const BIKES =
  "Two cruiser bikes live in the shed beside the carriage house. The shed key hangs inside the back door. Helmets are on the shelf. First come, and back by dusk."
const TRAIN =
  "Hudson station is about a ten-minute walk down Warren Street. Amtrak runs to New York City; the trip is usually a little over two hours. Buy tickets on the Amtrak site. We don't book them."
const ICE = "Ice is in the freezer in the guest kitchen, down the hall past the dining room. Glasses are in the cupboard above the sink."
const BOOTS = "Leave muddy boots on the tray inside the back door, not in the hall."
const ATTIC = "The stair to the Attic Twins is steep and turns twice. Tell the desk before you arrive if that will be a problem and we will try to move you."
const CHRISTMAS =
  "From December 23 to 26, breakfast is a set menu at 8:30 rather than cooked to order. Tell us about diets a day ahead."

function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function isoDaysAgo(days: number, hour: number, minute = 12): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  date.setUTCHours(hour, minute, 0, 0)
  return date.toISOString()
}

type Script = {
  id: string
  daysAgo: number
  hour: number
  guestLabel: string
  room: string
  topic: Topic
  status: "open" | "resolved"
  escalated: boolean
  guest: string
  assistant: string
  grounded: boolean
  staff?: string
  ticket?: { type: Ticket["type"]; summary: string; status: TicketStatus; id: string }
}

const SCRIPTS: Script[] = [
  {
    id: "linden-c-01",
    daysAgo: 0,
    hour: 13,
    guestLabel: "Priya Shah",
    room: "Library Room",
    topic: "breakfast",
    status: "resolved",
    escalated: false,
    guest: "Good morning. Is breakfast included, and can you do gluten-free?",
    assistant: BREAKFAST,
    grounded: true,
  },
  {
    id: "linden-c-02",
    daysAgo: 0,
    hour: 15,
    guestLabel: "The Ellisons",
    room: "Maple Suite",
    topic: "departure",
    status: "open",
    escalated: true,
    guest: "Could we have a late checkout tomorrow from the Maple Suite? We'd like to stay until about 12:30.",
    assistant: `${LATE} I've sent this to the front desk.`,
    grounded: true,
    ticket: {
      id: "linden-t-01",
      type: "late_checkout",
      summary: "Late checkout tomorrow from the Maple Suite, until about 12:30.",
      status: "open",
    },
  },
  {
    id: "linden-c-03",
    daysAgo: 1,
    hour: 14,
    guestLabel: "Jonah Adler",
    room: "Garden Room",
    topic: "housekeeping",
    status: "open",
    escalated: true,
    guest: "Could we get two extra bath towels for the Garden Room?",
    assistant: `${TOWELS} I've sent this to the front desk.`,
    grounded: true,
    staff: "On my way up with two bath towels.",
    ticket: {
      id: "linden-t-02",
      type: "towels",
      summary: "Two extra bath towels for the Garden Room.",
      status: "in_progress",
    },
  },
  {
    id: "linden-c-04",
    daysAgo: 1,
    hour: 18,
    guestLabel: "Mina Cho",
    room: "Porch Double",
    topic: "wifi",
    status: "resolved",
    escalated: false,
    guest: "What's the wifi password?",
    assistant: WIFI,
    grounded: true,
  },
  {
    id: "linden-c-05",
    daysAgo: 2,
    hour: 16,
    guestLabel: "Chris Andrade",
    room: "River Loft",
    topic: "arrival",
    status: "resolved",
    escalated: false,
    guest: "Where do we park when we arrive tonight?",
    assistant: PARKING,
    grounded: true,
  },
  {
    id: "linden-c-06",
    daysAgo: 2,
    hour: 20,
    guestLabel: "Helen Cho",
    room: "Willow Room",
    topic: "pets",
    status: "resolved",
    escalated: false,
    guest: "Can we bring our dog? She's 22 pounds.",
    assistant: DOGS,
    grounded: true,
  },
  {
    id: "linden-c-07",
    daysAgo: 3,
    hour: 22,
    guestLabel: "Samir Patel",
    room: "Library Room",
    topic: "dining",
    status: "resolved",
    escalated: false,
    guest: "Where should we eat dinner within walking distance?",
    assistant:
      "Swoon Kitchen Bar is about a six-minute walk, for dinner. Olde York is about eight minutes, also dinner. Cafe Le Perche is a four-minute walk if you want coffee or bread instead.",
    grounded: true,
  },
  {
    id: "linden-c-08",
    daysAgo: 3,
    hour: 17,
    guestLabel: "Guest",
    room: "Porch Double",
    topic: "other",
    status: "open",
    escalated: true,
    guest: "Do you have a pool or a hot tub?",
    assistant: "I don't have that in the house book, so I don't want to guess. I'll ask the front desk to follow up.",
    grounded: false,
    ticket: {
      id: "linden-t-03",
      type: "other",
      summary: "Guest asked whether the house has a pool or a hot tub.",
      status: "open",
    },
  },
  {
    id: "linden-c-09",
    daysAgo: 4,
    hour: 11,
    guestLabel: "The Parkers",
    room: "River Loft",
    topic: "maintenance",
    status: "open",
    escalated: true,
    guest: "The radiator in the River Loft is cold and knocking.",
    assistant: `${HEAT} I've sent this to the front desk.`,
    grounded: true,
    ticket: {
      id: "linden-t-04",
      type: "maintenance",
      summary: "Radiator in the River Loft is cold and knocking.",
      status: "open",
    },
  },
  {
    id: "linden-c-10",
    daysAgo: 5,
    hour: 15,
    guestLabel: "Elena Voss",
    room: "Maple Suite",
    topic: "nearby",
    status: "resolved",
    escalated: false,
    guest: "How do we get the train to New York?",
    assistant: TRAIN,
    grounded: true,
  },
  {
    id: "linden-c-11",
    daysAgo: 6,
    hour: 13,
    guestLabel: "Noah Grant",
    room: "Attic Twins",
    topic: "arrival",
    status: "resolved",
    escalated: false,
    guest: "Is there any chance of an early check-in?",
    assistant: ARRIVAL,
    grounded: true,
  },
  {
    id: "linden-c-12",
    daysAgo: 6,
    hour: 19,
    guestLabel: "Ruth Keller",
    room: "Garden Room",
    topic: "housekeeping",
    status: "resolved",
    escalated: true,
    guest: "Could we get an extra towel for the Garden Room? We used the one by the shower.",
    assistant: `${TOWELS} I've sent this to the front desk.`,
    grounded: true,
    staff: "Left a towel on the chair.",
    ticket: {
      id: "linden-t-05",
      type: "towels",
      summary: "Extra towel for the Garden Room.",
      status: "done",
    },
  },
  {
    id: "linden-c-13",
    daysAgo: 7,
    hour: 12,
    guestLabel: "Owen Blake",
    room: "Willow Room",
    topic: "breakfast",
    status: "resolved",
    escalated: false,
    guest: "Is there coffee before breakfast?",
    assistant: BREAKFAST,
    grounded: true,
  },
  {
    id: "linden-c-14",
    daysAgo: 8,
    hour: 21,
    guestLabel: "A. Nguyen",
    room: "Library Room",
    topic: "policies",
    status: "resolved",
    escalated: false,
    guest: "What are quiet hours?",
    assistant: QUIET,
    grounded: true,
  },
  {
    id: "linden-c-15",
    daysAgo: 9,
    hour: 16,
    guestLabel: "The Morales",
    room: "Porch Double",
    topic: "nearby",
    status: "resolved",
    escalated: false,
    guest: "Can we borrow the bikes?",
    assistant: BIKES,
    grounded: true,
  },
  {
    id: "linden-c-16",
    daysAgo: 9,
    hour: 18,
    guestLabel: "Imani Brooks",
    room: "Willow Room",
    topic: "departure",
    status: "resolved",
    escalated: true,
    guest: "Could we do a late checkout on Sunday, until noon?",
    assistant: `${LATE} I've sent this to the front desk.`,
    grounded: true,
    staff: "Sunday is free. Noon is fine, no fee.",
    ticket: {
      id: "linden-t-06",
      type: "late_checkout",
      summary: "Late checkout Sunday until noon.",
      status: "done",
    },
  },
  {
    id: "linden-c-17",
    daysAgo: 10,
    hour: 14,
    guestLabel: "Guest",
    room: "",
    topic: "policies",
    status: "resolved",
    escalated: false,
    guest: "What's your cancellation policy?",
    assistant: CANCEL,
    grounded: true,
  },
  {
    id: "linden-c-18",
    daysAgo: 11,
    hour: 23,
    guestLabel: "Leo Martin",
    room: "River Loft",
    topic: "other",
    status: "resolved",
    escalated: false,
    guest: "Where can I get ice?",
    assistant: ICE,
    grounded: true,
  },
  {
    id: "linden-c-19",
    daysAgo: 12,
    hour: 15,
    guestLabel: "The Bergs",
    room: "Maple Suite",
    topic: "nearby",
    status: "resolved",
    escalated: false,
    guest: "Is Olana worth the drive from the house?",
    assistant:
      "Olana State Historic Site is about a fifteen-minute drive. Worth it in clear weather. The Walkway Over the Hudson is about twenty-five minutes by car if you want a longer outing.",
    grounded: true,
  },
  {
    id: "linden-c-20",
    daysAgo: 13,
    hour: 19,
    guestLabel: "Claire Dunn",
    room: "Maple Suite",
    topic: "other",
    status: "resolved",
    escalated: false,
    guest: "How do we light the fireplace in the Maple Suite?",
    assistant: FIRE,
    grounded: true,
  },
]

export function buildLindenHouse(ownerId: string, now = new Date()): Graph {
  const createdAt = isoDaysAgo(40, 15)
  const property: Property = {
    id: PROPERTY_ID,
    ownerId,
    name: "The Linden House B&B",
    slug: "linden-house",
    location: "18 Willow Lane, Hudson, New York",
    tagline: "Seven rooms, a deep porch, and breakfast that is cooked.",
    description:
      "A clapboard house on a quiet block above the river. The dining room smells like toast in the morning. The desk is a person, usually at the table by the stairs.",
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
    phone: "(518) 555-0148",
    email: "stay@lindenhouse.example",
    setupComplete: true,
    createdAt,
    updatedAt: now.toISOString(),
    rooms: [
      {
        id: "maple",
        name: "Maple Suite",
        type: "king",
        sleeps: 2,
        description: "Gas fireplace, and windows over the garden. Our largest room.",
      },
      {
        id: "garden",
        name: "Garden Room",
        type: "queen",
        sleeps: 2,
        description: "Ground floor, opens toward the garden. Dog-friendly.",
      },
      {
        id: "river",
        name: "River Loft",
        type: "queen",
        sleeps: 2,
        description: "Third floor, with a skylight. Quiet, and warm in the afternoon.",
      },
      {
        id: "library",
        name: "Library Room",
        type: "queen",
        sleeps: 2,
        description: "Faces the street. The shelves are for reading, not for souvenirs.",
      },
      {
        id: "willow",
        name: "Willow Room",
        type: "queen",
        sleeps: 2,
        description: "Second floor, over the side yard. Dog-friendly.",
      },
      {
        id: "porch",
        name: "Porch Double",
        type: "full",
        sleeps: 2,
        description: "Next to the porch. Light in the morning, smaller than the queens.",
      },
      {
        id: "attic",
        name: "Attic Twins",
        type: "two twins",
        sleeps: 2,
        description: "Under the eaves. The stair is steep.",
      },
    ],
    amenities: [
      { id: "breakfast", name: "Cooked breakfast", detail: BREAKFAST },
      { id: "parking", name: "Parking", detail: PARKING },
      { id: "wifi", name: "Wi-Fi", detail: WIFI },
      { id: "fire", name: "Gas fireplace", detail: FIRE },
      { id: "bikes", name: "Cruiser bikes", detail: BIKES },
      { id: "ice", name: "Ice and glasses", detail: ICE },
    ],
    policies: [
      { id: "arrival", title: "Arrival and keys", body: ARRIVAL },
      { id: "late", title: "Late checkout", body: LATE },
      { id: "dogs", title: "Dogs", body: DOGS },
      { id: "towels", title: "Towels", body: TOWELS },
      { id: "heat", title: "Radiators", body: HEAT },
      { id: "quiet", title: "Quiet hours", body: QUIET },
      { id: "smoke", title: "Smoking", body: SMOKE },
      { id: "cancel", title: "Cancellation", body: CANCEL },
    ],
    recommendations: [
      {
        id: "perche",
        name: "Cafe Le Perche",
        category: "dining",
        distance: "a four-minute walk",
        detail: "Coffee and bread on Warren Street. Good before a train.",
      },
      {
        id: "swoon",
        name: "Swoon Kitchen Bar",
        category: "dining",
        distance: "about a six-minute walk",
        detail: "Dinner. We don't book the table for you.",
      },
      {
        id: "york",
        name: "Olde York",
        category: "dining",
        distance: "about eight minutes on foot",
        detail: "Dinner, a little quieter than Warren Street.",
      },
      {
        id: "olana",
        name: "Olana State Historic Site",
        category: "outing",
        distance: "about a fifteen-minute drive",
        detail: "The old Church house above the river. Worth it in clear weather.",
      },
      {
        id: "walkway",
        name: "Walkway Over the Hudson",
        category: "outing",
        distance: "about twenty-five minutes by car",
        detail: "A long bridge walk. Go while the light is still good.",
      },
      {
        id: "station",
        name: "Hudson station",
        category: "transit",
        distance: "about a ten-minute walk",
        detail: TRAIN,
      },
    ],
  }

  const updatedAt = now.toISOString()
  const profile = profileArticles(property, updatedAt)
  const custom: Article[] = [
    {
      id: "linden-note-boots",
      propertyId: property.id,
      title: "Muddy boots",
      category: "House",
      body: BOOTS,
      published: true,
      source: "custom",
      updatedAt,
    },
    {
      id: "linden-note-attic",
      propertyId: property.id,
      title: "Attic stair",
      category: "Rooms",
      body: ATTIC,
      published: true,
      source: "custom",
      updatedAt,
    },
    {
      id: "linden-note-christmas",
      propertyId: property.id,
      title: "Christmas week breakfast",
      category: "Breakfast",
      body: CHRISTMAS,
      published: true,
      source: "custom",
      updatedAt,
    },
  ]

  const conversations = []
  const messages: Message[] = []
  const tickets: Ticket[] = []

  for (const script of SCRIPTS) {
    const created = isoDaysAgo(script.daysAgo, script.hour, 8)
    const replied = isoDaysAgo(script.daysAgo, script.hour, 9)
    const staffAt = isoDaysAgo(script.daysAgo, script.hour, 24)
    const preview = script.staff ?? script.assistant
    conversations.push({
      id: script.id,
      propertyId: property.id,
      guestLabel: script.guestLabel,
      room: script.room,
      topic: script.topic,
      status: script.status,
      escalated: script.escalated,
      lastMessagePreview: preview.slice(0, 140),
      guestTokenHash: hashToken(`seed-${script.id}`),
      createdAt: created,
      updatedAt: script.staff ? staffAt : replied,
    })
    messages.push({
      id: `${script.id}-g`,
      conversationId: script.id,
      role: "guest",
      content: script.guest,
      grounded: false,
      sample: false,
      citations: [],
      createdAt: created,
    })
    messages.push({
      id: `${script.id}-a`,
      conversationId: script.id,
      role: "assistant",
      content: script.assistant,
      grounded: script.grounded,
      sample: false,
      citations: script.grounded ? ["live-profile"] : [],
      createdAt: replied,
    })
    if (script.staff) {
      messages.push({
        id: `${script.id}-s`,
        conversationId: script.id,
        role: "staff",
        content: script.staff,
        grounded: true,
        sample: false,
        citations: [],
        createdAt: staffAt,
      })
    }
    if (script.ticket) {
      tickets.push({
        id: script.ticket.id,
        propertyId: property.id,
        conversationId: script.id,
        type: script.ticket.type,
        room: script.room,
        guestLabel: script.guestLabel,
        summary: script.ticket.summary,
        status: script.ticket.status,
        createdAt: replied,
        updatedAt: script.ticket.status === "done" ? staffAt : replied,
      })
    }
  }

  return {
    property,
    articles: [...profile, ...custom],
    conversations,
    messages,
    tickets,
  }
}

export function cloneGraphForOwner(graph: Graph, ownerId: string, slug: string): Graph {
  const propertyId = crypto.randomUUID()
  const idMap = new Map<string, string>()
  const mapId = (id: string) => {
    const existing = idMap.get(id)
    if (existing) return existing
    const next = crypto.randomUUID()
    idMap.set(id, next)
    return next
  }

  const property = {
    ...graph.property,
    id: propertyId,
    ownerId,
    slug,
    rooms: graph.property.rooms.map((room) => ({ ...room })),
    amenities: graph.property.amenities.map((item) => ({ ...item })),
    policies: graph.property.policies.map((item) => ({ ...item })),
    recommendations: graph.property.recommendations.map((item) => ({ ...item })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return {
    property,
    articles: graph.articles.map((article) => ({
      ...article,
      id: mapId(article.id),
      propertyId,
    })),
    conversations: graph.conversations.map((conversation) => ({
      ...conversation,
      id: mapId(conversation.id),
      propertyId,
      guestTokenHash: hashToken(crypto.randomUUID()),
    })),
    messages: graph.messages.map((message) => ({
      ...message,
      id: crypto.randomUUID(),
      conversationId: mapId(message.conversationId),
    })),
    tickets: graph.tickets.map((ticket) => ({
      ...ticket,
      id: crypto.randomUUID(),
      propertyId,
      conversationId: ticket.conversationId ? mapId(ticket.conversationId) : null,
    })),
  }
}
