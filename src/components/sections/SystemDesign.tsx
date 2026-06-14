import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { RefreshCw, Network } from "lucide-react";
import { cn } from "../../lib/utils";

const architectures = [
  {
    id: "bff",
    title: "BFF Layer Pattern",
    subtitle: "Backend For Frontend architecture used at JPMorgan Chase",
    nodes: [
      { id: "web", label: "Web Client", x: 10, y: 40, color: "brand" },
      { id: "mobile", label: "Mobile", x: 10, y: 65, color: "brand" },
      { id: "bff", label: "BFF Layer", x: 40, y: 52, color: "cyan", highlight: true },
      { id: "auth", label: "Auth Service", x: 72, y: 25, color: "violet" },
      { id: "config", label: "Config Service", x: 72, y: 52, color: "violet" },
      { id: "redis", label: "Redis Cache", x: 72, y: 78, color: "red" },
    ],
    edges: [
      { from: "web", to: "bff" },
      { from: "mobile", to: "bff" },
      { from: "bff", to: "auth" },
      { from: "bff", to: "config" },
      { from: "bff", to: "redis" },
    ],
    description:
      "The BFF aggregates calls to Auth, Config, and Cache services — returning UI-optimized payloads in 1 request instead of 8-12. Result: 40% latency reduction.",
    metrics: ["40% latency reduction", "8→2 API calls", "3 teams adopted"],
  },
  {
    id: "migration",
    title: "Dual-Write Migration",
    subtitle: "Zero-downtime Cassandra → AWS Keyspaces migration strategy",
    nodes: [
      { id: "app", label: "Application", x: 10, y: 50, color: "brand" },
      { id: "proxy", label: "Migration Proxy", x: 40, y: 50, color: "amber", highlight: true },
      { id: "cassandra", label: "Cassandra (old)", x: 72, y: 28, color: "gray" },
      { id: "keyspaces", label: "AWS Keyspaces", x: 72, y: 72, color: "cyan" },
      { id: "validator", label: "Consistency Check", x: 55, y: 12, color: "green" },
    ],
    edges: [
      { from: "app", to: "proxy" },
      { from: "proxy", to: "cassandra" },
      { from: "proxy", to: "keyspaces" },
      { from: "proxy", to: "validator" },
    ],
    description:
      "Writes go to both Cassandra and Keyspaces simultaneously. The validator checks consistency. Reads shift 10→25→50→100% to Keyspaces over 4 weeks.",
    metrics: ["25% read latency drop", "0ms downtime", "0 data loss"],
  },
  {
    id: "logging",
    title: "Async Logging Pipeline",
    subtitle: "Non-blocking distributed log infrastructure at Coursefinder.ai",
    nodes: [
      { id: "api", label: "API Layer", x: 10, y: 50, color: "brand" },
      { id: "queue", label: "Log Queue", x: 32, y: 50, color: "amber", highlight: true },
      { id: "formatter", label: "Formatter", x: 55, y: 50, color: "violet" },
      { id: "s3", label: "AWS S3", x: 78, y: 32, color: "cyan" },
      { id: "athena", label: "Athena", x: 78, y: 68, color: "green" },
    ],
    edges: [
      { from: "api", to: "queue" },
      { from: "queue", to: "formatter" },
      { from: "formatter", to: "s3" },
      { from: "formatter", to: "athena" },
    ],
    description:
      "Log calls are non-blocking — API responses don't wait for log writes. Correlation IDs flow through every step for end-to-end request tracing.",
    metrics: ["0ms log overhead", "100% E2E tracing", "~40% faster incident resolution"],
  },
];

const colorMap: Record<string, string> = {
  brand: "border-brand-500/50 bg-brand-500/10 text-brand-400",
  cyan: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  amber: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  violet: "border-violet-500/50 bg-violet-500/10 text-violet-400",
  red: "border-red-500/50 bg-red-500/10 text-red-400",
  green: "border-green-500/50 bg-green-500/10 text-green-400",
  gray: "border-border bg-muted text-muted-foreground",
};

interface EdgeCoord { x1: number; y1: number; x2: number; y2: number; }

