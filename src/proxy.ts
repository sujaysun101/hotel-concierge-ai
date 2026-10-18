import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"
import { demoEntryAllowed, resolveClerkKeys } from "@/lib/runtime"

const PUBLIC_PREFIXES = ["/sign-in", "/sign-up", "/w", "/api/widget", "/api/demo-entry"]

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isAppPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/")
}

function withDemoHeader(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-turndown-demo", "1")
  return NextResponse.next({ request: { headers: requestHeaders } })
}

function demoRewrite(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  if (pathname !== "/demo" && !pathname.startsWith("/demo/")) return null
  if (process.env.DEMO_SCREENSHOT !== "1") {
    return new NextResponse("Not found", { status: 404 })
  }
  const url = request.nextUrl.clone()
  const rest = pathname.replace(/^\/demo/, "") || "/"
  url.pathname = rest === "/" ? "/app" : `/app${rest}`
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-turndown-demo", "1")
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const rewritten = demoRewrite(request)
  if (rewritten) return rewritten

  const { pathname } = request.nextUrl
  const demoCookie = request.cookies.get("turndown_demo")?.value === "1"
  const keys = await resolveClerkKeys()
  if (!keys) {
    if (demoEntryAllowed() && demoCookie && isAppPath(pathname)) {
      return withDemoHeader(request)
    }
    if (isPublic(pathname)) return NextResponse.next()
    const signIn = request.nextUrl.clone()
    signIn.pathname = "/sign-in"
    return NextResponse.redirect(signIn)
  }

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server")
  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/w(.*)",
    "/api/widget(.*)",
    "/api/demo-entry",
  ])
  const handler = clerkMiddleware(
    async (auth, req) => {
      if (!isPublicRoute(req)) await auth.protect()
    },
    {
      publishableKey: keys.publishableKey,
      secretKey: keys.secretKey,
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
    },
  )
  return handler(request, event)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
