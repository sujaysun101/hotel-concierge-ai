import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { GuestDesk } from "@/components/widget/guest-desk"
import { widgetSuggestions } from "@/lib/format"
import { getStore } from "@/lib/store"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const property = await getStore().getPropertyBySlug(slug)
  if (!property) return { title: "Desk" }
  return {
    title: property.name,
    description: `Ask the front desk at ${property.name}.`,
    robots: { index: false, follow: false },
  }
}

export default async function WidgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const property = await getStore().getPropertyBySlug(slug)
  if (!property) notFound()
  const names = [...property.amenities.map((item) => item.name), ...property.policies.map((item) => item.title)]
  return (
    <main className="h-dvh">
      <GuestDesk slug={property.slug} propertyName={property.name} location={property.location} suggestions={widgetSuggestions(names)} />
    </main>
  )
}
