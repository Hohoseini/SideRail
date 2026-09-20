import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const toast = useToast();
  const { username, refresh } = useAuth();

  const [newUsername, setNewUsername] = React.useState(username || "");
  const [newPassword, setNewPassword] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");

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
      await refresh();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <p className="text-sm font-base text-text/60">Manage your admin account</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-main" />
            <CardTitle>Change credentials</CardTitle>
          </div>
          <CardDescription>Update your username or password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
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
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
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
    </div>
  );
}
