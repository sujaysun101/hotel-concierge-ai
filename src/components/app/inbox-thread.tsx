"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { replyToGuest, setConversationStatus } from "@/lib/actions"
import type { Message, PublicConversation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function InboxThread({
  conversation,
  messages,
}: {
  conversation: PublicConversation
  messages: Message[]
}) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [pending, start] = useTransition()

  function send() {
    start(async () => {
      const result = await replyToGuest({ conversationId: conversation.id, content })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setContent("")
      toast.success("Reply saved.")
      router.refresh()
    })
  }

  function setStatus(status: "open" | "resolved") {
    start(async () => {
      const result = await setConversationStatus({ conversationId: conversation.id, status })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(status === "resolved" ? "Marked resolved." : "Reopened.")
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-[480px] flex-col rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-serif text-2xl">{conversation.guestLabel}</h2>
          <p className="text-xs text-muted-foreground">{conversation.room || "No room given"}</p>
        </div>
        <div className="flex gap-2">
          {conversation.status === "resolved" ? (
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setStatus("open")}>Reopen</Button>
          ) : (
            <Button type="button" size="sm" disabled={pending} onClick={() => setStatus("resolved")}>Mark resolved</Button>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-3 px-4 py-4">
        {messages.map((message) => (
          <article key={message.id} className={message.role === "guest" ? "ml-auto max-w-[80%]" : "max-w-[80%]"}>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {message.role === "guest" ? "Guest" : message.role === "staff" ? "You" : "Desk"}
              {message.sample ? " · sample" : ""}
              {message.role === "assistant" && message.grounded ? " · from the book" : ""}
              {message.role === "assistant" && !message.grounded ? " · not in the book" : ""}
            </p>
            <p className={`mt-1 rounded-2xl px-3 py-2 text-sm ${message.role === "guest" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {message.content}
            </p>
          </article>
        ))}
      </div>
      <form
        className="border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <label htmlFor="staff-reply" className="text-xs text-muted-foreground">Reply as the desk. This is stored. It is not sent to an AI.</label>
        <Textarea id="staff-reply" className="mt-1" value={content} onChange={(event) => setContent(event.target.value)} />
        <Button className="mt-2" type="submit" disabled={pending || content.trim().length === 0}>Send reply</Button>
      </form>
    </div>
  )
}
