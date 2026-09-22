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
          const box = canvas.width * 0.22;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(c - box / 2, c - box / 2, box, box);
          ctx.fillStyle = "#a3e635";
          const r = box * 0.16;
          const x = c - box / 2 + box * 0.12;
          const y = c - box / 2 + box * 0.12;
          const w = box * 0.76;
          ctx.beginPath();
          ctx.roundRect(x, y, w, w, r);
          ctx.fill();
          ctx.fillStyle = "#0b0b0f";
          ctx.font = `900 ${box * 0.42}px Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("SR", c, c + box * 0.02);
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
