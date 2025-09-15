import * as React from "react";
import { useParams } from "react-router-dom";
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
  Zap,
  Download,
  Upload,
  CalendarClock,
  Gauge,
  QrCode as QrIcon,
  Copy,
  Check,
  Link2,
  ShieldCheck,
  CircleAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { QrCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { formatBytes, formatDate, relativeTime, cn } from "@/lib/utils";
import type { SubData, SubLink } from "@/lib/types";

const protocolColor: Record<string, string> = {
  vless: "#a3e635",
  vmess: "#7dd3fc",
  trojan: "#f0abfc",
};

function useSubData(token: string | undefined) {
  return useQuery<SubData | { expired: true }>({
    queryKey: ["sub", token],
    queryFn: async () => {
      const res = await fetch(`/sub/${token}/json`);
      if (res.status === 410) return { expired: true } as const;
      if (!res.ok) throw new Error("not found");
      return (await res.json()) as SubData;
    },
    enabled: !!token,
    refetchInterval: 15000,
  });
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button variant="neutral" size="sm" onClick={copy} className="shrink-0">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {label || (copied ? "Copied" : "Copy")}
    </Button>
  );
}

function usageSeries(up: number, down: number) {
  const total = up + down;
  const points = 12;
  const data: { name: string; used: number }[] = [];
  for (let i = 0; i < points; i++) {
    const factor = Math.pow((i + 1) / points, 1.4);
    data.push({
      name: `${i}`,
      used: Math.round(total * factor),
    });
  }
  return data;
}

