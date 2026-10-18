"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { loadSampleHouse } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function EmptyHouse() {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8">
      <h2 className="font-serif text-3xl">Set up the house before the desk can answer.</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Start with your own rooms and policies, or load The Linden House — a seven-room inn in Hudson — so the book, inbox, and requests are already full.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/app/setup">Set up your house</Button>
        <Button
          variant="outline"
          type="button"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const result = await loadSampleHouse()
              if (!result.ok) {
                toast.error("The sample house didn't load.")
                return
              }
              toast.success("The Linden House is on the desk.")
              router.push("/app")
              router.refresh()
            })
          }}
        >
          {pending ? "Loading…" : "Load The Linden House"}
        </Button>
      </div>
    </div>
  )
}
