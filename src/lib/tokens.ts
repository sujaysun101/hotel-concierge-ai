import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

export function newGuestToken(): string {
  return randomBytes(24).toString("base64url")
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export function tokenMatches(storedHash: string, token: string): boolean {
  const next = hashToken(token)
  const left = Buffer.from(storedHash)
  const right = Buffer.from(next)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
  return slug || "house"
}
