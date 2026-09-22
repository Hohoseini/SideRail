import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Rocket, Zap, Globe2, Server } from "lucide-react";
import { RailLogo } from "@/components/rail-logo";
import { AnimatedBackground } from "@/components/animated-background";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const FEATURE_ICONS = [Rocket, Globe2, ShieldCheck, Server];

export default function SetupPage() {
  const { setup } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("owner");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const features = [
    t("oneClickDeploy"),
    t("protocolsFeature"),
    t("tlsFeature"),
    t("subPagesFeature"),
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      toast.push("error", t("usernameMin"));
      return;
    }
    if (password.length < 6) {
      toast.push("error", t("passwordMin"));
      return;
    }
    if (password !== confirm) {
      toast.push("error", t("passwordsMismatch"));
      return;
    }
    setLoading(true);
    try {
      await setup(username, password);
      toast.push("success", t("panelInitialized"));
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
            {features.map((text, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <li
                  key={text}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-base border-2 border-border bg-bw">
                    <Icon className="h-4 w-4 text-main" />
                  </div>
                  <span className="pt-1 font-base text-text/80">{text}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2 rounded-base border-2 border-border bg-bw/60 px-3 py-2 text-xs font-base text-text/60">
            <Zap className="h-4 w-4 text-main" />
            {t("xrayAutoFetch")}
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
              <Rocket className="h-5 w-5 text-main" />
              <h1 className="font-heading text-2xl">{t("firstSetup")}</h1>
            </div>
            <p className="text-sm font-base text-text/60">{t("createOwner")}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">{t("ownerUsername")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder={t("atLeast6")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t("confirmPassword")}</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("creating") : t("createAccount")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
