"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { BookOpen, Inbox, Ticket } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: BookOpen,
    title: "Answers from the house book",
    body: "Breakfast, the radiator, the password on the card. The desk uses only what you wrote down.",
  },
  {
    icon: Ticket,
    title: "The rest becomes a request",
    body: "Late checkout, towels, a dripping tap. Each one lands with a room, a note, and a status.",
  },
  {
    icon: Inbox,
    title: "You can see what guests ask",
    body: "The questions that repeat, and which ones still needed a person.",
  },
]

export default function HomePage() {
  const reduce = useReducedMotion()
  const rise = reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } }

  return (
    <div className="min-h-screen bg-background text-foreground" data-screen="landing">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/w/linden-house" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
            Linden House desk
          </Link>
          <Button href="/sign-in">Open the desk</Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <motion.div {...rise}>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">For independent hotels and B&Bs</p>
            <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
              The front desk that has read the house book.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              Turndown answers guest questions from the notes you already keep, and passes the rest to you as a request.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" href="/sign-in">Open the desk</Button>
              <Button size="lg" variant="outline" href="/w/linden-house">
                Ask the Linden House
              </Button>
            </div>
          </motion.div>

          <motion.div
            {...(reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.08 } })}
            className="rounded-3xl border border-border bg-card p-4 shadow-sm"
            aria-hidden
          >
            <div className="rounded-2xl bg-[#1F4D3A] px-4 py-3 text-[#F7F3EA]">
              <p className="font-serif text-lg">The Linden House</p>
              <p className="text-xs text-[#E2C08D]">Front desk</p>
            </div>
            <div className="space-y-3 px-2 py-4 text-sm">
              <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-primary-foreground">
                Is breakfast included, and can you do gluten-free?
              </p>
              <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-background px-3 py-2">
                Breakfast is cooked to order from 8:00 to 9:30. Tell us the night before if you need gluten-free.
              </p>
              <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-primary-foreground">
                Could we stay until 12:30 tomorrow?
              </p>
              <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-background px-3 py-2">
                We can often extend to 12:30 when the room is free. I&apos;ve sent this to the front desk.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="size-5 text-primary" aria-hidden />
                <h2 className="mt-4 font-serif text-2xl">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </article>
            )
          })}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground">
          <p>Turndown · Front desk software for independent inns.</p>
          <Link href="/sign-in" className="hover:text-foreground">Sign in</Link>
        </div>
      </footer>
    </div>
  )
}