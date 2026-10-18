import type { Metadata } from "next"
import Link from "next/link"
import { EmptyHouse } from "@/components/app/empty-house"
import { InboxThread } from "@/components/app/inbox-thread"
import { PageHeader } from "@/components/app/page-header"
import { requireDesk } from "@/lib/actor"
import { formatWhen } from "@/lib/format"
import { TOPIC_LABELS, toPublicConversation } from "@/lib/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Inbox" }

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const desk = await requireDesk()
  if (!desk.property) return <EmptyHouse />
  const { c } = await searchParams
  const conversations = (await desk.store.listConversations(desk.property.id)).map(toPublicConversation)
  const selected = conversations.find((conversation) => conversation.id === c) ?? conversations[0] ?? null
  const messages = selected ? await desk.store.listMessages(selected.id) : []

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Conversations"
        description="Guests on the widget, and the replies you send back. A reply here is from you, not from the model."
      />
      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No one has written yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <ul className="max-h-[70vh] space-y-1 overflow-auto">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/app/inbox?c=${conversation.id}`}
                  className={`block rounded-xl px-3 py-2 ${selected?.id === conversation.id ? "bg-muted" : "hover:bg-muted/60"}`}
                  aria-current={selected?.id === conversation.id ? "page" : undefined}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {conversation.guestLabel}
                    <span className="text-xs font-normal text-muted-foreground">
                      {conversation.status === "resolved" ? "Resolved" : "Open"}
                    </span>
                  </span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{conversation.lastMessagePreview}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {TOPIC_LABELS[conversation.topic]} · {formatWhen(conversation.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {selected ? <InboxThread conversation={selected} messages={messages} /> : null}
        </div>
      )}
    </div>
  )
}
