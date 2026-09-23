import * as React from "react";
import { Github, Star, Tag, Languages } from "lucide-react";
import { RailLogo } from "@/components/rail-logo";
import { AnimatedBackground } from "@/components/animated-background";
import { useGitHubStars } from "@/components/github-button";
import { useToast } from "@/components/ui/toast";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { GITHUB_URL, GITHUB_REPO, PANEL_VERSION } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Shared shell for the Setup and Login pages. Renders the animated background,
 * a floating brand mark, the GitHub / version / language controls and an
 * optional marketing side panel. Fully responsive: the side panel collapses
 * on mobile while the form card stays centred.
 */
export function AuthLayout({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const { lang, setLang, t } = useI18n();
  const toast = useToast();
  const stars = useGitHubStars();

  const changeLang = (l: Lang) => {
    if (l === lang) return;
    setLang(l);
    toast.push("success", t("languageChanged"));
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <AnimatedBackground />

      <div
        className={cn(
          "relative grid w-full items-center gap-6",
          aside ? "max-w-4xl lg:grid-cols-2" : "max-w-md",
        )}
      >
        {aside && <div className="hidden lg:block">{aside}</div>}

        <div className="flex w-full flex-col gap-4">
          {children}

          <div className="flex flex-col gap-2 animate-slide-up" style={{ animationDelay: "160ms" }}>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 rounded-base border-2 border-border bg-bw/70 px-3 py-2 font-heading text-xs text-text/80 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-main hover:text-mtext hover:neo-shadow"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <Github className="h-4 w-4 shrink-0" />
                  <span className="truncate">{GITHUB_REPO}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-[4px] border-2 border-border bg-main px-1.5 text-mtext">
                  <Star className="h-3 w-3" fill="currentColor" />
                  {stars ?? 0}
                </span>
              </a>
              <a
                href={`${GITHUB_URL}/releases`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 rounded-base border-2 border-border bg-bw/70 px-3 py-2 font-heading text-xs text-text/80 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-main hover:text-mtext hover:neo-shadow"
              >
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span className="truncate">v{PANEL_VERSION}</span>
                </span>
              </a>
            </div>

            <div className="flex items-center gap-1 rounded-base border-2 border-border bg-bw/70 p-1 backdrop-blur">
              <Languages className="ml-1 h-4 w-4 shrink-0 text-text/50" />
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => changeLang(l.code)}
                  className={cn(
                    "flex-1 rounded-[4px] px-1 py-1.5 text-xs font-heading transition-colors",
                    lang === l.code ? "bg-main text-mtext" : "hover:bg-main/15",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthBrandMark() {
  return (
    <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow animate-float">
      <span className="absolute -inset-1 -z-10 rounded-base bg-main/40 blur-md" />
      <RailLogo className="h-9 w-9" />
    </div>
  );
}
