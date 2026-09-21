import { cn } from "@/lib/utils";

export function RailLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
    >
      <path d="M8 3.5h8a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6.5a3 3 0 0 1 3-3Z" />
      <path d="M5 11h14" />
      <path d="M9 18l-2 3" />
      <path d="M15 18l2 3" />
      <circle cx="9" cy="14.5" r="1" />
      <circle cx="15" cy="14.5" r="1" />
    </svg>
  );
}
