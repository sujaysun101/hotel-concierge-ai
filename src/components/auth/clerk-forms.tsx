"use client"

import { SignIn, SignUp } from "@clerk/nextjs"

const appearance = {
  variables: {
    colorPrimary: "#1F4D3A",
    colorBackground: "#FBF7F0",
    colorText: "#1C241C",
    colorInputBackground: "#FFFCF7",
    colorInputText: "#1C241C",
    borderRadius: "0.8rem",
    fontFamily: "var(--font-outfit), sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full bg-transparent p-0 shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "border border-[#e4dccb]",
    formButtonPrimary: "bg-[#1F4D3A] hover:bg-[#173C2D]",
    footerActionLink: "text-[#1F4D3A]",
  },
}

export function ClerkSignIn() {
  return <SignIn appearance={appearance} />
}

export function ClerkSignUp() {
  return <SignUp appearance={appearance} />
}
