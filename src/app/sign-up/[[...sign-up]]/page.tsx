import type { Metadata } from "next"
import Link from "next/link"
import { AuthFrame } from "@/components/auth/auth-frame"
import { ClerkSignUp } from "@/components/auth/clerk-forms"
import { DemoEntry } from "@/components/auth/demo-entry"
import { resolveClerkKeys } from "@/lib/runtime"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Create an account" }

export default async function SignUpPage() {
  const keys = await resolveClerkKeys()
  return (
    <AuthFrame title="Create an account" lede="One house to start. The book, the inbox, and the widget come with it.">
      {keys ? (
        <ClerkSignUp />
      ) : (
        <div className="space-y-4">
          <DemoEntry />
          <p className="text-sm">
            Already poking around? <Link href="/sign-in" className="underline">Sign in</Link>
          </p>
        </div>
      )}
    </AuthFrame>
  )
}
