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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { Infinity as InfinityIcon } from "lucide-react";
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
      <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-base border-2 border-border sm:h-12 sm:w-12"
          style={{ background: accent }}
        >
          <Icon className="h-5 w-5 text-black sm:h-6 sm:w-6" />
        </div>
        <div>
          <div className="font-heading text-2xl leading-none sm:text-3xl">{value}</div>
          <div className="mt-1 text-[10px] font-heading uppercase tracking-widest text-text/60 sm:text-xs">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrafficBar({ user }: { user: User }) {
  const usagePct = user.data_limit > 0 ? Math.min(100, (user.total / user.data_limit) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs font-base text-text/70">
        <span className="font-heading text-text/90">{formatBytes(user.total)}</span>
        {user.data_limit > 0 && <span>{formatBytes(user.data_limit)}</span>}
      </div>
      <Progress
        value={user.data_limit > 0 ? usagePct : 100}
        className="h-2"
        indicatorClassName={
          usagePct > 90 ? "bg-red-400" : usagePct > 70 ? "bg-yellow-400" : "bg-main"
        }
      />
      <div className="flex items-center gap-3 text-[11px] font-base">
        <span className="text-lime-500">↓ {formatBytes(user.down)}</span>
        <span className="text-sky-400">↑ {formatBytes(user.up)}</span>
      </div>
    </div>
  );
}

function OnlineDot({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full border-2 border-border",
          online ? "animate-pulse bg-lime-400" : "bg-zinc-500",
        )}
      />
      <span className="text-xs font-base text-text/60">{online ? "Online" : "Offline"}</span>
    </span>
  );
}

export default function UsersPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);

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
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => api.toggleUser(id, enabled),
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
  };

  const copySubLink = (u: User) => {
    const url = `${window.location.origin}/sub/${u.sub_token}`;
    void navigator.clipboard.writeText(url);
    toast.push("success", "Subscription link copied");
  };

  const inboundName = (id: number) => inbounds.find((i) => i.id === id)?.tag || `#${id}`;

  const rowActions = (u: User) => (
    <div className="flex items-center gap-1">
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="neutral" size="icon" className="h-8 w-8" title="More">
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => copySubLink(u)}>
            <Copy className="h-4 w-4" />
            Copy sub link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(`/sub/${u.sub_token}`, "_blank")}>
            <Server className="h-4 w-4" />
            Open sub page
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => resetMut.mutate(u.id)}>
            <RotateCcw className="h-4 w-4" />
            Reset traffic
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => rotateMut.mutate(u.id)}>
            <RefreshCw className="h-4 w-4" />
            Rotate sub token
          </DropdownMenuItem>
          <DropdownMenuItem danger onClick={() => setDeleteTarget(u)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const inboundBadges = (u: User) => (
    <div className="flex flex-wrap gap-1">
      {u.inbound_ids.length === 0 && <span className="text-xs text-text/40">none</span>}
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
  );

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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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

      {users.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-text/50">
            No users yet. Click “New User” to create one.
          </CardContent>
        </Card>
      )}

      <div className="hidden lg:block">
        {users.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Actions</TableHead>
                    <TableHead className="text-center">Enabled</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-center">Inbounds</TableHead>
                    <TableHead className="min-w-[180px]">Traffic</TableHead>
                    <TableHead className="text-center">Remaining</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex justify-center">{rowActions(u)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Switch
                            checked={!!u.enabled}
                            onCheckedChange={(v) => toggleMut.mutate({ id: u.id, enabled: v })}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <OnlineDot online={u.online} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-heading">{u.email}</div>
                        {u.comment && <div className="text-xs text-text/50">{u.comment}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">{inboundBadges(u)}</div>
                      </TableCell>
                      <TableCell>
                        <TrafficBar user={u} />
                      </TableCell>
                      <TableCell className="text-center text-sm font-base">
                        <div className="flex flex-col items-center">
                          {u.data_limit <= 0 ? (
                            <InfinityIcon className="h-4 w-4 text-text/60" />
                          ) : (
                            formatBytes(Math.max(0, u.data_limit - u.total))
                          )}
                          {u.expire_at && (
                            <div className="text-xs text-text/50">{relativeTime(u.expire_at)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm font-base">
                        <div className="flex justify-center">
                          {u.expire_at ? (
                            durationSince(u.created_at)
                          ) : (
                            <InfinityIcon className="h-4 w-4 text-text/60" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-3 lg:hidden">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-heading text-lg">{u.email}</div>
                  {u.comment && <div className="truncate text-xs text-text/50">{u.comment}</div>}
                  <div className="mt-1">
                    <OnlineDot online={u.online} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!u.enabled}
                    onCheckedChange={(v) => toggleMut.mutate({ id: u.id, enabled: v })}
                  />
                  {rowActions(u)}
                </div>
              </div>

              {inboundBadges(u)}
              <TrafficBar user={u} />

              <div className="flex items-center justify-between border-t-2 border-border/30 pt-2 text-xs font-base text-text/60">
                <span className="flex items-center gap-1">
                  {u.data_limit <= 0 ? (
                    <>
                      <InfinityIcon className="h-3.5 w-3.5" /> left
                    </>
                  ) : (
                    `${formatBytes(Math.max(0, u.data_limit - u.total))} left`
                  )}
                </span>
                <span className="flex items-center gap-1">
                  {u.expire_at ? (
                    relativeTime(u.expire_at)
                  ) : (
                    <InfinityIcon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span>{durationSince(u.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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


