"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { removeArticle, saveArticle } from "@/lib/actions"
import type { Article } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function KnowledgeEditor({ articles, selectedId }: { articles: Article[]; selectedId?: string }) {
  const router = useRouter()
  const selected = articles.find((article) => article.id === selectedId) ?? null
  const [creating, setCreating] = useState(false)
  const custom = articles.filter((article) => article.source === "custom")
  const profile = articles.filter((article) => article.source === "profile")

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium">Your notes</h2>
            <Button type="button" size="sm" variant="outline" onClick={() => { setCreating(true); router.replace("/app/knowledge") }}>
              New
            </Button>
          </div>
          <ul className="space-y-1">
            {custom.length === 0 ? <li className="text-sm text-muted-foreground">No extra notes yet.</li> : null}
            {custom.map((article) => (
              <li key={article.id}>
                <button
                  type="button"
                  onClick={() => { setCreating(false); router.replace(`/app/knowledge?a=${article.id}`) }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted ${selected?.id === article.id && !creating ? "bg-muted" : ""}`}
                >
                  {article.title}
                  {!article.published ? <span className="ml-2 text-xs text-muted-foreground">Hidden</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium">From the house profile</h2>
          <ul className="max-h-80 space-y-1 overflow-auto">
            {profile.map((article) => (
              <li key={article.id}>
                <button
                  type="button"
                  onClick={() => { setCreating(false); router.replace(`/app/knowledge?a=${article.id}`) }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted ${selected?.id === article.id ? "bg-muted" : ""}`}
                >
                  {article.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        {creating ? (
          <ArticleForm
            key="new"
            article={null}
            onDone={() => setCreating(false)}
          />
        ) : selected ? (
          selected.source === "profile" ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{selected.category} · from the house profile</p>
              <h2 className="mt-1 font-serif text-2xl">{selected.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selected.body}</p>
              <p className="mt-4 text-sm text-muted-foreground">Edit this under House. Saving the profile rewrites these notes.</p>
              <Button className="mt-4" variant="outline" href="/app/setup">Edit the house</Button>
            </div>
          ) : (
            <ArticleForm key={selected.id} article={selected} onDone={() => router.refresh()} />
          )
        ) : (
          <p className="text-sm text-muted-foreground">Choose a note, or write one the house book doesn&apos;t cover yet.</p>
        )}
      </div>
    </div>
  )
}

function ArticleForm({ article, onDone }: { article: Article | null; onDone: () => void }) {
  const router = useRouter()
  const [title, setTitle] = useState(article?.title ?? "")
  const [category, setCategory] = useState(article?.category ?? "House")
  const [body, setBody] = useState(article?.body ?? "")
  const [published, setPublished] = useState(article?.published ?? true)
  const [confirming, setConfirming] = useState(false)
  const [pending, start] = useTransition()

  function save() {
    start(async () => {
      const result = await saveArticle(article?.id ?? null, { title, category, body, published })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(article ? "Note saved." : "Note added.")
      onDone()
      router.refresh()
    })
  }

  function remove() {
    if (!article) return
    start(async () => {
      const result = await removeArticle(article.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Note removed.")
      router.replace("/app/knowledge")
      router.refresh()
    })
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
    >
      <div>
        <Label htmlFor="note-title">Title</Label>
        <Input id="note-title" className="mt-1" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </div>
      <div>
        <Label htmlFor="note-category">Category</Label>
        <Input id="note-category" className="mt-1" value={category} onChange={(event) => setCategory(event.target.value)} required />
      </div>
      <div>
        <Label htmlFor="note-body">What the desk can say</Label>
        <Textarea id="note-body" className="mt-1 min-h-40" value={body} onChange={(event) => setBody(event.target.value)} required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
        Published to the guest desk
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save note"}</Button>
        {article ? (
          confirming ? (
            <Button type="button" variant="outline" onClick={remove}>Confirm delete</Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirming(true)}>Delete</Button>
          )
        ) : null}
      </div>
    </form>
  )
}
