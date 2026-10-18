"use client"

import { useEffect, useRef, useState } from "react"
import { LogoMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TICKET_LABELS, type TicketType } from "@/lib/types"

type Bubble = {
  role: "guest" | "assistant"
  content: string
  sample?: boolean
  escalate?: boolean
}

type TicketCard = {
  id: string
  type: TicketType
  status: string
  summary: string
}

const REQUESTS: { type: TicketType; label: string }[] = [
  { type: "late_checkout", label: "Late checkout" },
  { type: "towels", label: "Towels" },
  { type: "maintenance", label: "Maintenance" },
  { type: "other", label: "Something else" },
]

export function GuestDesk({
  slug,
  propertyName,
  location,
  suggestions,
}: {
  slug: string
  propertyName: string
  location: string
  suggestions: string[]
}) {
  const [messages, setMessages] = useState<Bubble[]>([])
  const [input, setInput] = useState("")
  const [room, setRoom] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sample, setSample] = useState(false)
  const [ticket, setTicket] = useState<TicketCard | null>(null)
  const [askOpen, setAskOpen] = useState(false)
  const [askType, setAskType] = useState<TicketType>("late_checkout")
  const [askNote, setAskNote] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [guestToken, setGuestToken] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = sessionStorage.getItem(`turndown:${slug}`)
      if (!saved) return
      try {
        const parsed = JSON.parse(saved) as { conversationId?: string; guestToken?: string; room?: string }
        if (parsed.conversationId && parsed.guestToken) {
          setConversationId(parsed.conversationId)
          setGuestToken(parsed.guestToken)
        }
        if (parsed.room) setRoom(parsed.room)
      } catch {
        sessionStorage.removeItem(`turndown:${slug}`)
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [slug])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loading, ticket])

  function remember(nextId: string, nextToken: string) {
    setConversationId(nextId)
    setGuestToken(nextToken)
    sessionStorage.setItem(`turndown:${slug}`, JSON.stringify({ conversationId: nextId, guestToken: nextToken, room }))
  }

  async function send(text: string) {
    const message = text.trim()
    if (!message || loading) return
    setError("")
    setInput("")
    setMessages((current) => [...current, { role: "guest", content: message }])
    setLoading(true)
    try {
      const response = await fetch(`/api/widget/${slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          room: room || undefined,
          conversationId: conversationId ?? undefined,
          guestToken: guestToken ?? undefined,
        }),
      })
      const data = (await response.json()) as {
        error?: string
        conversationId?: string
        guestToken?: string
        reply?: string
        sample?: boolean
        escalate?: boolean
        ticket?: TicketCard | null
      }
      if (!response.ok || !data.reply || !data.conversationId) {
        setError(data.error || "The desk couldn't take that message.")
        return
      }
      if (data.guestToken) remember(data.conversationId, data.guestToken)
      else setConversationId(data.conversationId)
      setSample(Boolean(data.sample))
      if (data.ticket) setTicket(data.ticket)
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply!, sample: data.sample, escalate: data.escalate },
      ])
    } catch {
      setError("The desk couldn't take that message.")
    } finally {
      setLoading(false)
    }
  }

  async function askPerson() {
    if (askNote.trim().length < 2 || loading) return
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/widget/${slug}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: askType,
          summary: askNote.trim(),
          room: room || undefined,
          conversationId: conversationId ?? undefined,
          guestToken: guestToken ?? undefined,
        }),
      })
      const data = (await response.json()) as {
        error?: string
        conversationId?: string
        guestToken?: string
        reply?: string
        ticket?: TicketCard | null
      }
      if (!response.ok || !data.reply || !data.conversationId) {
        setError(data.error || "The desk couldn't take that request.")
        return
      }
      if (data.guestToken) remember(data.conversationId, data.guestToken)
      if (data.ticket) setTicket(data.ticket)
      setMessages((current) => [
        ...current,
        { role: "guest", content: askNote.trim() },
        { role: "assistant", content: data.reply!, escalate: true },
      ])
      setAskNote("")
      setAskOpen(false)
    } catch {
      setError("The desk couldn't take that request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex h-full min-h-[560px] flex-col bg-[#f7f3ea] text-[#1c2a22]">
      <header className="flex items-center gap-3 border-b border-[#e4dccb] px-4 py-3">
        <LogoMark className="size-9 text-[#1F4D3A]" />
        <div className="min-w-0">
          <p className="truncate font-serif text-lg leading-tight">{propertyName}</p>
          <p className="truncate text-xs text-[#5d6b60]">{location}</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="pt-6 text-center">
            <p className="font-serif text-2xl">How can the desk help?</p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[#5d6b60]">
              Answers come from this house&apos;s book. If it isn&apos;t written down, we&apos;ll ask a person.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-[#d9d0bf] bg-white px-3 py-1.5 text-left text-xs hover:border-[#1F4D3A]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "guest" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                message.role === "guest"
                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-[#1F4D3A] px-3 py-2 text-sm text-[#f7f3ea]"
                  : "max-w-[85%] rounded-2xl rounded-bl-md border border-[#e4dccb] bg-white px-3 py-2 text-sm"
              }
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.sample ? (
                <p className="mt-2 text-[11px] uppercase tracking-wide text-[#8a6a32]">Sample reply · no AI key</p>
              ) : null}
            </div>
          </div>
        ))}

        {ticket ? (
          <div className="rounded-xl border border-[#e4dccb] bg-[#fffaf2] px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-[#8a6a32]">Passed to the desk</p>
            <p className="mt-1 font-medium">{TICKET_LABELS[ticket.type]}</p>
            <p className="text-[#5d6b60]">{ticket.summary}</p>
            <p className="mt-1 text-xs">Status: {ticket.status.replace("_", " ")}</p>
          </div>
        ) : null}

        {loading ? <p className="text-sm text-[#5d6b60]">One moment…</p> : null}
        {error ? (
          <p className="text-sm text-[#8a3b32]" role="alert">
            {error}
          </p>
        ) : null}
        {sample && messages.length > 0 ? (
          <p className="text-xs text-[#5d6b60]">Sample answers are matched from the house book until an AI key is set.</p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-2 border-t border-[#e4dccb] bg-[#fffaf2] p-3">
        <label className="block text-xs text-[#5d6b60]">
          Room, if you have one
          <input
            value={room}
            onChange={(event) => setRoom(event.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-[#e4dccb] bg-white px-2 text-sm"
            maxLength={80}
          />
        </label>
        {askOpen ? (
          <div className="space-y-2 rounded-lg border border-[#e4dccb] bg-white p-2">
            <label className="block text-xs">
              What do you need?
              <select
                value={askType}
                onChange={(event) => setAskType(event.target.value as TicketType)}
                className="mt-1 h-9 w-full rounded-md border border-[#e4dccb] bg-white px-2 text-sm"
              >
                {REQUESTS.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              Note for the desk
              <textarea
                value={askNote}
                onChange={(event) => setAskNote(event.target.value)}
                className="mt-1 min-h-16 w-full rounded-md border border-[#e4dccb] px-2 py-1 text-sm"
                maxLength={400}
              />
            </label>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={askPerson} disabled={loading || askNote.trim().length < 2}>
                Send to the desk
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAskOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" className="text-xs text-[#1F4D3A] underline-offset-2 hover:underline" onClick={() => setAskOpen(true)}>
            Ask a person instead
          </button>
        )}
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void send(input)
          }}
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about the house"
            aria-label="Message the front desk"
            disabled={loading}
            maxLength={1000}
            className="border-[#e4dccb] bg-white"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </section>
  )
}
