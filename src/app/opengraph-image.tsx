import { ImageResponse } from "next/og";

export const alt = "Copperline Barbers, Tshiame A, Harrismith";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#15202B", color: "#F5F3EE" }}>
        <div style={{ width: 120, height: 12, background: "#A5342A", marginBottom: 36 }} />
        <div style={{ fontSize: 96, fontWeight: 800 }}>Copperline Barbers</div>
        <div style={{ fontSize: 40, marginTop: 20, opacity: 0.8 }}>Cuts, fades and shaves. Tshiame A, Harrismith.</div>
      </div>
    ),
    size,
  );
}
