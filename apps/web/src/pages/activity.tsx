import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ScrollText,
  Trash2,
  LogIn,
  UserPlus,
  UserCog,
  UserX,
  Power,
  Settings2,
  KeyRound,
  Download,
  Upload,
  Router,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ActivityEntry } from "@/lib/types";

const actionMeta: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  login: { icon: LogIn, label: "Signed in", color: "info" },
  login_failed: { icon: ShieldAlert, label: "Failed login", color: "danger" },
  setup: { icon: Power, label: "Setup", color: "success" },
  user_create: { icon: UserPlus, label: "Created user", color: "success" },
  user_update: { icon: UserCog, label: "Updated user", color: "info" },
  user_delete: { icon: UserX, label: "Deleted user", color: "danger" },
  user_toggle: { icon: Power, label: "Toggled user", color: "warning" },
  user_reset_traffic: { icon: Router, label: "Reset traffic", color: "warning" },
  user_rotate_token: { icon: KeyRound, label: "Rotated token", color: "warning" },
  inbound_toggle: { icon: Router, label: "Toggled inbound", color: "warning" },
  settings_update: { icon: Settings2, label: "Updated settings", color: "info" },
  credentials_change: { icon: KeyRound, label: "Changed credentials", color: "warning" },
  backup_export: { icon: Download, label: "Exported backup", color: "info" },
  backup_import: { icon: Upload, label: "Imported backup", color: "warning" },
  activity_clear: { icon: Trash2, label: "Cleared log", color: "danger" },
};

export default function ActivityPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data: entries = [] } = useQuery<ActivityEntry[]>({
    queryKey: ["activity"],
    queryFn: api.activity,
    refetchInterval: 8000,
  });

  const clearMut = useMutation({
    mutationFn: () => api.clearActivity(),
    onSuccess: () => {
      toast.push("success", "Activity log cleared");
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Activity Log</h1>
          <p className="text-sm font-base text-text/60">Recent administrative events</p>
        </div>
        <Button variant="danger" onClick={() => clearMut.mutate()} disabled={entries.length === 0}>
          <Trash2 className="h-4 w-4" />
          Clear log
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-text/50">
              <ScrollText className="h-10 w-10" />
              <p className="font-heading">No activity recorded yet</p>
            </div>
          ) : (
            <ul className="divide-y-2 divide-border/30">
              {entries.map((e) => {
                const meta = actionMeta[e.action] || {
                  icon: ScrollText,
                  label: e.action,
                  color: "neutral",
                };
                const Icon = meta.icon;
                return (
                  <li key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-base border-2 border-border bg-bg">
                      <Icon className="h-5 w-5 text-text/80" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading">{meta.label}</span>
                        {e.detail && (
                          <Badge variant={meta.color as never} className="text-[10px]">
                            {e.detail}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs font-base text-text/50">by {e.actor}</div>
                    </div>
                    <div className="whitespace-nowrap text-xs font-base text-text/50">
                      {formatDate(e.ts)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
