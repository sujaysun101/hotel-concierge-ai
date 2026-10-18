"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { setTicketStatus } from "@/lib/actions"
import { TICKET_STATUSES, type TicketStatus } from "@/lib/types"

export function RequestStatus({ id, status }: { id: string; status: TicketStatus }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <label className="text-xs text-muted-foreground">
      Status
      <select
        className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
        value={status}
        disabled={pending}
        aria-label="Request status"
        onChange={(event) => {
          const next = event.target.value as TicketStatus
          start(async () => {
            const result = await setTicketStatus({ id, status: next })
            if (!result.ok) {
              toast.error(result.error)
              return
            }
            toast.success("Request updated.")
            router.refresh()
          })
        }}
      >
        {TICKET_STATUSES.map((item) => (
          <option key={item} value={item}>
            {item === "in_progress" ? "In progress" : item[0].toUpperCase() + item.slice(1)}
          </option>
        ))}
      </select>
    </label>
  )
}
