import { Logo } from "@/components/brand/logo"

export function AuthFrame({
  title,
  lede,
  children,
}: {
  title: string
  lede: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-[#1F4D3A] p-10 text-[#F7F3EA] lg:flex">
        <Logo tone="inverse" />
        <div>
          <p className="max-w-md font-serif text-4xl leading-tight">The house book, at the front desk.</p>
          <div className="mt-8 max-w-sm space-y-3 rounded-2xl bg-[#173C2D] p-4 text-sm">
            <p className="text-[#E2C08D]">Guest · Maple Suite</p>
            <p>Could we stay until 12:30?</p>
            <p className="text-[#d5e4db]">We can often extend to 12:30 when the room is free. I&apos;ve sent this to the front desk.</p>
          </div>
        </div>
        <p className="text-sm text-[#d5e4db]">Turndown for independent inns.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-serif text-4xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{lede}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  )
}
