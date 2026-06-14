import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { GraduationCap } from "lucide-react";

export function Achievements() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="education" className="section-padding bg-muted/20">
      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            <GraduationCap size={12} />
            Education
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Academic <span className="gradient-text">Background</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-2xl mx-auto glass-card rounded-2xl p-6 overflow-hidden"
        >
          <GraduationCap
            size={110}
            className="absolute -bottom-3 -right-3 opacity-[0.035] pointer-events-none text-foreground"
          />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={22} className="text-brand-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                B.Tech in Computer Science
              </h3>
              <p className="text-sm text-brand-400 mt-0.5">
                RCC Institute of Information Technology (MAKAUT)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                June 2018 – June 2022 · Kolkata, West Bengal
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
