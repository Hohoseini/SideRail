import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Router, Save, ToggleLeft, User2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Inbound } from "@/lib/types";

export default function SettingsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { username, refresh } = useAuth();

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newUsername, setNewUsername] = React.useState(username || "");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const { data: inbounds = [] } = useQuery<Inbound[]>({
    queryKey: ["inbounds"],
    queryFn: api.inbounds,
  });

  const toggleInbound = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      api.toggleInbound(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbounds"] });
      toast.push("success", "Inbound updated");
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const credMut = useMutation({
    mutationFn: () =>
      api.changeCredentials({
        currentPassword,
        newUsername: newUsername || undefined,
        newPassword: newPassword || undefined,
      }),
    onSuccess: async () => {
      toast.push("success", "Credentials updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      await refresh();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const submitCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirm) {
      toast.push("error", "New passwords do not match");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.push("error", "New password must be at least 6 characters");
      return;
    }
    credMut.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Settings</h1>
        <p className="text-sm font-base text-text/60">Manage credentials and inbounds</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">
            <User2 className="mr-1 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="inbounds">
            <Router className="mr-1 h-4 w-4" />
            Inbounds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="max-w-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-main" />
                <CardTitle>Change credentials</CardTitle>
              </div>
              <CardDescription>
                Update your admin username and password from the panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitCreds} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newUsername">Username</Label>
                  <Input
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    minLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password (leave blank to keep)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2 border-t-2 border-border/40 pt-4">
                  <Label htmlFor="currentPassword">Current password (required)</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" disabled={credMut.isPending}>
                  <Save className="h-4 w-4" />
                  {credMut.isPending ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbounds">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5 text-main" />
                <CardTitle>Default inbounds</CardTitle>
              </div>
              <CardDescription>
                Enable or disable the seeded HTTP-based inbounds. Creation is disabled by design.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {inbounds.map((ib) => (
                <div
                  key={ib.id}
                  className="flex items-center justify-between rounded-base border-2 border-border bg-bg/40 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading">{ib.tag}</span>
                      <Badge variant="neutral" className="text-[10px] uppercase">
                        {ib.protocol}
                      </Badge>
                      <Badge variant="info" className="text-[10px] uppercase">
                        {ib.transport}
                      </Badge>
                    </div>
                    <div className="mt-1 truncate text-xs font-base text-text/50">
                      port {ib.port} · {ib.path}
                    </div>
                  </div>
                  <Switch
                    checked={!!ib.enabled}
                    onCheckedChange={(v) => toggleInbound.mutate({ id: ib.id, enabled: v })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
