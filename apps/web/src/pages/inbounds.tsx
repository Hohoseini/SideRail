import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Router, Waypoints, Network, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Inbound } from "@/lib/types";

const protocolAccent: Record<string, string> = {
  vless: "#a3e635",
  vmess: "#7dd3fc",
  trojan: "#f0abfc",
};

export default function InboundsPage() {
  const toast = useToast();
  const qc = useQueryClient();

  const { data: inbounds = [] } = useQuery<Inbound[]>({
    queryKey: ["inbounds"],
    queryFn: api.inbounds,
    refetchInterval: 10000,
  });

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      api.toggleInbound(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbounds"] });
      toast.push("success", "Inbound updated");
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const enabledCount = inbounds.filter((i) => i.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Inbounds</h1>
          <p className="text-sm font-base text-text/60">
            Enable or disable the default HTTP-based inbounds
          </p>
        </div>
        <Badge variant="info" className="gap-1">
          <Waypoints className="h-3.5 w-3.5" />
          {enabledCount} / {inbounds.length} enabled
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {inbounds.map((ib) => (
          <Card key={ib.id} className="overflow-hidden transition-transform hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className="grid h-11 w-11 place-items-center rounded-base border-2 border-border font-heading uppercase text-black"
                  style={{ background: protocolAccent[ib.protocol] || "#a3e635" }}
                >
                  {ib.protocol.slice(0, 2)}
                </div>
                <Switch
                  checked={!!ib.enabled}
                  onCheckedChange={(v) => toggle.mutate({ id: ib.id, enabled: v })}
                />
              </div>
              <div className="mt-3 font-heading text-lg">{ib.tag}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="neutral" className="text-[10px] uppercase">
                  {ib.protocol}
                </Badge>
                <Badge variant="default" className="text-[10px] uppercase">
                  {ib.transport}
                </Badge>
                <Badge variant="success" className="gap-1 text-[10px]">
                  <Lock className="h-3 w-3" /> TLS 443
                </Badge>
              </div>
              <div className="mt-4 space-y-1.5 border-t-2 border-border/30 pt-3 text-xs font-base text-text/60">
                <div className="flex items-center gap-2">
                  <Network className="h-3.5 w-3.5" />
                  <span>internal port</span>
                  <span className="ml-auto font-mono text-text/80">{ib.port}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Router className="h-3.5 w-3.5 shrink-0" />
                  <span className="shrink-0">path</span>
                  <span className="ml-auto min-w-0 truncate font-mono text-text/80">{ib.path}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
