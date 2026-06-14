import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, Download, Mail, Terminal } from "lucide-react";
import { useMousePosition } from "../../hooks/useMousePosition";
import { NetworkGraph } from "../ui/NetworkGraph";

const TYPED_STRINGS = [
  "Sr. Software Engineer",
  "Distributed Systems",
  "Backend Engineer",
  "Microservices",
  
];

function useTypingEffect(strings: string[], speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = strings[idx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < target.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === target.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % strings.length);
    }

    setDisplayed(target.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, strings, speed, pause]);

  return displayed;
}

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}));

export function Hero() {
  const mouse = useMousePosition();
  const containerRef = useRef<HTMLDivElement>(null);
  const typed = useTypingEffect(TYPED_STRINGS);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(((mouse.x - rect.left) / rect.width) * 100);
    mouseY.set(((mouse.y - rect.top) / rect.height) * 100);
  }, [mouse, mouseX, mouseY]);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-background"
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Radial glow that follows mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${springX.get()}% ${springY.get()}%, rgba(14,165,233,0.08), transparent 70%)`,
        }}
      />

      {/* Static large glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-brand-500/20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-max section-padding pt-32 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div>
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative inline-flex mb-7"
            >
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl scale-110 pointer-events-none" />
              {/* Gradient ring */}
              <div className="relative w-24 h-24 rounded-full p-[2.5px] bg-gradient-to-br from-brand-400 via-cyan-400 to-brand-600">
                <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-background">
                  <img
                    src="/avatar.jpg"
                    alt="Mayank Singh"
                    className="w-full h-full object-cover brightness-110 contrast-105"
                    style={{ transform: "scale(2.2)", transformOrigin: "center 28%" }}
                  />
                </div>
              </div>
              {/* Available dot */}
              <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
              </span>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-medium mb-6 ml-3"
            >
              Available for Senior Engineering Roles
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-4"
            >
              <span className="gradient-text">Mayank</span> Singh
            </motion.h1>

            {/* Typed role */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <Terminal size={18} className="text-brand-500 flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-mono text-muted-foreground">
                {typed}
                <span className="animate-pulse text-brand-500">|</span>
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-muted-foreground leading-relaxed mb-8"
            >
              Backend engineer with 4 years designing, migrating, and operating
              production systems for{" "}
              <span className="text-brand-400 font-medium">JPMorgan Chase</span>'s
              travel platform — from session datastores on AWS Keyspaces to
              event-driven ingestion with RabbitMQ. Core stack: C#/.NET,
              PostgreSQL, Redis, AWS. Currently owning backend systems and
              shipping full-stack features end-to-end at{" "}
              <span className="text-brand-400 font-medium">Coursefinder.ai</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={scrollToContact}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors shadow-lg shadow-brand-500/25"
              >
                <Mail size={18} />
                Get in Touch
              </motion.button>

              <motion.button
                onClick={scrollToProjects}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-accent text-foreground font-medium transition-colors"
              >
                View Projects
              </motion.button>

              <motion.a
                href="/MayannkSinghResume.pdf"
                download="Mayank_Kumar_Singh_Resume.pdf"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-accent text-muted-foreground font-medium transition-colors"
              >
                <Download size={18} />
                Resume
              </motion.a>
            </motion.div>
          </div>

          {/* Right: distributed systems network graph — visible on all screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {/* Responsive size: smaller on mobile, full on desktop */}
            <div className="block lg:hidden">
              <NetworkGraph size={320} />
            </div>
            <div className="hidden lg:block">
              <NetworkGraph size={480} />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
