import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Plus, Trash2, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Inbound, RoutingRule } from "@/lib/types";

export default function RoutingPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [domain, setDomain] = React.useState("");
  const [selected, setSelected] = React.useState<number[]>([]);

  const { data: rules = [] } = useQuery<RoutingRule[]>({
    queryKey: ["routing"],
    queryFn: api.routing,
  });
  const { data: inbounds = [] } = useQuery<Inbound[]>({
    queryKey: ["inbounds"],
    queryFn: api.inbounds,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["routing"] });

  const addMut = useMutation({
    mutationFn: () => api.addRouting(domain.trim(), selected),
    onSuccess: () => {
      toast.push("success", "Block rule added");
      setDomain("");
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.push("error", "Enter a domain to block");
      return;
    }
    addMut.mutate();
  };

  const toggle = (id: number) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const inboundName = (id: number) => inbounds.find((i) => i.id === id)?.tag || `#${id}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Routing</h1>
        <p className="text-sm font-base text-text/60">Block domains on selected inbounds</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-main" />
            <CardTitle>Block a domain</CardTitle>
          </div>
          <CardDescription>
            Traffic to these domains is dropped. Leave inbounds empty to block on all of them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com  (or  geosite:category-ads)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit(e);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-heading text-text/70">
                <Globe className="h-4 w-4" />
                Apply to inbounds
                <span className="text-xs text-text/40">(none = all)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
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
            <Button type="submit" className="w-full sm:w-auto" disabled={addMut.isPending}>
              <Plus className="h-4 w-4" />
              Add block rule
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked domains</CardTitle>
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
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 shrink-0 text-red-400" />
                  <span className="truncate font-heading">{r.domain}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.inbound_ids.length === 0 ? (
                    <Badge variant="info" className="text-[10px]">
                      all inbounds
                    </Badge>
                  ) : (
                    r.inbound_ids.map((id) => (
                      <Badge key={id} variant="neutral" className="text-[10px]">
                        {inboundName(id)}
                      </Badge>
                    ))
                  )}
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
  );
}
