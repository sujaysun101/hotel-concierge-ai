"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  BarChart3,
  BookOpen,
  Code2,
  House,
  Inbox,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Sun,
  Ticket,
  X,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

const UserMenu = dynamic(() => import("@/components/app/user-menu").then((mod) => mod.UserMenu), { ssr: false })

const NAV = [
  { href: "/app", label: "Desk", icon: LayoutDashboard },
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/requests", label: "Requests", icon: Ticket },
  { href: "/app/knowledge", label: "House book", icon: BookOpen },
  { href: "/app/analytics", label: "Questions", icon: BarChart3 },
  { href: "/app/embed", label: "Widget", icon: Code2 },
  { href: "/app/setup", label: "House", icon: House },
]

export function Shell({
  children,
  demo,
  clerk,
  propertyName,
}: {
  children: React.ReactNode
  demo: boolean
  clerk: boolean
  propertyName: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [palette, setPalette] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setPalette(true)
      }
      if (event.key === "Escape") setPalette(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="hidden min-h-screen flex-col bg-sidebar text-sidebar-foreground lg:flex">
            <Sidebar pathname={pathname} onNavigate={() => setOpen(false)} />
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
            <button
              type="button"
              className="rounded-md p-2 hover:bg-muted lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg leading-none">{propertyName}</p>
              <p className="text-xs text-muted-foreground">Front desk</p>
            </div>
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted sm:inline-flex"
            >
              <Search className="size-3.5" />
              Jump
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-sans">⌘K</kbd>
            </button>
            <ThemeToggle />
            {clerk ? <UserMenu /> : <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground" title="Demo desk">LH</span>}
          </header>
          {demo ? (
            <p className="border-b border-border bg-accent/60 px-4 py-2 text-sm text-accent-foreground">
              Demo data. The Linden House lives in memory on this server until a database is connected.
            </p>
          ) : null}
          <main id="main" className="px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground">
            <button type="button" className="absolute right-3 top-3 rounded-md p-2" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </button>
            <Sidebar pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      {palette ? <CommandPalette onClose={() => setPalette(false)} /> : null}
    </div>
  )
}

function Sidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col px-3 py-5">
      <Link href="/app" className="mb-8 px-2 text-sidebar-foreground">
        <Logo tone="inverse" />
      </Link>
      <nav aria-label="Desk" className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/70",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function ThemeToggle() {
  const { setTheme } = useTheme()
  return (
    <button
      type="button"
      className="rounded-md p-2 hover:bg-muted"
      aria-label="Toggle color theme"
      onClick={() => {
        const dark = document.documentElement.classList.contains("dark")
        setTheme(dark ? "light" : "dark")
      }}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  )
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const items = NAV.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/40 px-4 pt-[15vh]" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Jump to"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-3 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Jump to…"
          aria-label="Jump to a page"
          className="h-10 w-full bg-transparent px-2 text-sm outline-none"
        />
        <ul className="mt-1">
          {items.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                className="flex w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  router.push(item.href)
                  onClose()
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
          {items.length === 0 ? <li className="px-2 py-3 text-sm text-muted-foreground">Nothing matches.</li> : null}
        </ul>
      </div>
    </div>
  )
}
