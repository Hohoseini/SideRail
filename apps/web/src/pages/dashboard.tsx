import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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

  const s = data;

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
