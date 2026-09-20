import * as React from "react";
import { Dice5, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Inbound, TrafficReset, User, UserFormValues } from "@/lib/types";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inbounds: Inbound[];
  editing: User | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const fingerprints = ["chrome", "firefox", "safari", "ios", "android", "edge", "random"];
const alpnOptions = ["h2,http/1.1", "h2", "http/1.1"];
const resets: TrafficReset[] = ["never", "daily", "weekly", "monthly"];

function randomToken(len: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  const rnd = crypto.getRandomValues(new Uint32Array(len));
  for (let i = 0; i < len; i++) out += chars[rnd[i] % chars.length];
  return out;
}

export function UserFormDialog({
  open,
  onOpenChange,
  inbounds,
  editing,
  onSubmit,
}: UserFormDialogProps) {
  const [email, setEmail] = React.useState("");
  const [uuid, setUuid] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fingerprint, setFingerprint] = React.useState("chrome");
  const [alpn, setAlpn] = React.useState("h2,http/1.1");
  const [dataLimit, setDataLimit] = React.useState(0);
  const [expireDays, setExpireDays] = React.useState(30);
  const [ipLimit, setIpLimit] = React.useState(0);
  const [subExpireDays, setSubExpireDays] = React.useState(0);
  const [trafficReset, setTrafficReset] = React.useState<TrafficReset>("never");
  const [comment, setComment] = React.useState("");
  const [inboundIds, setInboundIds] = React.useState<number[]>([]);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setShowAdvanced(false);
    if (editing) {
      setEmail(editing.email);
      setUuid(editing.uuid);
      setPassword(editing.password);
      setFingerprint(editing.fingerprint);
      setAlpn(editing.alpn);
      setDataLimit(Math.round((editing.data_limit / 1024 ** 3) * 100) / 100);
      setIpLimit(editing.ip_limit);
      setExpireDays(
        editing.expire_at
          ? Math.max(0, Math.round((editing.expire_at - Date.now()) / 86_400_000))
          : 0,
      );
      setSubExpireDays(editing.sub_expire_days);
      setTrafficReset(editing.traffic_reset);
      setComment(editing.comment);
      setInboundIds(editing.inbound_ids);
    } else {
      setEmail("");
      setUuid(crypto.randomUUID());
      setPassword(randomToken(16));
      setFingerprint("chrome");
      setAlpn("h2,http/1.1");
      setDataLimit(0);
      setIpLimit(0);
      setExpireDays(30);
      setSubExpireDays(0);
      setTrafficReset("never");
      setComment("");
      setInboundIds(inbounds.filter((i) => i.enabled).map((i) => i.id));
    }
  }, [open, editing, inbounds]);

  const toggleInbound = (id: number) => {
    setInboundIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        email,
        uuid,
        password,
        fingerprint,
        alpn,
        dataLimit,
        ipLimit,
        expireDays,
        subExpireDays,
        trafficReset,
        comment,
        inboundIds,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit user" : "New user"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Name / email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client"
              required
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Data limit</Label>
              <NumberInput value={dataLimit} onChange={setDataLimit} step={1} suffix="GB" />
              <p className="text-[11px] text-text/50">0 = unlimited</p>
            </div>
            <div className="space-y-2">
              <Label>Expire in</Label>
              <NumberInput value={expireDays} onChange={setExpireDays} step={1} suffix="days" />
              <p className="text-[11px] text-text/50">0 = never</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Attached inbounds</Label>
              <button
                type="button"
                onClick={() =>
                  setInboundIds(
                    inboundIds.length === inbounds.length ? [] : inbounds.map((i) => i.id),
                  )
                }
                className="text-xs font-heading text-text/60 underline-offset-2 hover:underline"
              >
                {inboundIds.length === inbounds.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {inbounds.map((ib) => {
                const active = inboundIds.includes(ib.id);
                return (
                  <button
                    key={ib.id}
                    type="button"
                    onClick={() => toggleInbound(ib.id)}
                    className={cn(
                      "flex items-center justify-between rounded-base border-2 border-border px-3 py-2 text-left text-sm font-heading transition-all",
                      active
                        ? "bg-main text-mtext neo-shadow"
                        : "bg-bw text-text hover:bg-main/10",
                      !ib.enabled && "opacity-50",
                    )}
                  >
                    <span>{ib.tag}</span>
                    <span className="text-[10px] uppercase tracking-wide opacity-70">
                      {ib.protocol}/{ib.transport}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm font-heading text-text/70 underline-offset-2 hover:underline"
          >
            {showAdvanced ? "Hide advanced options" : "Show advanced options"}
          </button>

          {showAdvanced && (
            <div className="space-y-4 rounded-base border-2 border-border/40 bg-bg/30 p-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="uuid">UUID</Label>
                <div className="flex gap-2">
                  <Input id="uuid" value={uuid} onChange={(e) => setUuid(e.target.value)} required />
                  <Button
                    type="button"
                    variant="neutral"
                    size="icon"
                    onClick={() => setUuid(crypto.randomUUID())}
                    title="Generate UUID"
                  >
                    <Dice5 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Trojan)</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="neutral"
                    size="icon"
                    onClick={() => setPassword(randomToken(16))}
                    title="Generate password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fingerprint (uTLS)</Label>
                  <Select value={fingerprint} onValueChange={setFingerprint}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fingerprints.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ALPN</Label>
                  <Select value={alpn} onValueChange={setAlpn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {alpnOptions.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>IP limit</Label>
                  <NumberInput value={ipLimit} onChange={setIpLimit} step={1} />
                </div>
                <div className="space-y-2">
                  <Label>Sub expires (days after first visit)</Label>
                  <NumberInput value={subExpireDays} onChange={setSubExpireDays} step={1} />
                </div>
                <div className="space-y-2">
                  <Label>Traffic reset</Label>
                  <Select
                    value={trafficReset}
                    onValueChange={(v) => setTrafficReset(v as TrafficReset)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resets.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Input id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
