export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-dots opacity-60" />
      <div className="absolute -left-40 top-[-15%] h-[28rem] w-[28rem] rounded-full bg-main/20 blur-3xl animate-[drift1_24s_ease-in-out_infinite]" />
      <div className="absolute right-[-15%] top-1/4 h-[30rem] w-[30rem] rounded-full bg-sky-400/15 blur-3xl animate-[drift2_30s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] left-1/3 h-[26rem] w-[26rem] rounded-full bg-fuchsia-400/12 blur-3xl animate-[drift3_34s_ease-in-out_infinite]" />
      <div className="absolute left-[55%] top-[10%] h-72 w-72 rounded-full bg-lime-300/10 blur-3xl animate-[drift2_28s_ease-in-out_infinite_reverse]" />
    </div>
  );
}
