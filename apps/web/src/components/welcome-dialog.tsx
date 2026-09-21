import * as React from "react";
import { Heart, Star, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RailLogo } from "@/components/rail-logo";
import { GITHUB_URL, PANEL_VERSION } from "@/lib/brand";

const STORAGE_KEY = "sr_welcome_seen_v1";

export function WelcomeDialog() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "1") {
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
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

        <div className="space-y-4 text-center">
          <p className="text-sm font-base text-text/70">
            This panel is crafted with care by <span className="font-heading text-text">icubaby</span>{" "}
            and shared with the community <span className="font-heading text-text">completely free</span>.
          </p>

          <div className="flex items-start gap-3 rounded-base border-2 border-border bg-red-300/20 p-3 text-left">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm font-base text-text/80">
              Please <span className="font-heading">do not sell</span> this panel or its configs.
              Keep it free and keep the attribution intact — that's all I ask.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-base border-2 border-border bg-main/15 p-3 text-left">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-main" fill="currentColor" />
            <p className="text-sm font-base text-text/80">
              If SideRail makes your life easier, a <span className="font-heading">GitHub star</span>{" "}
              means the world and keeps the project alive.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="neutral" className="flex-1" onClick={close}>
              Maybe later
            </Button>
            <Button
              className="flex-1"
              asChild
              onClick={close}
            >
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                <Star className="h-4 w-4" fill="currentColor" />
                Star on GitHub
              </a>
            </Button>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-text/40">
            SideRail v{PANEL_VERSION}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
