"use client"

import { Button } from "@/components/ui/button"

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <h1 className="font-serif text-3xl">The desk hit a snag.</h1>
      <p className="mt-2 text-sm text-muted-foreground">Try that again. If it keeps happening, the house data may need a fresh load.</p>
      <Button className="mt-5" type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
