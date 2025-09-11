import * as React from "react";
import { Dice5, KeyRound, Shuffle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

const fingerprints = ["chrome", "firefox", "safari", "ios", "android", "edge", "random", "randomized"];
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
  const [ipLimit, setIpLimit] = React.useState(0);
  const [expireDays, setExpireDays] = React.useState(0);
  const [subExpireDays, setSubExpireDays] = React.useState(0);
  const [trafficReset, setTrafficReset] = React.useState<TrafficReset>("never");
  const [telegramId, setTelegramId] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [inboundIds, setInboundIds] = React.useState<number[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
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
      setTelegramId(editing.telegram_id);
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
      setTelegramId("");
      setComment("");
      setInboundIds(inbounds.filter((i) => i.enabled).map((i) => i.id));
    }
  }, [open, editing, inbounds]);

  const toggleInbound = (id: number) => {
    setInboundIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
        telegramId,
        comment,
        inboundIds,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit user" : "New user"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email / identifier</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
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

            <div className="space-y-2 sm:col-span-2">
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
              <Label htmlFor="alpn">ALPN</Label>
              <Input id="alpn" value={alpn} onChange={(e) => setAlpn(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataLimit">Data limit (GB, 0 = unlimited)</Label>
              <Input
                id="dataLimit"
                type="number"
                min={0}
                step="0.1"
                value={dataLimit}
                onChange={(e) => setDataLimit(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipLimit">IP limit (0 = unlimited)</Label>
              <Input
                id="ipLimit"
                type="number"
                min={0}
                value={ipLimit}
                onChange={(e) => setIpLimit(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expireDays">Expire in (days, 0 = never)</Label>
              <Input
                id="expireDays"
                type="number"
                min={0}
                value={expireDays}
                onChange={(e) => setExpireDays(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subExpireDays">Sub expires (days after first visit)</Label>
              <Input
                id="subExpireDays"
                type="number"
                min={0}
                value={subExpireDays}
                onChange={(e) => setSubExpireDays(Number(e.target.value))}
              />
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
              <Label htmlFor="telegramId">Telegram ID</Label>
              <Input
                id="telegramId"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-main" />
              <Label>Attached inbounds</Label>
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
