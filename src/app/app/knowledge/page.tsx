import type { Metadata } from "next"
import { EmptyHouse } from "@/components/app/empty-house"
import { KnowledgeEditor } from "@/components/app/knowledge-editor"
import { PageHeader } from "@/components/app/page-header"
import { requireDesk } from "@/lib/actor"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "House book" }

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const desk = await requireDesk()
  if (!desk.property) return <EmptyHouse />
  const { a } = await searchParams
  const articles = await desk.store.listArticles(desk.property.id)
  return (
    <div>
      <PageHeader
        eyebrow="House book"
        title="What the desk is allowed to say"
        description="Profile notes come from the house setup. Your own notes are the exceptions: the attic stair, Christmas week, muddy boots."
      />
      <KnowledgeEditor articles={articles} selectedId={a} />
    </div>
  )
}
