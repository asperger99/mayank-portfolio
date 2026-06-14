import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Calendar,
  Zap,
  Database,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { metrics } from "../../data/metrics";
import { useCounter } from "../../hooks/useCounter";

const iconMap: Record<string, React.ElementType> = {
  Calendar,
  Zap,
  Database,
  DollarSign,
  TrendingDown,
  TrendingUp,
};

function MetricCard({
  metric,
  index,
  inView,
}: {
  metric: (typeof metrics)[0];
  index: number;
  inView: boolean;
}) {
  const Icon = iconMap[metric.icon] ?? Zap;
  const numericValue = parseInt(metric.value);
  const count = useCounter(numericValue, 2000, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-2xl p-6 text-center group hover:border-brand-500/30 transition-colors duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-500/20 transition-colors">
        <Icon size={22} className="text-brand-500" />
      </div>
      <div className="text-3xl font-bold text-foreground font-mono mb-1">
        {count}
        {metric.suffix}
      </div>
      <div className="text-sm font-medium text-foreground mb-2">
        {metric.label}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {metric.description}
      </p>
    </motion.div>
  );
}

export function Metrics() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding">
      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            Impact Metrics
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Engineering that moves{" "}
            <span className="gradient-text">the needle</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Real numbers from production systems
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
