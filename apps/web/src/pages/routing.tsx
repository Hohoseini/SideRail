import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Plus, Trash2, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiCombobox, type ComboItem } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Inbound, RoutingRule, RoutingPreset } from "@/lib/types";

export default function RoutingPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [values, setValues] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<number[]>([]);
  const labelsRef = React.useRef<Record<string, string>>({});

  const { data: rules = [] } = useQuery<RoutingRule[]>({
    queryKey: ["routing"],
    queryFn: api.routing,
  });
  const { data: inbounds = [] } = useQuery<Inbound[]>({
    queryKey: ["inbounds"],
    queryFn: api.inbounds,
  });
  const { data: presets } = useQuery<{ domains: RoutingPreset[]; ips: RoutingPreset[] }>({
    queryKey: ["routing-presets"],
    queryFn: api.routingPresets,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["routing"] });

  const addMut = useMutation({
    mutationFn: async () => {
      for (const v of values) {
        await api.addRouting(v, selected, "domain", labelsRef.current[v] || v);
      }
    },
    onSuccess: () => {
      toast.push("success", "Block rules added");
      setValues([]);
      setSelected([]);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteRouting(id),
    onSuccess: () => {
      toast.push("success", "Rule removed");
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const domainItems: ComboItem[] = React.useMemo(
    () =>
      (presets?.domains ?? []).map((p) => ({
        value: p.values[0],
        label: p.label,
        group: "Presets",
      })),
    [presets],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (values.length === 0) {
      toast.push("error", "Choose or type at least one domain to block");
      return;
    }
    if (selected.length === 0) {
      toast.push("error", "Select at least one inbound to apply the rule");
      return;
    }
    addMut.mutate();
  };

  const toggle = (id: number) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const selectAll = () =>
    setSelected(selected.length === inbounds.length ? [] : inbounds.map((i) => i.id));

  const inboundName = (id: number) => inbounds.find((i) => i.id === id)?.tag || `#${id}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Routing</h1>
        <p className="text-sm font-base text-text/60">Block domains on selected inbounds</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-main" />
              <CardTitle>Block domains</CardTitle>
            </div>
            <CardDescription>Pick presets, or type your own and press Enter.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <MultiCombobox
                items={domainItems}
                selected={values}
                onChange={setValues}
                labels={labelsRef.current}
                placeholder="e.g. example.com or pick a preset…"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-heading text-text/70">Apply to inbounds</div>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs font-heading text-text/60 underline-offset-2 hover:underline"
                  >
                    {selected.length === inbounds.length ? "Clear all" : "Select all"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {inbounds.map((ib) => {
                    const active = selected.includes(ib.id);
                    return (
                      <button
                        key={ib.id}
                        type="button"
                        onClick={() => toggle(ib.id)}
                        className={cn(
                          "rounded-base border-2 border-border px-2.5 py-1.5 text-left text-xs font-heading transition-all",
                          active ? "bg-main text-mtext neo-shadow" : "bg-bw hover:bg-main/10",
                        )}
                      >
                        {ib.tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={addMut.isPending}>
                <Plus className="h-4 w-4" />
                Add block rule
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-main" />
              <CardTitle>Blocked domains</CardTitle>
            </div>
            <CardDescription>{rules.length} active rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rules.length === 0 && (
              <div className="rounded-base border-2 border-dashed border-border/40 py-10 text-center text-sm text-text/50">
                No block rules yet.
              </div>
            )}
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-base border-2 border-border bg-bg/40 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-base border-2 border-border bg-red-300">
                    <Globe className="h-4 w-4 text-black" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-heading">{r.label || r.domain}</div>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {(r.inbound_ids.length === 0 ? inbounds.map((i) => i.id) : r.inbound_ids).map(
                        (id) => (
                          <Badge key={id} variant="neutral" className="text-[10px]">
                            {inboundName(id)}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => deleteMut.mutate(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
