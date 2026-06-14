import { motion, useSpring } from "framer-motion";
import { useScrollProgress } from "../../hooks/useScrollProgress";

export function ScrollProgress() {
  const progress = useScrollProgress();
  const scaleX = useSpring(progress / 100, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-500 z-[100] origin-left"
      style={{ scaleX }}
    />
  );
}
