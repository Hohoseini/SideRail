import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Rocket, Zap, Globe2, Server } from "lucide-react";
import { RailLogo } from "@/components/rail-logo";
import { AnimatedBackground } from "@/components/animated-background";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const FEATURES = [
  { icon: Rocket, text: "One-click Railway deployment" },
  { icon: Globe2, text: "VLESS · VMess · Trojan over WS / XHTTP / HTTPUpgrade" },
  { icon: ShieldCheck, text: "TLS terminated at the edge on port 443" },
  { icon: Server, text: "Beautiful subscription pages with live usage" },
];

export default function SetupPage() {
  const { setup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("owner");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      toast.push("error", "Username must be at least 3 characters");
      return;
    }
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
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AnimatedBackground />

      <div className="relative grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <div className="hidden flex-col justify-center gap-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow animate-float">
              <RailLogo className="h-8 w-8" />
            </div>
            <div>
              <div className="font-heading text-4xl tracking-tight">SideRail</div>
              <div className="text-sm text-text/60">Xray-core management panel</div>
            </div>
          </div>
          <ul className="space-y-3">
            {FEATURES.map((f, i) => (
              <li
                key={f.text}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-base border-2 border-border bg-bw">
                  <f.icon className="h-4 w-4 text-main" />
                </div>
                <span className="pt-1 font-base text-text/80">{f.text}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 rounded-base border-2 border-border bg-bw/60 px-3 py-2 text-xs font-base text-text/60">
            <Zap className="h-4 w-4 text-main" />
            Xray-core v26.9.9 fetched automatically on first boot
          </div>
        </div>

        <Card className="animate-pop-in">
          <CardHeader>
            <div className="mb-2 flex justify-center lg:hidden">
              <div className="grid h-16 w-16 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow animate-float">
                <RailLogo className="h-9 w-9" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-main animate-bounce" />
              <h1 className="font-heading text-2xl">First-time setup</h1>
            </div>
            <p className="text-sm font-base text-text/60">
              Create your owner account to get started.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">Owner username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
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
                  placeholder="At least 6 characters"
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
