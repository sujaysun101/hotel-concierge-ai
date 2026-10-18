import type { Metadata } from "next"
import { ConversationChart, QuestionsChart, RequestsChart } from "@/components/app/charts"
import { EmptyHouse } from "@/components/app/empty-house"
import { PageHeader } from "@/components/app/page-header"
import { requireDesk } from "@/lib/actor"
import { formatPercent } from "@/lib/format"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Questions" }

export default async function AnalyticsPage() {
  const desk = await requireDesk()
  if (!desk.property) return <EmptyHouse />
  const analytics = await desk.store.analytics(desk.property.id)

  return (
    <div>
      <PageHeader
        eyebrow="Questions"
        title="What guests actually ask"
        description="Counted from stored conversations and requests. Resolution rate is resolved conversations divided by every conversation on the desk."
      />
      {analytics.totalConversations === 0 ? (
        <p className="text-sm text-muted-foreground">No conversations yet, so there is nothing to chart.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
            <h2 className="font-serif text-xl">Top questions</h2>
            <QuestionsChart data={analytics.topQuestions} />
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-serif text-xl">Conversations</h2>
            <p className="text-sm text-muted-foreground">
              {formatPercent(analytics.resolutionRate)} resolved · {analytics.escalated} escalated
            </p>
            <ConversationChart data={analytics.daily} />
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-serif text-xl">Requests by type</h2>
            <p className="text-sm text-muted-foreground">{analytics.openRequests} still open</p>
            <RequestsChart data={analytics.requestsByType} />
          </section>
        </div>
      )}
    </div>
  )
}
