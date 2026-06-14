import { NetworkGraph } from "../ui/NetworkGraph";

// ── TEMPORARY comparison section — delete after choosing a style ─────────────

export function PhotoVariants() {
  return (
    <section className="section-padding bg-background border-t border-border/40">
      <div className="container-max">
        <p className="text-center text-xs font-mono text-muted-foreground/60 mb-12 tracking-widest uppercase">
          Photo style comparison — pick one
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">

          {/* ── 1: Current small circle (already in hero) ─────────────── */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase">
              1 · Current circle
            </span>
            <div className="flex items-center justify-center h-48">
              <div className="relative inline-flex">
                <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl scale-125 pointer-events-none" />
                <div className="relative w-28 h-28 rounded-full p-[2.5px] bg-gradient-to-br from-brand-400 via-cyan-400 to-brand-600">
                  <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-background">
                    <img
                      src="/avatar.jpg"
                      alt="Mayank Singh"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Small circle above name.<br />Clean, familiar.
            </p>
          </div>

          {/* ── 2: Portrait card with floating chips ──────────────────── */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase">
              2 · Portrait card
            </span>
            <div className="relative w-52">
              {/* Floating chips */}
              <div className="absolute -left-6 top-8 z-10 px-2.5 py-1 rounded-full bg-card border border-border/60 text-[10px] font-medium text-muted-foreground shadow-sm">
                C# / .NET
              </div>
              <div className="absolute -right-6 top-16 z-10 px-2.5 py-1 rounded-full bg-card border border-brand-500/30 text-[10px] font-medium text-brand-400">
                Redis
              </div>
              <div className="absolute -left-4 bottom-16 z-10 px-2.5 py-1 rounded-full bg-card border border-border/60 text-[10px] font-medium text-muted-foreground">
                PostgreSQL
              </div>
              <div className="absolute -right-5 bottom-10 z-10 px-2.5 py-1 rounded-full bg-card border border-emerald-500/30 text-[10px] font-medium text-emerald-400">
                AWS
              </div>

              {/* Card */}
              <div className="relative rounded-2xl overflow-hidden border border-border/60 ring-1 ring-inset ring-brand-500/10">
                <img
                  src="/avatar.jpg"
                  alt="Mayank Singh"
                  className="w-full aspect-[3/4] object-cover object-top"
                />
                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-foreground">Mayank Singh</p>
                  <p className="text-xs text-brand-400">Sr. Software Engineer</p>
                </div>
                {/* Corner accent */}
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-brand-500/60 rounded-tr-sm" />
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-brand-500/60 rounded-tl-sm" />
              </div>

              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-brand-500/8 blur-2xl -z-10 scale-110" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Portrait with floating tech chips<br />and corner decorations.
            </p>
          </div>

          {/* ── 3: Edge-fade / bleed ──────────────────────────────────── */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase">
              3 · Edge-fade bleed
            </span>
            <div className="relative w-52 h-48 rounded-2xl overflow-hidden border border-border/40">
              <img
                src="/avatar.jpg"
                alt="Mayank Singh"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Left-to-right fade mask */}
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
              {/* Bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              {/* Text overlay */}
              <div className="absolute bottom-4 left-4">
                <p className="text-xs font-semibold text-foreground">Mayank Singh</p>
                <p className="text-[10px] text-brand-400">Sr. Engineer</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Photo bleeds into background.<br />Dark photo = seamless blend.
            </p>
          </div>

          {/* ── 4: Photo card + NetworkGraph stacked ─────────────────── */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase">
              4 · Photo + network
            </span>
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Small photo card */}
              <div className="relative w-full rounded-xl overflow-hidden border border-border/60">
                <img
                  src="/avatar.jpg"
                  alt="Mayank Singh"
                  className="w-full h-28 object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Available</span>
                </div>
              </div>
              {/* Network graph */}
              <NetworkGraph size={160} />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Photo banner + network graph<br />stacked in right column.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
