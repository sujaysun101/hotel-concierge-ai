import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Turndown, the front desk for independent inns"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1F4D3A",
          color: "#F7F3EA",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F7F3EA", display: "flex" }} />
          Turndown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, maxWidth: 860 }}>The front desk that reads your house book.</div>
          <div style={{ fontSize: 28, color: "#E2C08D" }}>For independent hotels and B&Bs.</div>
        </div>
      </div>
    ),
    size,
  )
}
