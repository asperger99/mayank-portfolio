import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Code2, Layers, Database, Cloud, Activity, GitBranch } from "lucide-react";
import { skillCategories } from "../../data/skills";
import { cn } from "../../lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Code2, Layers, Database, Cloud, Activity, GitBranch,
};

// Bento layout: which category spans extra columns on md / lg
const SPAN: Record<string, string> = {
  "Languages":                "col-span-1",
  "Frameworks":               "col-span-1 lg:col-span-2",
  "Databases":                "col-span-1",
  "Cloud & Infrastructure":   "col-span-1 lg:col-span-2",
  "Messaging & Architecture": "col-span-1 md:col-span-2 lg:col-span-2",
  "Observability":            "col-span-1",
};

// Subtle accent per category — stays within the brand palette
const ACCENT: Record<string, { bg: string; border: string; dot: string }> = {
  "Languages":                { bg: "from-brand-500/10 to-transparent",   border: "border-brand-500/25",   dot: "bg-brand-400"    },
  "Frameworks":               { bg: "from-violet-500/8 to-transparent",   border: "border-violet-500/20",  dot: "bg-violet-400"   },
  "Databases":                { bg: "from-emerald-500/8 to-transparent",  border: "border-emerald-500/20", dot: "bg-emerald-400"  },
  "Cloud & Infrastructure":   { bg: "from-amber-500/8 to-transparent",    border: "border-amber-500/20",   dot: "bg-amber-400"    },
  "Messaging & Architecture": { bg: "from-rose-500/8 to-transparent",     border: "border-rose-500/20",    dot: "bg-rose-400"     },
  "Observability":            { bg: "from-cyan-500/8 to-transparent",     border: "border-cyan-500/20",    dot: "bg-cyan-400"     },
};

const CHIP_ACCENT: Record<string, string> = {
  "Languages":                "hover:border-brand-500/50 hover:text-brand-700 hover:bg-brand-500/10 dark:hover:border-brand-400/60 dark:hover:text-brand-300",
  "Frameworks":               "hover:border-violet-500/50 hover:text-violet-700 hover:bg-violet-500/10 dark:hover:border-violet-400/60 dark:hover:text-violet-300",
  "Databases":                "hover:border-emerald-500/50 hover:text-emerald-700 hover:bg-emerald-500/10 dark:hover:border-emerald-400/60 dark:hover:text-emerald-300",
  "Cloud & Infrastructure":   "hover:border-amber-500/50 hover:text-amber-700 hover:bg-amber-500/10 dark:hover:border-amber-400/60 dark:hover:text-amber-300",
  "Messaging & Architecture": "hover:border-rose-500/50 hover:text-rose-700 hover:bg-rose-500/10 dark:hover:border-rose-400/60 dark:hover:text-rose-300",
  "Observability":            "hover:border-cyan-500/50 hover:text-cyan-700 hover:bg-cyan-500/10 dark:hover:border-cyan-400/60 dark:hover:text-cyan-300",
};

export function Skills() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="skills" className="section-padding bg-muted/20">
      <div className="container-max" ref={ref}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            Technical Skills
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            <span className="gradient-text">Tech stack</span> I work with
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-auto">
          {skillCategories.map((cat, ci) => {
            const Icon = iconMap[cat.icon] ?? Code2;
            const accent = ACCENT[cat.name] ?? ACCENT["Languages"];
            const chipHover = CHIP_ACCENT[cat.name] ?? "";
            const span = SPAN[cat.name] ?? "col-span-1";
            const isWide = span.includes("col-span-2");

            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: ci * 0.07 }}
                className={cn("relative group rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden", span, accent.border)}
                onMouseEnter={() => setHovered(cat.name)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Card gradient wash */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100 pointer-events-none", accent.bg)} />

                {/* Faint watermark icon */}
                <Icon
                  size={120}
                  className="absolute -bottom-4 -right-4 opacity-[0.035] pointer-events-none text-foreground"
                />

                <div className={cn("relative z-10 p-5", isWide && "lg:p-6")}>
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-2 h-2 rounded-full", accent.dot)} />
                      <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground/60 tabular-nums">
                      {cat.skills.length} skills
                    </span>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, si) => (
                      <motion.span
                        key={skill.name}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: ci * 0.07 + si * 0.04 + 0.15 }}
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
                          "border border-border/60 bg-background/50 text-muted-foreground",
                          "transition-all duration-200 cursor-default select-none",
                          chipHover
                        )}
                      >
                        {skill.name}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Hover glow edge */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl ring-1 ring-inset transition-opacity duration-300 pointer-events-none",
                  hovered === cat.name ? "opacity-100" : "opacity-0",
                  accent.border.replace("border-", "ring-")
                )} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
