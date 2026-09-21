export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-dots" />
      <div className="absolute -left-32 top-[-10%] h-80 w-80 rounded-full bg-main/20 blur-3xl animate-[drift1_18s_ease-in-out_infinite]" />
      <div className="absolute right-[-10%] top-1/3 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl animate-[drift2_22s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] left-1/4 h-80 w-80 rounded-full bg-fuchsia-400/15 blur-3xl animate-[drift3_26s_ease-in-out_infinite]" />
    </div>
  );
}
