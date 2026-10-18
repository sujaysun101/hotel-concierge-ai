import type { Metadata } from "next"
import { Fraunces, Outfit } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { resolveClerkKeys } from "@/lib/runtime"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Turndown",
    template: "%s · Turndown",
  },
  description:
    "Turndown is the front desk for independent inns. It answers guest questions from your house book and hands the rest to a person.",
  openGraph: {
    title: "Turndown",
    description: "The front desk that reads your house book.",
    type: "website",
  },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const keys = await resolveClerkKeys()
  const inner = (
    <ThemeProvider>
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  )

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        {keys ? (
          <ClerkProvider
            publishableKey={keys.publishableKey}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/app"
            signUpFallbackRedirectUrl="/app"
          >
            {inner}
          </ClerkProvider>
        ) : (
          inner
        )}
      </body>
    </html>
  )
}
