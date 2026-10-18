import { NextResponse } from "next/server"
import { demoEntryAllowed } from "@/lib/runtime"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!demoEntryAllowed()) {
    return NextResponse.json({ error: "Demo entry is closed." }, { status: 403 })
  }
  const response = NextResponse.redirect(new URL("/app", request.url), 303)
  response.cookies.set("turndown_demo", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  })
  return response
}
