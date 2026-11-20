import { ImageResponse } from "next/og";

export const alt = "Settlr — Your new job. Your new city. Everything sorted.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F4F9FC", padding: 80, fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#6879DE", letterSpacing: 4 }}>SETTLR · PUNE</div>
          <div style={{ fontSize: 84, fontWeight: 800, color: "#17283A", lineHeight: 1.05, display: "flex", flexDirection: "column" }}>
            <span>New job.</span>
            <span>New city.</span>
            <span style={{ color: "#6879DE" }}>Everything sorted.</span>
          </div>
        </div>
        <div style={{ position: "absolute", right: 90, top: 150, width: 300, height: 300, background: "#17283A", borderRadius: 48, transform: "rotate(45deg)", display: "flex" }} />
        <div style={{ position: "absolute", right: 165, top: 225, width: 150, height: 150, background: "#F36A5B", borderRadius: 28, transform: "rotate(45deg)", display: "flex" }} />
      </div>
    ),
    size,
  );
}
