import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Layers,
  Download,
  Upload,
  Activity,
  CircleCheck,
  CircleX,
  ArrowDownUp,
  Router as RouterIcon,
} from "lucide-react";
import { api, exportBackupUrl } from "@/lib/api";
import { formatBytes, pct } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { SystemStats } from "@/lib/types";

const protocolAccent: Record<string, string> = {
  VLESS: "#a3e635",
  VMess: "#7dd3fc",
  Trojan: "#f0abfc",
};

function inboundColor(tag: string): string {
  for (const [k, v] of Object.entries(protocolAccent)) if (tag.startsWith(k)) return v;
  return "#a3e635";
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  progress: number;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-text/70">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-heading uppercase tracking-widest">{label}</span>
            </div>
            <div className="mt-2 font-heading text-3xl">{value}</div>
          </div>
          <div
            className="grid h-10 w-10 place-items-center rounded-base border-2 border-border"
            style={{ background: accent }}
          >
            <Icon className="h-5 w-5 text-black" />
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} indicatorClassName="" />
          <div className="mt-2 text-xs font-base text-text/60">{sub}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const { data } = useQuery<SystemStats>({
    queryKey: ["system"],
    queryFn: api.system,
    refetchInterval: 3000,
  });
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [importing, setImporting] = React.useState(false);

  const { data: traffic } = useQuery({
    queryKey: ["traffic-stats"],
    queryFn: api.trafficStats,
    refetchInterval: 5000,
  });

  const s = data;

  const chart = React.useMemo(() => {
    const rows = traffic?.server ?? [];
    return rows.map((r) => ({
      ts: r.ts,
      down: Math.round(r.down / 30),
      up: Math.round(r.up / 30),
    }));
  }, [traffic]);

  const onExport = () => {
    window.open(exportBackupUrl(), "_blank");
    toast.push("success", "Backup export started");
  };

  const onImportClick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await api.importBackup(json);
      toast.push("success", "Backup imported successfully");
    } catch (err) {
      toast.push("error", (err as Error).message || "Invalid backup file");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Dashboard</h1>
          <p className="text-sm font-base text-text/60">Live system metrics and maintenance</p>
        </div>
        <Badge variant={s?.xray.running ? "success" : "danger"} className="gap-1">
          {s?.xray.running ? (
            <CircleCheck className="h-3.5 w-3.5" />
          ) : (
            <CircleX className="h-3.5 w-3.5" />
          )}
          Xray {s?.xray.version} · {s?.xray.running ? "running" : "stopped"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Cpu}
          label="CPU"
          value={pct(s?.cpu.usage ?? 0)}
          sub={`${s?.cpu.cores ?? 0} cores · avg ${pct(s?.cpu.avg ?? 0)}`}
          progress={s?.cpu.usage ?? 0}
          accent="#a3e635"
        />
        <StatCard
          icon={MemoryStick}
          label="RAM"
          value={pct(s?.ram.usage ?? 0)}
          sub={`${formatBytes(s?.ram.used ?? 0)} / ${formatBytes(s?.ram.total ?? 0)}`}
          progress={s?.ram.usage ?? 0}
          accent="#7dd3fc"
        />
        <StatCard
          icon={Layers}
          label="Swap"
          value={pct(s?.swap.usage ?? 0)}
          sub={`${formatBytes(s?.swap.used ?? 0)} / ${formatBytes(s?.swap.total ?? 0)}`}
          progress={s?.swap.usage ?? 0}
          accent="#f0abfc"
        />
        <StatCard
          icon={HardDrive}
          label="Storage"
          value={pct(s?.storage.usage ?? 0)}
          sub={`free ${formatBytes(s?.storage.free ?? 0)}`}
          progress={s?.storage.usage ?? 0}
          accent="#fda4af"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-main" />
              <CardTitle>Live traffic</CardTitle>
            </div>
            <CardDescription>Server upload / download rate (per second)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] w-full">
              {chart.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a3e635" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#a3e635" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="ul" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="ts" hide />
                    <YAxis hide />
                    <RTooltip
                      formatter={(v: number, name) => [`${formatBytes(v)}/s`, name === "down" ? "Download" : "Upload"]}
                      labelFormatter={(l: number) =>
                        new Date(l).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      }
                      contentStyle={{
                        border: "2px solid #000",
                        borderRadius: 8,
                        background: "#fff",
                        color: "#000",
                        fontWeight: 600,
                      }}
                    />
                    <Area type="monotone" dataKey="down" stroke="#000" strokeWidth={2} fill="url(#dl)" />
                    <Area type="monotone" dataKey="up" stroke="#000" strokeWidth={2} fill="url(#ul)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-xs font-base text-text/40">
                  Collecting traffic data…
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-base">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border-2 border-border bg-main" /> Download
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border-2 border-border bg-sky-300" /> Upload
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RouterIcon className="h-5 w-5 text-main" />
              <CardTitle>Traffic per inbound</CardTitle>
            </div>
            <CardDescription>Total data used by each inbound</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(traffic?.inbounds ?? []).length === 0 && (
              <div className="py-8 text-center text-sm text-text/40">No traffic recorded yet.</div>
            )}
            {(traffic?.inbounds ?? []).map((ib) => (
              <div
                key={ib.inbound_tag}
                className="flex items-center justify-between gap-3 rounded-base border-2 border-border bg-bg/40 p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border-2 border-border"
                    style={{ background: inboundColor(ib.inbound_tag) }}
                  />
                  <span className="truncate font-heading text-sm">{ib.inbound_tag}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs font-base">
                  <span className="text-lime-500">↓ {formatBytes(ib.down)}</span>
                  <span className="text-sky-400">↑ {formatBytes(ib.up)}</span>
                  <span className="font-heading text-text/80">{formatBytes(ib.up + ib.down)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-main" />
            <CardTitle>Backup &amp; Restore</CardTitle>
          </div>
          <CardDescription>Export or import users and inbounds.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Button onClick={onExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="neutral"
              onClick={onImportClick}
              disabled={importing}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : "Import"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onFile}
            />
          </div>
          <p className="mt-3 text-xs font-base text-text/50">
            Importing replaces all existing users and inbounds. Xray restarts automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
