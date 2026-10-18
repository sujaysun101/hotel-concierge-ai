import { cn } from "@/lib/utils"

export function LogoMark({ className, tone = "brand" }: { className?: string; tone?: "brand" | "inverse" }) {
  const field = tone === "inverse" ? "#F6F1E7" : "currentColor"
  const fold = "#C4A36A"
  const sheet = tone === "inverse" ? "#1F4D3A" : "#F7F3EA"
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" fill={field} />
      <path d="M8 22V12.2h9.4L23.2 18v4" fill="none" stroke={sheet} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M17.4 12.2 23.2 18h-5.8V12.2Z" fill={fold} />
    </svg>
  )
}

export function Logo({
  className,
  tone = "brand",
  word = true,
}: {
  className?: string
  tone?: "brand" | "inverse"
  word?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", tone === "brand" && "text-primary", className)}>
      <LogoMark tone={tone} />
      {word ? <span className="font-serif text-xl tracking-tight">Turndown</span> : null}
    </span>
  )
}
