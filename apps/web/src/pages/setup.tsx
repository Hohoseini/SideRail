import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Rocket,
  Zap,
  Globe2,
  Server,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { RailLogo } from "@/components/rail-logo";
import { AuthLayout, AuthBrandMark } from "@/components/layout/auth-layout";
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
  const [showPass, setShowPass] = React.useState(false);
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

  const aside = (
    <div className="flex flex-col justify-center gap-8">
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="relative grid h-14 w-14 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow animate-float">
          <span className="absolute -inset-1 -z-10 rounded-base bg-main/40 blur-md" />
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
              className="flex items-start gap-3 animate-slide-up"
              style={{ animationDelay: `${120 + i * 90}ms` }}
            >
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-base border-2 border-border bg-bw">
                <Icon className="h-4 w-4 text-main" />
              </div>
              <span className="pt-1 font-base text-text/80">{text}</span>
            </li>
          );
        })}
      </ul>
      <div
        className="flex items-center gap-2 rounded-base border-2 border-border bg-bw/60 px-3 py-2 text-xs font-base text-text/60 animate-slide-up"
        style={{ animationDelay: "500ms" }}
      >
        <Zap className="h-4 w-4 text-main" />
        {t("xrayAutoFetch")}
      </div>
    </div>
  );

  return (
    <AuthLayout aside={aside}>
      <Card className="w-full animate-slide-up">
        <CardHeader>
          <div className="mb-2 flex justify-center lg:hidden">
            <AuthBrandMark />
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-main" />
            <h1 className="font-heading text-2xl tracking-tight">{t("firstSetup")}</h1>
          </div>
          <p className="text-sm font-base text-text/60">{t("createOwner")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="username">{t("ownerUsername")}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder={t("atLeast6")}
                  className="px-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 transition-colors hover:text-text"
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("confirmPassword")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
                <Input
                  id="confirm"
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("creating") : t("createAccount")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
