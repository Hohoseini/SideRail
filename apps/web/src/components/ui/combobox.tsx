import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboItem {
  value: string;
  label: string;
  group?: string;
}

interface ComboboxProps {
  items: ComboItem[];
  value: string;
  onChange: (value: string, item?: ComboItem) => void;
  placeholder?: string;
  allowCustom?: boolean;
  emptyText?: string;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select…",
  allowCustom = true,
  emptyText = "No matches",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const filtered = items.filter(
    (i) =>
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.value.toLowerCase().includes(query.toLowerCase()),
  );

  const groups = filtered.reduce<Record<string, ComboItem[]>>((acc, i) => {
    const g = i.group || "";
    (acc[g] ||= []).push(i);
    return acc;
  }, {});

  const selectedLabel = items.find((i) => i.value === value)?.label || value;

  const pick = (item: ComboItem) => {
    onChange(item.value, item);
    setOpen(false);
    setQuery("");
  };

  const useCustom = () => {
    if (query.trim()) {
      onChange(query.trim());
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-base border-2 border-border bg-bw px-3 text-sm font-base text-text"
      >
        <span className={cn("truncate", !value && "text-text/50")}>
          {value ? selectedLabel : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-base border-2 border-border bg-bw neo-shadow animate-pop-in">
          <div className="flex items-center gap-2 border-b-2 border-border/40 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-text/50" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered.length > 0) pick(filtered[0]);
                  else if (allowCustom) useCustom();
                }
              }}
              placeholder="Search…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-text/40"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 no-scrollbar">
            {Object.entries(groups).map(([g, list]) => (
              <div key={g}>
                {g && (
                  <div className="px-2 py-1 text-[10px] font-heading uppercase tracking-widest text-text/40">
                    {g}
                  </div>
                )}
                {list.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => pick(item)}
                    className="flex w-full items-center justify-between gap-2 rounded-[4px] px-2 py-2 text-left text-sm font-base transition-colors hover:bg-main/15"
                  >
                    <span className="truncate">{item.label}</span>
                    {value === item.value && <Check className="h-4 w-4 shrink-0 text-main" />}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-2 py-3 text-center text-xs text-text/50">
                {allowCustom && query.trim() ? (
                  <button
                    type="button"
                    onClick={useCustom}
                    className="w-full rounded-[4px] px-2 py-2 font-heading hover:bg-main/15"
                  >
                    Use “{query.trim()}”
                  </button>
                ) : (
                  emptyText
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
