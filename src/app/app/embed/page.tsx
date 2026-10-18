import type { Metadata } from "next"
import { headers } from "next/headers"
import { EmptyHouse } from "@/components/app/empty-house"
import { PageHeader } from "@/components/app/page-header"
import { GuestDesk } from "@/components/widget/guest-desk"
import { requireDesk } from "@/lib/actor"
import { widgetSuggestions } from "@/lib/format"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Widget" }

export default async function EmbedPage() {
  const desk = await requireDesk()
  if (!desk.property) return <EmptyHouse />
  const headerList = await headers()
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000"
  const proto = headerList.get("x-forwarded-proto") ?? "http"
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`
  const src = `${origin}/w/${desk.property.slug}`
  const snippet = `<iframe src="${src}" title="Ask ${desk.property.name}" style="width:380px;height:640px;border:0;border-radius:16px"></iframe>`
  const names = [
    ...desk.property.amenities.map((item) => item.name),
    ...desk.property.policies.map((item) => item.title),
  ]
  return (
    <div>
      <PageHeader
        eyebrow="Widget"
        title="Put the desk on your site"
        description="The frame is public, limited to this house, and rate limited. It cannot see another property's book."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-medium">Embed</p>
          <pre className="mt-2 overflow-auto rounded-2xl border border-border bg-muted p-4 text-xs leading-5">{snippet}</pre>
          <p className="mt-4 text-sm">
            Direct link: <a className="underline-offset-2 hover:underline" href={src}>{src}</a>
          </p>
        </div>
        <div className="h-[640px] overflow-hidden rounded-2xl border border-border">
          <GuestDesk
            slug={desk.property.slug}
            propertyName={desk.property.name}
            location={desk.property.location}
            suggestions={widgetSuggestions(names)}
          />
        </div>
      </div>
    </div>
  )
}
