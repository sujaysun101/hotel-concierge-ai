import { Shell } from "@/components/app/shell"
import { requireDesk } from "@/lib/actor"
import { clerkConfigured } from "@/lib/runtime"

export const dynamic = "force-dynamic"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const desk = await requireDesk()
  return (
    <Shell
      demo={desk.demo}
      clerk={clerkConfigured() && !desk.actor.demoBypass}
      propertyName={desk.property?.name ?? "Your house"}
    >
      {children}
    </Shell>
  )
}
