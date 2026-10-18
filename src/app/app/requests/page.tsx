import type { Metadata } from "next"
import Link from "next/link"
import { EmptyHouse } from "@/components/app/empty-house"
import { PageHeader } from "@/components/app/page-header"
import { RequestStatus } from "@/components/app/request-status"
import { requireDesk } from "@/lib/actor"
import { formatWhen } from "@/lib/format"
import { TICKET_LABELS } from "@/lib/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Requests" }

export default async function RequestsPage() {
  const desk = await requireDesk()
  if (!desk.property) return <EmptyHouse />
  const tickets = await desk.store.listTickets(desk.property.id)

  return (
    <div>
      <PageHeader
        eyebrow="Requests"
        title="Handed to the house"
        description="Late checkout, towels, maintenance, and anything the book couldn't answer. Status is yours to move."
      />
      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <ul className="grid gap-3">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[160px_1fr_160px] md:items-center">
              <div>
                <p className="text-sm font-medium">{TICKET_LABELS[ticket.type]}</p>
                <p className="text-xs text-muted-foreground">{ticket.room || "No room"}</p>
              </div>
              <div>
                <p className="text-sm">{ticket.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ticket.guestLabel} · {formatWhen(ticket.createdAt)}
                  {ticket.conversationId ? (
                    <>
                      {" · "}
                      <Link className="underline-offset-2 hover:underline" href={`/app/inbox?c=${ticket.conversationId}`}>
                        Conversation
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
              <RequestStatus id={ticket.id} status={ticket.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