export function SystemDesign() {
  const [active, setActive] = useState("bff");
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const arch = architectures.find((a) => a.id === active)!;

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const archRef = useRef(arch);
  archRef.current = arch;
  const [edgeCoords, setEdgeCoords] = useState<Record<string, EdgeCoord>>({});

  const recalc = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    if (!cr.width) return;
    const currentArch = archRef.current;
    const next: Record<string, EdgeCoord> = {};

    for (const edge of currentArch.edges) {
      const fromEl = nodeRefs.current[edge.from];
      const toEl = nodeRefs.current[edge.to];
      if (!fromEl || !toEl) continue;
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      if (!fr.width || !tr.width) continue;

      const fromCx = (fr.left + fr.right) / 2;
      const fromCy = (fr.top + fr.bottom) / 2;
      const toCx = (tr.left + tr.right) / 2;
      const toCy = (tr.top + tr.bottom) / 2;
      const dx = Math.abs(toCx - fromCx);
      const dy = Math.abs(toCy - fromCy);

      let px1: number, py1: number, px2: number, py2: number;
      if (dx >= dy) {
        // Horizontal: right edge of source → left edge of destination
        px1 = fr.right; py1 = fromCy;
        px2 = tr.left;  py2 = toCy;
      } else if (toCy > fromCy) {
        // Downward: bottom center → top center
        px1 = fromCx; py1 = fr.bottom;
        px2 = toCx;   py2 = tr.top;
      } else {
        // Upward: top center → bottom center
        px1 = fromCx; py1 = fr.top;
        px2 = toCx;   py2 = tr.bottom;
      }

      next[`${edge.from}-${edge.to}`] = {
        x1: ((px1 - cr.left) / cr.width) * 100,
        y1: ((py1 - cr.top) / cr.height) * 100,
        x2: ((px2 - cr.left) / cr.width) * 100,
        y2: ((py2 - cr.top) / cr.height) * 100,
      };
    }
    setEdgeCoords(next);
  }, []);

  // On tab change: clear stale refs, wait for AnimatePresence exit + new mount, then measure
  useEffect(() => {
    nodeRefs.current = {};
    setEdgeCoords({});
    let ro: ResizeObserver | null = null;
    const id = setTimeout(() => {
      recalc();
      if (containerRef.current) {
        ro = new ResizeObserver(recalc);
        ro.observe(containerRef.current);
      }
    }, 350);
    return () => {
      clearTimeout(id);
      ro?.disconnect();
    };
  }, [active, recalc]);

  return (
    <section className="section-padding">
      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            <Network size={12} />
            System Design
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Architecture <span className="gradient-text">deep dives</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Interactive diagrams of real systems I've designed and shipped.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {architectures.map((a) => (
            <button
              key={a.id}
              onClick={() => setActive(a.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                active === a.id
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "border border-border text-muted-foreground hover:border-brand-500/50"
              )}
            >
              {a.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {arch.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{arch.subtitle}</p>

            {/* Architecture diagram */}
            <div
              ref={containerRef}
              className="relative w-full h-48 md:h-64 bg-muted/30 rounded-xl border border-border mb-6 overflow-hidden"
            >
              {/* Nodes */}
              {arch.nodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div
                    ref={(el) => { nodeRefs.current[node.id] = el; }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap",
                      colorMap[node.color],
                      node.highlight ? "ring-1 ring-offset-1 ring-current" : ""
                    )}
                  >
                    {node.label}
                  </div>
                </motion.div>
              ))}

              {/* Arrows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id={`arrow-${arch.id}`}
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L0,6 L6,3 z" fill="rgba(14,165,233,0.5)" />
                  </marker>
                </defs>
                {arch.edges.map((edge) => {
                  const coords = edgeCoords[`${edge.from}-${edge.to}`];
                  if (!coords) return null;
                  return (
                    <motion.line
                      key={`${edge.from}-${edge.to}`}
                      x1={`${coords.x1}%`}
                      y1={`${coords.y1}%`}
                      x2={`${coords.x2}%`}
                      y2={`${coords.y2}%`}
                      stroke="rgba(14,165,233,0.3)"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                      markerEnd={`url(#arrow-${arch.id})`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Description + Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {arch.description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {arch.metrics.map((m) => (
                  <div
                    key={m}
                    className="flex items-center gap-2 text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2"
                  >
                    <RefreshCw size={11} className="flex-shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
