import { cn } from "@/lib/utils";

export function RailLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-center justify-center font-heading leading-none tracking-tight",
        className,
      )}
    >
      SR
    </span>
  );
}
