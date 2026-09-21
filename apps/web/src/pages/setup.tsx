import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Rocket } from "lucide-react";
import { RailLogo } from "@/components/rail-logo";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SetupPage() {
  const { setup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.push("error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.push("error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await setup(username, password);
      toast.push("success", "Panel initialized");
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
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <div className="hidden flex-col justify-center gap-6 lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow">
              <RailLogo className="h-6 w-6" />
            </div>
            <div>
              <div className="font-heading text-3xl">SideRail</div>
              <div className="text-sm text-text/60">Xray-core management panel</div>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              "One-click Railway deployment",
              "VLESS · VMess · Trojan over WS / XHTTP / HTTPUpgrade",
              "TLS terminated at the Railway edge on port 443",
              "Beautiful subscription pages with live usage",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-base border-2 border-border bg-bw">
                  <ShieldCheck className="h-4 w-4 text-main" />
                </div>
                <span className="font-base text-text/80">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <Card className="animate-pop-in">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-main animate-bounce" />
              <h1 className="font-heading text-2xl">First-time setup</h1>
            </div>
            <p className="text-sm font-base text-text/60">
              Create your administrator account to get started.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Admin username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  minLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
