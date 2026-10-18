import type { Metadata } from "next"
import { PageHeader } from "@/components/app/page-header"
import { SetupWizard } from "@/components/app/setup-wizard"
import { requireDesk } from "@/lib/actor"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "House" }

export default async function SetupPage() {
  const desk = await requireDesk()
  return (
    <div>
      <PageHeader
        eyebrow="House"
        title={desk.property ? desk.property.name : "Set up the house"}
        description="Name, rooms, amenities, hours, policies, and the places you actually recommend. The guest desk reads this."
      />
      <SetupWizard property={desk.property} />
    </div>
  )
}
