import type { Article, HouseEntry, Property, Topic } from "@/lib/types"

export function houseBook(property: Property, articles: Article[]): HouseEntry[] {
  const entries: HouseEntry[] = [
    {
      id: "live-house",
      title: property.name,
      category: "House",
      body: [
        `${property.name} is at ${property.location}.`,
        property.tagline,
        property.description,
        property.phone ? `Phone: ${property.phone}.` : "",
        property.email ? `Email: ${property.email}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    },
    {
      id: "live-hours",
      title: "Check-in and check-out",
      category: "Arrival",
      body: `Check-in is ${property.checkIn}. Check-out is ${property.checkOut}.`,
    },
  ]

  for (const room of property.rooms) {
    entries.push({
      id: `live-room-${room.id}`,
      title: room.name,
      category: "Rooms",
      body: `${room.name} is a ${room.type} that sleeps ${room.sleeps}. ${room.description}`,
    })
  }

  for (const amenity of property.amenities) {
    entries.push({
      id: `live-amenity-${amenity.id}`,
      title: amenity.name,
      category: amenityCategory(amenity.name),
      body: `${amenity.name}. ${amenity.detail}`,
    })
  }

  for (const policy of property.policies) {
    entries.push({
      id: `live-policy-${policy.id}`,
      title: policy.title,
      category: policyCategory(policy.title),
      body: `${policy.title}. ${policy.body}`,
    })
  }

  for (const rec of property.recommendations) {
    entries.push({
      id: `live-rec-${rec.id}`,
      title: rec.name,
      category: rec.category === "dining" ? "Dining" : "Nearby",
      body: `${rec.name}, ${rec.distance}. ${rec.detail}`,
    })
  }

  for (const article of articles) {
    if (!article.published || article.source !== "custom") continue
    entries.push({
      id: article.id,
      title: article.title,
      category: article.category,
      body: article.body,
    })
  }

  return entries
}

export function formatHouseBook(entries: HouseEntry[]): string {
  return entries
    .map((entry) => `[${entry.id}] ${entry.title} (${entry.category})\n${entry.body}`)
    .join("\n\n")
}

export function topicFromCategory(category: string): Topic {
  const c = category.toLowerCase()
  if (c.includes("breakfast")) return "breakfast"
  if (c.includes("wi-fi") || c.includes("wifi")) return "wifi"
  if (c.includes("pet") || c.includes("dog")) return "pets"
  if (c.includes("depart") || c.includes("check-out") || c.includes("checkout")) return "departure"
  if (c.includes("arriv") || c.includes("room") || c.includes("parking")) return "arrival"
  if (c.includes("din")) return "dining"
  if (c.includes("near") || c.includes("outing") || c.includes("transit")) return "nearby"
  if (c.includes("towel") || c.includes("linen") || c.includes("housekeep")) return "housekeeping"
  if (c.includes("heat") || c.includes("repair") || c.includes("maint")) return "maintenance"
  if (c.includes("polic") || c.includes("quiet") || c.includes("cancel")) return "policies"
  return "other"
}

function amenityCategory(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("breakfast") || n.includes("coffee")) return "Breakfast"
  if (n.includes("wi-fi") || n.includes("wifi")) return "Wi-Fi"
  if (n.includes("parking")) return "Arrival"
  if (n.includes("bike")) return "Nearby"
  if (n.includes("fire")) return "House"
  return "House"
}

function policyCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes("dog") || t.includes("pet")) return "Pets"
  if (t.includes("check-out") || t.includes("checkout") || t.includes("late")) return "Departure"
  if (t.includes("check-in") || t.includes("arrival") || t.includes("key")) return "Arrival"
  if (t.includes("heat") || t.includes("radiator")) return "Maintenance"
  if (t.includes("towel")) return "Housekeeping"
  return "Policies"
}

export function profileArticles(property: Property, updatedAt: string): Article[] {
  const entries = houseBook(property, []).filter((entry) => entry.id !== "live-house")
  return entries.map((entry) => ({
    id: `${property.id}-${entry.id}`,
    propertyId: property.id,
    title: entry.title,
    category: entry.category,
    body: entry.body,
    published: true,
    source: "profile" as const,
    updatedAt,
  }))
}
