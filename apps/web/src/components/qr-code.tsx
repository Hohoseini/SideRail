import * as React from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCode({ value, size = 180, className }: QrCodeProps) {
  const [dataUrl, setDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    let active = true;
    const render = async () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = 2;
        await QRCode.toCanvas(canvas, value, {
          width: size * scale,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "H",
        });
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const c = canvas.width / 2;
          const box = canvas.width * 0.24;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(c - box / 2, c - box / 2, box, box);
          ctx.fillStyle = "#a3e635";
          const r = box * 0.18;
          const x = c - box / 2 + box * 0.1;
          const y = c - box / 2 + box * 0.1;
          const w = box * 0.8;
          ctx.beginPath();
          ctx.roundRect(x, y, w, w, r);
          ctx.fill();

          // train logo (matches panel RailLogo)
          ctx.save();
          ctx.translate(c, c);
          const s = (box * 0.62) / 24;
          ctx.scale(s, s);
          ctx.translate(-12, -12);
          ctx.strokeStyle = "#0b0b0f";
          ctx.fillStyle = "#0b0b0f";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          const rr = (x0: number, y0: number, w0: number, h0: number, rad: number) => {
            ctx.beginPath();
            ctx.moveTo(x0 + rad, y0);
            ctx.arcTo(x0 + w0, y0, x0 + w0, y0 + h0, rad);
            ctx.arcTo(x0 + w0, y0 + h0, x0, y0 + h0, rad);
            ctx.arcTo(x0, y0 + h0, x0, y0, rad);
            ctx.arcTo(x0, y0, x0 + w0, y0, rad);
            ctx.closePath();
            ctx.stroke();
          };
          rr(5, 3.5, 14, 14.5, 3);
          ctx.beginPath();
          ctx.moveTo(5, 11);
          ctx.lineTo(19, 11);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(9, 18);
          ctx.lineTo(7, 21);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(15, 18);
          ctx.lineTo(17, 21);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(9, 14.5, 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(15, 14.5, 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (active) setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        if (active) setDataUrl("");
      }
    };
    void render();
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <div
      className={cn(
        "grid place-items-center rounded-base border-2 border-border bg-white p-2 neo-shadow",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <img src={dataUrl} alt="QR code" className="h-full w-full" />
      ) : (
        <div className="h-full w-full animate-pulse bg-zinc-200" />
      )}
    </div>
  );
}
