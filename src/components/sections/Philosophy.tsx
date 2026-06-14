import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Lightbulb, Shield, Gauge, GitMerge, Eye, Scale } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "Reliability First",
    description:
      "A system that's 10x faster but unreliable is worth less than a slower reliable one. I design for failure modes before optimizing for the happy path.",
  },
  {
    icon: Gauge,
    title: "Measure Before Optimizing",
    description:
      "Premature optimization is the root of unnecessary complexity. I profile first, identify the actual bottleneck, then engineer a targeted solution.",
  },
  {
    icon: GitMerge,
    title: "Incremental Over Big Bang",
    description:
      "Zero-downtime migrations, dual-write strategies, and gradual traffic shifting. Large changes in small, safe steps with clear rollback paths.",
  },
  {
    icon: Eye,
    title: "Observability is Non-Negotiable",
    description:
      "If you can't measure it, you can't improve it. Correlation IDs, structured logging, P99 latency metrics — before the first deployment, not after the first incident.",
  },
  {
    icon: Scale,
    title: "Right-Sized Solutions",
    description:
      "Microservices where team autonomy justifies the overhead. Monolith when it doesn't. Kafka when you need async decoupling. Redis queue when you don't.",
  },
  {
    icon: Lightbulb,
    title: "Simple Systems Win",
    description:
      "A solution that a new engineer can understand in 10 minutes will outlast a clever one that only you can maintain. Complexity is the enemy of reliability.",
  },
];

export function Philosophy() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section className="section-padding bg-muted/20">
      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            <Lightbulb size={12} />
            Engineering Philosophy
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            How I <span className="gradient-text">think</span> about systems
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Principles that guide how I design, build, and operate production
            software.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 group hover:border-brand-500/30 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                <p.icon size={20} className="text-brand-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 text-center"
        >
          <blockquote className="text-xl font-medium text-foreground max-w-2xl mx-auto italic">
            "The goal of software engineering is not to write code — it's to
            solve problems reliably, at scale, over time."
          </blockquote>
          <p className="mt-2 text-sm text-muted-foreground">
            — Mayank Kumar Singh
          </p>
        </motion.div>
      </div>
    </section>
  );
}
