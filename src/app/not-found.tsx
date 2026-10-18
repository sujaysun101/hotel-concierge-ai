import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 font-serif text-4xl">That page isn&apos;t at this house.</h1>
        <p className="mt-2 text-sm text-muted-foreground">The desk, the book, and the widget are still where you left them.</p>
        <Button className="mt-6" href="/">Back to Turndown</Button>
      </div>
    </div>
  )
}
