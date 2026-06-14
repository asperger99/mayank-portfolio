import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronDown, MapPin, Calendar, CheckCircle2, Briefcase } from "lucide-react";
import { experiences } from "../../data/experience";
import { cn } from "../../lib/utils";

// Per-company color accent — same bento language as Skills
const COMPANY_ACCENT: Record<string, {
  border: string;
  dot: string;
  bg: string;
  badge: string;
  chip: string;
  check: string;
  company: string;
  glow: string;
}> = {
  "Coursefinder.ai": {
    border:  "border-emerald-500/30",
    dot:     "bg-emerald-400",
    bg:      "from-emerald-500/8 to-transparent",
    badge:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    chip:    "hover:border-emerald-500/50 hover:text-emerald-700 hover:bg-emerald-500/10 dark:hover:border-emerald-400/60 dark:hover:text-emerald-300",
    check:   "text-emerald-600 dark:text-emerald-400",
    company: "text-emerald-600 dark:text-emerald-400",
    glow:    "ring-emerald-500/20",
  },
  "JPMorgan Chase & Co.": {
    border:  "border-amber-500/30",
    dot:     "bg-amber-400",
    bg:      "from-amber-500/8 to-transparent",
    badge:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
    chip:    "hover:border-amber-500/50 hover:text-amber-700 hover:bg-amber-500/10 dark:hover:border-amber-400/60 dark:hover:text-amber-300",
    check:   "text-amber-600 dark:text-amber-400",
    company: "text-amber-600 dark:text-amber-400",
    glow:    "ring-amber-500/20",
  },
};

const fallback = COMPANY_ACCENT["JPMorgan Chase & Co."];

export function Experience() {
  const [expanded, setExpanded] = useState<string | null>("coursefinder");
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="experience" className="section-padding bg-muted/20">
      <div className="container-max" ref={ref}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            <Briefcase size={12} />
            Work Experience
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Where I've <span className="gradient-text">shipped</span>
          </h2>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          {/* Timeline spine */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/50 via-border/60 to-transparent hidden sm:block" />

          <div className="space-y-5">
            {experiences.map((exp, i) => {
              const accent = COMPANY_ACCENT[exp.company] ?? fallback;
              const isOpen = expanded === exp.id;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -28 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative sm:pl-16"
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-3.5 top-6 w-5 h-5 rounded-full border-2 bg-background hidden sm:flex items-center justify-center -translate-x-1/2 transition-colors duration-300",
                    isOpen ? accent.border : "border-border"
                  )}>
                    {exp.current && (
                      <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse-slow", accent.dot)} />
                    )}
                  </div>

                  {/* Card */}
                  <div className={cn(
                    "relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden",
                    "transition-all duration-300 ring-1 ring-inset",
                    isOpen ? accent.border : "border-border/60",
                    isOpen ? accent.glow : "ring-transparent"
                  )}>
                    {/* Gradient wash */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br pointer-events-none transition-opacity duration-300",
                      accent.bg,
                      isOpen ? "opacity-100" : "opacity-40"
                    )} />

                    {/* Watermark icon */}
                    <Briefcase
                      size={110}
                      className="absolute -bottom-3 -right-3 opacity-[0.03] pointer-events-none text-foreground"
                    />

                    {/* Clickable header */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : exp.id)}
                      className="relative z-10 w-full text-left p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", accent.dot)} />
                            <h3 className="text-base font-semibold text-foreground">
                              {exp.role}
                            </h3>
                            {exp.current && (
                              <span className={cn("px-2 py-0.5 text-xs rounded-full border font-medium", accent.badge)}>
                                Current
                              </span>
                            )}
                          </div>
                          <p className={cn("font-medium text-sm", accent.company)}>
                            {exp.company}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} /> {exp.period}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {exp.location}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          size={18}
                          className={cn(
                            "text-muted-foreground flex-shrink-0 mt-1 transition-transform duration-300",
                            isOpen && "rotate-180"
                          )}
                        />
                      </div>

                      {/* Tech chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {exp.tech.slice(0, 5).map((t, ti) => (
                          <motion.span
                            key={t}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.12 + ti * 0.04 + 0.2 }}
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                              "border border-border/60 bg-background/50 text-muted-foreground",
                              "transition-all duration-200",
                              accent.chip
                            )}
                          >
                            {t}
                          </motion.span>
                        ))}
                        {exp.tech.length > 5 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-border/60 bg-background/50 text-muted-foreground">
                            +{exp.tech.length - 5}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded bullets */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <div className="relative z-10 px-6 pb-6 border-t border-border/40 pt-4">
                            <ul className="space-y-3">
                              {exp.description.map((item, di) => (
                                <motion.li
                                  key={di}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.25, delay: di * 0.06 }}
                                  className="flex items-start gap-3"
                                >
                                  <CheckCircle2
                                    size={15}
                                    className={cn("flex-shrink-0 mt-0.5", accent.check)}
                                  />
                                  <span className="text-sm text-muted-foreground leading-relaxed">
                                    {item}
                                  </span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
