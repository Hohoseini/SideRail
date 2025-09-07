import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      toast.push("error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 grid-dots" />
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-main/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <Card className="relative w-full max-w-md animate-pop-in">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow">
            <Zap className="h-7 w-7" fill="currentColor" />
          </div>
          <h1 className="font-heading text-2xl">Welcome back</h1>
          <p className="text-sm font-base text-text/60">Sign in to your SideRail panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
