import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ArrowUpRight,
  GitBranch,
  TrendingUp,
  Code2,
  FolderOpen,
  CheckCircle2,
  Layers,
  Lightbulb,
  Cpu,
} from "lucide-react";
import { projects } from "../../data/projects";
import { cn } from "../../lib/utils";

// Per-project accent — keyed by project.id
const PROJECT_ACCENT: Record<string, {
  border: string;
  dot: string;
  bg: string;
  badge: string;
  chip: string;
  check: string;
  metric: string;
  metricIcon: string;
  glow: string;
}> = {
  "api-rate-limiter": {
    border:     "border-emerald-500/30",
    dot:        "bg-emerald-400",
    bg:         "from-emerald-500/8 via-teal-500/4 to-transparent",
    badge:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    chip:       "hover:border-emerald-500/50 hover:text-emerald-700 hover:bg-emerald-500/10 dark:hover:border-emerald-400/60 dark:hover:text-emerald-300",
    check:      "text-emerald-400",
    metric:     "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    metricIcon: "text-emerald-400",
    glow:       "ring-emerald-500/20",
  },
};

const FALLBACK_ACCENT = PROJECT_ACCENT["api-rate-limiter"];

const CASE_STUDY_SECTIONS = [
  { key: "problem",      label: "Problem",      Icon: Lightbulb },
  { key: "solution",     label: "Solution",     Icon: Cpu       },
  { key: "architecture", label: "Architecture", Icon: Layers    },
] as const;

export function Projects() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="projects" className="section-padding">
      <div className="container-max" ref={ref}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            <FolderOpen size={12} />
            Personal Projects
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Things I've <span className="gradient-text">built</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Tools and systems built outside of employment
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {projects.map((project, i) => {
              const accent = PROJECT_ACCENT[project.id] ?? FALLBACK_ACCENT;
              const isOpen = false;
              // Featured solo project spans full width
              const spanFull = project.featured && projects.length === 1;

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className={cn(spanFull && "lg:col-span-2 max-w-3xl mx-auto w-full")}
                >
                  <div className={cn(
                    "relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden",
                    "transition-all duration-300 ring-1 ring-inset group",
                    isOpen ? accent.border : "border-border/60 hover:" + accent.border.split(" ")[0],
                    isOpen ? accent.glow : "ring-transparent hover:" + accent.glow.split(" ")[0],
                  )}>

                    {/* Gradient wash */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br pointer-events-none transition-opacity duration-300",
                      accent.bg,
                      isOpen ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                    )} />

                    {/* Watermark icon */}
                    <Code2
                      size={140}
                      className="absolute -bottom-5 -right-5 opacity-[0.03] pointer-events-none text-foreground"
                    />

                    <div className="relative z-10 p-6">

                      {/* Top meta row */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", accent.dot)} />
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                            {project.category}
                          </span>
                          {/* {project.featured && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", accent.badge)}>
                              Featured
                            </span>
                          )} */}
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
                                "border border-border/60 bg-background/50 text-muted-foreground",
                                "hover:border-border hover:text-foreground transition-all duration-200"
                              )}
                            >
                              <GitBranch size={12} />
                              GitHub
                            </a>
                          )}
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
                                "border bg-background/50 transition-all duration-200",
                                accent.badge
                              )}
                            >
                              Live
                              <ArrowUpRight size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Title + tagline */}
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 mb-3 font-mono">
                        {project.tagline}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        {project.description}
                      </p>

                      {/* Metrics */}
                      {project.metrics.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                          {project.metrics.slice(0, 4).map((m, mi) => (
                            <motion.div
                              key={m.label}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={inView ? { opacity: 1, scale: 1 } : {}}
                              transition={{ duration: 0.3, delay: i * 0.08 + mi * 0.06 + 0.2 }}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-xl border",
                                accent.metric
                              )}
                            >
                              <TrendingUp size={12} className={accent.metricIcon} />
                              <div>
                                <div className="text-xs font-bold font-mono">{m.value}</div>
                                <div className="text-[10px] opacity-70 leading-tight">{m.label}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Tech chips */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.tech.map((t, ti) => (
                          <motion.span
                            key={t}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.08 + ti * 0.04 + 0.15 }}
                            className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
                              "border border-border/60 bg-background/50 text-muted-foreground",
                              "transition-all duration-200 cursor-default select-none",
                              accent.chip
                            )}
                          >
                            {t}
                          </motion.span>
                        ))}
                      </div>

                      {/* Case study toggle */}
                      {/* <button
                        onClick={() => setExpandedId(isOpen ? null : project.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
                          "border transition-all duration-200",
                          isOpen
                            ? cn(accent.badge, "border-current")
                            : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        <Zap size={11} className={isOpen ? "" : "opacity-60"} />
                        {isOpen ? "Hide case study" : "View case study"}
                      </button> */}

                      {/* Expanded case study */}
                      <AnimatePresence>
                        {false && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 mt-4 border-t border-border/40 space-y-5">

                              {/* Problem / Solution / Architecture */}
                              {CASE_STUDY_SECTIONS.map(({ key, label, Icon }, si) => (
                                <motion.div
                                  key={key}
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.25, delay: si * 0.07 }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon size={13} className={accent.check} />
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                      {label}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                                    {key === "problem" ? project.problem : key === "solution" ? project.solution : project.architecture}
                                  </p>
                                </motion.div>
                              ))}

                              {/* Impact */}
                              {project.impact.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.25, delay: 0.21 }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={13} className={accent.check} />
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                      Impact
                                    </h4>
                                  </div>
                                  <ul className="space-y-2 pl-5">
                                    {project.impact.map((item, ii) => (
                                      <motion.li
                                        key={ii}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: 0.21 + ii * 0.06 }}
                                        className="flex items-start gap-2 text-xs text-muted-foreground"
                                      >
                                        <CheckCircle2 size={12} className={cn("flex-shrink-0 mt-0.5", accent.check)} />
                                        {item}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
