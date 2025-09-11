import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Users2,
  Wifi,
  ShieldCheck,
  BatteryWarning,
  Pencil,
  Trash2,
  Link2,
  RotateCcw,
  RefreshCw,
  MoreVertical,
  Copy,
  Server,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { formatBytes, relativeTime, durationSince, cn } from "@/lib/utils";
import type { Inbound, User, UserFormValues, UserSummary } from "@/lib/types";

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="grid h-12 w-12 place-items-center rounded-base border-2 border-border"
          style={{ background: accent }}
        >
          <Icon className="h-6 w-6 text-black" />
        </div>
        <div>
          <div className="font-heading text-3xl leading-none">{value}</div>
          <div className="mt-1 text-xs font-heading uppercase tracking-widest text-text/60">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function trafficRemaining(u: User): string {
  if (u.data_limit <= 0) return "Unlimited";
  const remaining = Math.max(0, u.data_limit - u.total);
  return formatBytes(remaining);
}

export default function UsersPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);
  const [menuFor, setMenuFor] = React.useState<number | null>(null);

  const { data } = useQuery<{ users: User[]; summary: UserSummary }>({
    queryKey: ["users"],
    queryFn: api.users,
    refetchInterval: 5000,
  });
  const { data: inbounds = [] } = useQuery<Inbound[]>({
    queryKey: ["inbounds"],
    queryFn: api.inbounds,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] });

  const createMut = useMutation({
    mutationFn: (v: UserFormValues) => api.createUser(v),
    onSuccess: () => {
      toast.push("success", "User created");
      setFormOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, v }: { id: number; v: UserFormValues }) => api.updateUser(id, v),
    onSuccess: () => {
      toast.push("success", "User updated");
      setFormOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      api.toggleUser(id, enabled),
    onSuccess: invalidate,
    onError: (e: Error) => toast.push("error", e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => {
      toast.push("success", "User deleted");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const resetMut = useMutation({
    mutationFn: (id: number) => api.resetTraffic(id),
    onSuccess: () => {
      toast.push("success", "Traffic reset");
      invalidate();
    },
  });

  const rotateMut = useMutation({
    mutationFn: (id: number) => api.rotateToken(id),
    onSuccess: () => {
      toast.push("success", "Subscription token rotated");
      invalidate();
    },
  });

  const users = data?.users ?? [];
  const summary = data?.summary ?? { clients: 0, online: 0, active: 0, depleting: 0 };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setFormOpen(true);
    setMenuFor(null);
  };

  const copySubLink = (u: User) => {
    const url = `${window.location.origin}/sub/${u.sub_token}`;
    void navigator.clipboard.writeText(url);
    toast.push("success", "Subscription link copied");
    setMenuFor(null);
  };

  const inboundName = (id: number) => inbounds.find((i) => i.id === id)?.tag || `#${id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Users</h1>
          <p className="text-sm font-base text-text/60">Manage clients and their subscriptions</p>
        </div>
        <Button onClick={openNew}>
          <UserPlus className="h-4 w-4" />
          New User
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Users2} label="Clients" value={summary.clients} accent="#a3e635" />
        <SummaryCard icon={Wifi} label="Online" value={summary.online} accent="#7dd3fc" />
        <SummaryCard icon={ShieldCheck} label="Active" value={summary.active} accent="#86efac" />
        <SummaryCard
          icon={BatteryWarning}
          label="Depleting"
          value={summary.depleting}
          accent="#fda4af"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actions</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Online</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Attached inbounds</TableHead>
                <TableHead>Traffic</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-text/50">
                    No users yet. Click “New User” to create one.
                  </TableCell>
                </TableRow>
              )}
              {users.map((u) => {
                const usagePct =
                  u.data_limit > 0 ? Math.min(100, (u.total / u.data_limit) * 100) : 0;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="relative flex items-center gap-1">
                        <Button
                          variant="neutral"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(u)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="neutral"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copySubLink(u)}
                          title="Copy sub link"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="neutral"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setMenuFor(menuFor === u.id ? null : u.id)}
                          title="More"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                        {menuFor === u.id && (
                          <div className="absolute left-0 top-9 z-20 w-48 rounded-base border-2 border-border bg-bw p-1 neo-shadow animate-pop-in">
                            <MenuButton
                              icon={Copy}
                              label="Copy sub link"
                              onClick={() => copySubLink(u)}
                            />
                            <MenuButton
                              icon={Server}
                              label="Open sub page"
                              onClick={() => {
                                window.open(`/sub/${u.sub_token}/view`, "_blank");
                                setMenuFor(null);
                              }}
                            />
                            <MenuButton
                              icon={RotateCcw}
                              label="Reset traffic"
                              onClick={() => {
                                resetMut.mutate(u.id);
                                setMenuFor(null);
                              }}
                            />
                            <MenuButton
                              icon={RefreshCw}
                              label="Rotate sub token"
                              onClick={() => {
                                rotateMut.mutate(u.id);
                                setMenuFor(null);
                              }}
                            />
                            <MenuButton
                              icon={Trash2}
                              label="Delete"
                              danger
                              onClick={() => {
                                setDeleteTarget(u);
                                setMenuFor(null);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={!!u.enabled}
                        onCheckedChange={(v) => toggleMut.mutate({ id: u.id, enabled: v })}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-block h-3 w-3 rounded-full border-2 border-border",
                          u.online ? "bg-lime-400" : "bg-zinc-500",
                        )}
                        title={u.online ? "online" : "offline"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-heading">{u.email}</div>
                      {u.comment && (
                        <div className="text-xs text-text/50">{u.comment}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[200px] flex-wrap gap-1">
                        {u.inbound_ids.length === 0 && (
                          <span className="text-xs text-text/40">none</span>
                        )}
                        {u.inbound_ids.slice(0, 3).map((id) => (
                          <Badge key={id} variant="neutral" className="text-[10px]">
                            {inboundName(id)}
                          </Badge>
                        ))}
                        {u.inbound_ids.length > 3 && (
                          <Badge variant="info" className="text-[10px]">
                            +{u.inbound_ids.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[130px] space-y-1">
                        <div className="text-xs font-base text-text/70">
                          {formatBytes(u.total)}
                          {u.data_limit > 0 && ` / ${formatBytes(u.data_limit)}`}
                        </div>
                        {u.data_limit > 0 && (
                          <Progress value={usagePct} className="h-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs font-base">
                        <span className="text-lime-500">↓ {formatBytes(u.down)}</span>
                        <span className="text-sky-400">↑ {formatBytes(u.up)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-base">
                      {trafficRemaining(u)}
                      {u.expire_at && (
                        <div className="text-xs text-text/50">{relativeTime(u.expire_at)}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-base">
                      {durationSince(u.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        inbounds={inbounds}
        editing={editing}
        onSubmit={async (v) => {
          if (editing) await updateMut.mutateAsync({ id: editing.id, v });
          else await createMut.mutateAsync(v);
        }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
          </DialogHeader>
          <p className="text-sm font-base text-text/70">
            Are you sure you want to delete{" "}
            <span className="font-heading text-text">{deleteTarget?.email}</span>? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="neutral" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-sm font-base transition-colors",
        danger ? "text-red-400 hover:bg-red-400/10" : "hover:bg-main/15",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
