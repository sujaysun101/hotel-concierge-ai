import Link from "next/link"
import { ConversationChart } from "@/components/app/charts"
import { EmptyHouse } from "@/components/app/empty-house"
import { PageHeader } from "@/components/app/page-header"
import { Badge } from "@/components/ui/badge"
import { requireDesk } from "@/lib/actor"
import { formatPercent, formatWhen } from "@/lib/format"
import { STATUS_LABELS, TOPIC_LABELS, TICKET_LABELS } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function DeskPage() {
  const desk = await requireDesk()
  if (!desk.property) return <EmptyHouse />

  const [analytics, conversations, tickets] = await Promise.all([
    desk.store.analytics(desk.property.id),
    desk.store.listConversations(desk.property.id),
    desk.store.listTickets(desk.property.id),
  ])
  const openTickets = tickets.filter((ticket) => ticket.status !== "done").slice(0, 4)
  const recent = conversations.slice(0, 5)

  return (
    <div data-screen="desk">
      <PageHeader
        eyebrow={desk.property.location}
        title="Today at the desk"
        description="Questions the house book could answer, and the requests still waiting on a person."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open conversations" value={String(analytics.open)} />
        <Stat label="Resolution rate" value={formatPercent(analytics.resolutionRate)} hint="Resolved conversations ÷ all conversations" />
        <Stat label="Open requests" value={String(analytics.openRequests)} />
        <Stat label="Escalated" value={String(analytics.escalated)} hint="Passed to a person at least once" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-xl">Last 14 days</h2>
          <p className="text-sm text-muted-foreground">{analytics.totalConversations} conversations stored for this house.</p>
          <div className="mt-3">
            <ConversationChart data={analytics.daily} />
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-xl">What they ask</h2>
          <ul className="mt-3 space-y-2">
            {analytics.topQuestions.slice(0, 5).map((item) => (
              <li key={item.topic} className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </li>
            ))}
          </ul>
          <Link href="/app/analytics" className="mt-4 inline-block text-sm text-primary underline-offset-2 hover:underline">
            See the questions
          </Link>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-xl">Recent conversations</h2>
          <ul className="mt-3 divide-y divide-border">
            {recent.map((conversation) => (
              <li key={conversation.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <Link href={`/app/inbox?c=${conversation.id}`} className="font-medium hover:underline">
                    {conversation.guestLabel}
                    {conversation.room ? ` · ${conversation.room}` : ""}
                  </Link>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{conversation.lastMessagePreview}</p>
                </div>
                <div className="text-right">
                  <Badge variant={conversation.status === "resolved" ? "secondary" : "outline"}>
                    {conversation.status === "resolved" ? "Resolved" : "Open"}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{TOPIC_LABELS[conversation.topic]}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-xl">Waiting on the house</h2>
          {openTickets.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No open requests.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {openTickets.map((ticket) => (
                <li key={ticket.id} className="rounded-xl bg-muted/60 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{TICKET_LABELS[ticket.type]}</p>
                    <span className="text-xs text-muted-foreground">{STATUS_LABELS[ticket.status]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{ticket.summary}</p>
                  <p className="text-xs text-muted-foreground">{ticket.room || "No room"} · {formatWhen(ticket.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/app/requests" className="mt-4 inline-block text-sm text-primary underline-offset-2 hover:underline">
            All requests
          </Link>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
