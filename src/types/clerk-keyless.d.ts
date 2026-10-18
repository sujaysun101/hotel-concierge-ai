declare module "@clerk/nextjs/dist/esm/server/keyless-node.js" {
  export function keyless(): {
    getOrCreateKeys: () => Promise<{ publishableKey?: string; secretKey?: string } | null | undefined>
  }
}
