import { Button } from "@/components/ui/button"

export function DemoEntry() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm leading-6">
        This preview has no Clerk keys, so sign-in is open on purpose. The desk loads The Linden House and labels it as demo data.
      </p>
      <form action="/api/demo-entry" method="post">
        <Button type="submit">Open the demo desk</Button>
      </form>
      <p className="text-xs leading-5 text-muted-foreground">
        For a real sign-in, set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY. In development you can also run npx clerk@latest init, which writes temporary keys without an account.
      </p>
    </div>
  )
}