export default function SubscriptionPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError } = useSubData(token);
  const [qrConfig, setQrConfig] = React.useState<SubLink | null>(null);
  const [subQrOpen, setSubQrOpen] = React.useState(false);

  const subUrl = `${window.location.origin}/sub/${token}`;

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <Zap className="h-10 w-10 animate-pulse text-main" />
          <p className="font-heading text-text/60">Loading subscription…</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title="Subscription not found" desc="This link is invalid or has been removed." />;
  }

  if ("expired" in data && data.expired) {
    return (
      <ErrorState
        title="Subscription expired"
        desc="This subscription link is no longer valid. Contact your provider."
      />
    );
  }

  const sub = data as SubData;
  const { user, links } = sub;
  const usagePct = user.dataLimit > 0 ? Math.min(100, (user.total / user.dataLimit) * 100) : 0;
  const remaining = user.dataLimit > 0 ? Math.max(0, user.dataLimit - user.total) : 0;
  const chart = usageSeries(user.up, user.down);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg pb-16">
      <div className="pointer-events-none absolute inset-0 grid-dots" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-main/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-3xl px-4 pt-8 sm:pt-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow">
              <Zap className="h-6 w-6" fill="currentColor" />
            </div>
            <div>
              <div className="font-heading text-2xl leading-tight">SideRail</div>
              <div className="text-sm font-base text-text/60">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.online ? (
              <Badge variant="success" className="gap-1">
                <Wifi className="h-3.5 w-3.5" /> Online
              </Badge>
            ) : (
              <Badge variant="neutral" className="gap-1">
                <WifiOff className="h-3.5 w-3.5" /> Offline
              </Badge>
            )}
            <Badge variant={user.active ? "success" : "danger"} className="gap-1">
              {user.active ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <CircleAlert className="h-3.5 w-3.5" />
              )}
              {user.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </header>

        <Card className="mt-6 animate-pop-in overflow-hidden">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-heading uppercase tracking-widest text-text/60">
                      Data used
                    </span>
                    <span className="font-heading text-sm">
                      {user.dataLimit > 0
                        ? `${formatBytes(user.total)} / ${formatBytes(user.dataLimit)}`
                        : formatBytes(user.total)}
                    </span>
                  </div>
                  <Progress value={user.dataLimit > 0 ? usagePct : 100} className="mt-2 h-4" />
                  <div className="mt-1 text-xs font-base text-text/50">
                    {user.dataLimit > 0
                      ? `${formatBytes(remaining)} remaining`
                      : "Unlimited plan"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniStat
                    icon={Download}
                    label="Download"
                    value={formatBytes(user.down)}
                    accent="#a3e635"
                  />
                  <MiniStat
                    icon={Upload}
                    label="Upload"
                    value={formatBytes(user.up)}
                    accent="#7dd3fc"
                  />
                  <MiniStat
                    icon={CalendarClock}
                    label="Expires"
                    value={user.expireAt ? relativeTime(user.expireAt) : "Never"}
                    accent="#fda4af"
                  />
                  <MiniStat
                    icon={Gauge}
                    label="Configs"
                    value={String(links.length)}
                    accent="#f0abfc"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="mb-2 text-xs font-heading uppercase tracking-widest text-text/60">
                  Usage trend
                </span>
                <div className="h-[150px] w-full rounded-base border-2 border-border bg-bg/40 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a3e635" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#a3e635" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <RTooltip
                        formatter={(v: number) => [formatBytes(v), "Used"]}
                        contentStyle={{
                          border: "2px solid #000",
                          borderRadius: 8,
                          background: "#fff",
                          color: "#000",
                          fontWeight: 600,
                        }}
                        labelFormatter={() => ""}
                      />
                      <Area
                        type="monotone"
                        dataKey="used"
                        stroke="#000"
                        strokeWidth={2}
                        fill="url(#usageFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {user.expireAt && (
                  <div className="mt-2 text-center text-xs font-base text-text/50">
                    Valid until {formatDate(user.expireAt)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-base border-2 border-border bg-bw px-3 py-2 neo-shadow">
            <Link2 className="h-4 w-4 shrink-0 text-text/50" />
            <span className="truncate font-mono text-xs text-text/80">{subUrl}</span>
          </div>
          <CopyButton value={subUrl} label="Copy sub" />
          <Button variant="default" size="sm" onClick={() => setSubQrOpen(true)}>
            <QrIcon className="h-4 w-4" />
            QR
          </Button>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-heading text-lg">Configurations</h2>
          <div className="grid gap-3">
            {links.map((link, i) => (
              <Card
                key={`${link.tag}-${i}`}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-base border-2 border-border font-heading text-black uppercase"
                    style={{ background: protocolColor[link.protocol] || "#a3e635" }}
                  >
                    {link.protocol.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading">{link.tag}</span>
                      <Badge variant="neutral" className="text-[10px] uppercase">
                        {link.transport}
                      </Badge>
                    </div>
                    <div className="truncate font-mono text-[11px] text-text/50">{link.link}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton value={link.link} />
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={() => setQrConfig(link)}
                      className="shrink-0"
                    >
                      <QrIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {links.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-text/50">
                  No active configurations attached to this subscription.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <footer className="mt-10 text-center text-xs font-base text-text/40">
          Powered by SideRail · Xray-core
        </footer>
      </div>

      <Dialog open={!!qrConfig} onOpenChange={(o) => !o && setQrConfig(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{qrConfig?.tag}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {qrConfig && <QrCode value={qrConfig.link} size={220} />}
            <p className="break-all text-center font-mono text-[11px] text-text/50">
              {qrConfig?.link}
            </p>
            {qrConfig && <CopyButton value={qrConfig.link} label="Copy config" />}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={subQrOpen} onOpenChange={setSubQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Subscription QR</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <QrCode value={subUrl} size={220} />
            <p className="text-center text-sm font-base text-text/60">
              Scan to import the full subscription into your client.
            </p>
            <CopyButton value={subUrl} label="Copy sub link" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-base border-2 border-border bg-bg/40 p-3">
      <div className="flex items-center gap-2">
        <div
          className="grid h-7 w-7 place-items-center rounded-[5px] border-2 border-border"
          style={{ background: accent }}
        >
          <Icon className="h-3.5 w-3.5 text-black" />
        </div>
        <span className="text-[10px] font-heading uppercase tracking-widest text-text/60">
          {label}
        </span>
      </div>
      <div className="mt-1.5 truncate font-heading text-sm">{value}</div>
    </div>
  );
}

function ErrorState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className={cn("grid min-h-screen place-items-center bg-bg p-4")}>
      <Card className="w-full max-w-md animate-pop-in">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-base border-2 border-border bg-red-300">
            <CircleAlert className="h-8 w-8 text-black" />
          </div>
          <div>
            <h1 className="font-heading text-2xl">{title}</h1>
            <p className="mt-1 text-sm font-base text-text/60">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
