import { NextResponse } from "next/server"
import { turnRequest } from "@/lib/guest-turn"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { issueMessage, widgetRequestSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const limit = await rateLimit(`widget-request:${slug}:${clientIp(request)}`, 20, 10 * 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Send a JSON request." }, { status: 400 })
  }

  const parsed = widgetRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: issueMessage(parsed.error) }, { status: 400 })

  const result = await turnRequest(slug, parsed.data)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.body)
}
