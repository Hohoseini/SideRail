import * as React from "react";
import { Heart, Star, ShieldAlert, Github } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RailLogo } from "@/components/rail-logo";
import { useGitHubStars } from "@/components/github-button";
import { GITHUB_URL } from "@/lib/brand";

const STORAGE_KEY = "sr_welcome_seen_session";

export function WelcomeDialog() {
  const [open, setOpen] = React.useState(false);
  const stars = useGitHubStars();

  React.useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) !== "1") {
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? close() : setOpen(o))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow animate-float">
            <RailLogo className="h-9 w-9" />
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to SideRail</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-sm font-base text-text/70">
            This panel is crafted with care by{" "}
            <span className="font-heading text-text">icubaby</span> and shared{" "}
            <span className="font-heading text-text">completely free</span>.
          </p>

          <div className="flex items-start gap-3 rounded-base border-2 border-border bg-red-300/20 p-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm font-base text-text/80">
              Please <span className="font-heading">do not sell</span> this panel or its configs.
              Keep it free and keep the attribution intact.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-base border-2 border-border bg-main/15 p-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-main" fill="currentColor" />
            <p className="text-sm font-base text-text/80">
              If you enjoy the project, a <span className="font-heading">star</span> would mean a
              lot and keeps it alive.
            </p>
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="flex items-center justify-between gap-2 rounded-base border-2 border-border bg-bw px-3 py-2.5 font-heading text-sm text-text transition-all hover:bg-main hover:text-mtext hover:neo-shadow"
          >
            <span className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Star on GitHub
            </span>
            <span className="flex items-center gap-1 rounded-[4px] border-2 border-border bg-main px-1.5 text-xs text-mtext">
              <Star className="h-3 w-3" fill="currentColor" />
              {stars ?? 0}
            </span>
          </a>

          <Button variant="neutral" className="w-full" onClick={close}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
