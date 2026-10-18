import type { Metadata } from "next"
import { AuthFrame } from "@/components/auth/auth-frame"
import { ClerkSignIn } from "@/components/auth/clerk-forms"
import { DemoEntry } from "@/components/auth/demo-entry"
import { resolveClerkKeys } from "@/lib/runtime"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Sign in" }

export default async function SignInPage() {
  const keys = await resolveClerkKeys()
  return (
    <AuthFrame title="Sign in" lede="The desk is for the person who runs the house.">
      {keys ? <ClerkSignIn /> : <DemoEntry />}
    </AuthFrame>
  )
}
