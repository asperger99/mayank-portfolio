import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  MapPin,
  GraduationCap,
  Code2,
  Server,
  Cloud,
  Zap,
} from "lucide-react";

const highlights = [
  {
    icon: Server,
    label: "Backend Focus",
    desc: "Microservices, REST APIs, distributed systems",
  },
  {
    icon: Cloud,
    label: "Cloud Native",
    desc: "AWS-first architecture, managed services",
  },
  {
    icon: Code2,
    label: "Full Stack",
    desc: "React frontend + Node.js / .NET backend",
  },
  {
    icon: Zap,
    label: "Performance",
    desc: "Latency reduction, scalability engineering",
  },
];

export function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="about" className="section-padding">
      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
              About Me
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 tracking-tight">
              Engineering systems that{" "}
              <span className="gradient-text">scale and survive</span>
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I'm a Senior Software Engineer with 4+ years building production
                backend infrastructure at JPMorgan Chase and Coursefinder.ai.
                My work centers on distributed systems, microservice
                architecture, and making systems meaningfully faster and more
                reliable.
              </p>
              <p>
                At JPMorgan, I orchestrated the migration of a production
                Cassandra cluster to AWS Keyspaces — zero downtime, 25% lower
                read latency. I built the BFF layer for the Management Console,
                cutting API call counts from 12 to 2 per view load and reducing
                latency 40%.
              </p>
              <p>
                At Coursefinder.ai, I redesigned the PostgreSQL materialized
                view strategy from scratch, cutting search index refresh from
                1.5 minutes to 20 seconds. I led an Auth0 → Kinde auth
                migration with zero session disruptions and ~60% cost savings.
              </p>
              <p>
                When I'm not building backend systems, I write about distributed
                databases, caching strategies, and API design.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={15} className="text-brand-500" />
                Nagpur, Maharashtra, India
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap size={15} className="text-brand-500" />
                B.Tech CS, MAKAUT (2022)
              </div>
            </div>
          </div>

          {/* Right: Highlight Cards */}
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="glass-card rounded-2xl p-5 hover:border-brand-500/30 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                  <h.icon size={20} className="text-brand-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {h.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {h.desc}
                </p>
              </motion.div>
            ))}

            {/* Code card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="col-span-2 glass-card rounded-2xl p-5 font-mono text-xs"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="text-muted-foreground ml-2 text-xs">
                  mayank.ts
                </span>
              </div>
              <pre className="text-muted-foreground leading-relaxed overflow-x-auto">
                <code>{`const mayank = {
  role: "Sr. Software Engineer",
  exp: "4+ years",
  focus: ["distributed-systems", "microservices"],
  stack: ["C#", "TypeScript", "PostgreSQL", "AWS"],
  currentlyAt: "Coursefinder.ai",
  openTo: "Senior / Staff Eng roles",
};`}</code>
              </pre>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
