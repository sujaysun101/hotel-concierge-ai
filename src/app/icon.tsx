import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1F4D3A",
          borderRadius: 8,
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 10,
            width: 14,
            height: 12,
            border: "2px solid #F7F3EA",
            borderRight: "none",
            borderBottom: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 6,
            top: 10,
            width: 0,
            height: 0,
            borderLeft: "8px solid #C4A36A",
            borderBottom: "8px solid transparent",
          }}
        />
      </div>
    ),
    size,
  )
}
