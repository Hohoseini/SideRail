import * as React from "react";
import { Github, Star } from "lucide-react";
import { GITHUB_URL, GITHUB_REPO } from "@/lib/brand";
import { cn } from "@/lib/utils";

let cachedStars: number | null = null;
let cachedAt = 0;

export function useGitHubStars() {
  const [stars, setStars] = React.useState<number | null>(cachedStars);

  React.useEffect(() => {
    if (cachedStars !== null && Date.now() - cachedAt < 3_600_000) {
      setStars(cachedStars);
      return;
    }
    let active = true;
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && typeof d.stargazers_count === "number") {
          cachedStars = d.stargazers_count;
          cachedAt = Date.now();
          setStars(d.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return stars;
}

export function GitHubButton({ className }: { className?: string }) {
  const stars = useGitHubStars();
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-base border-2 border-border bg-bw px-3 py-1.5 text-sm font-heading transition-all hover:bg-main hover:text-mtext hover:neo-shadow",
        className,
      )}
    >
      <Github className="h-4 w-4" />
      <span>{GITHUB_REPO}</span>
      {stars !== null && (
        <span className="flex items-center gap-1 rounded-[4px] border-2 border-border bg-main px-1.5 text-mtext">
          <Star className="h-3 w-3" fill="currentColor" />
          {stars}
        </span>
      )}
    </a>
  );
}
