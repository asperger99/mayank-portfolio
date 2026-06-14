import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../ui/SocialIcons";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/utils";

const navLinks = [
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Blogs", href: "/blog", upcoming: true },
  { label: "Contact", href: "/#contact" },
];

interface NavbarProps {
  onCommandPalette?: () => void;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform);

export function Navbar({ onCommandPalette }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(() => !localStorage.getItem("cmd_palette_seen"));
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const clearFirstVisit = () => {
    localStorage.setItem("cmd_palette_seen", "1");
    setIsFirstVisit(false);
  };

  const handleCommandPalette = () => {
    if (isFirstVisit) clearFirstVisit();
    onCommandPalette?.();
  };

  useEffect(() => {
    if (!isFirstVisit) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") clearFirstVisit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFirstVisit]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5"
          : "bg-transparent"
      )}
    >
      <div className="container-max section-padding py-0">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === "/blog" && link.href === "/blog";
              if (link.upcoming) {
                return (
                  <span
                    key={link.label}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
                  >
                    {link.label}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      Coming Soon
                    </span>
                  </span>
                );
              }
              return link.href.startsWith("/#") ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200",
                    "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "text-brand-500 bg-brand-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:flex items-center">
              <button
                onClick={handleCommandPalette}
                title="Open command palette (⌘K)"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-300 group",
                  isFirstVisit
                    ? "border-brand-500/60 bg-brand-500/15 text-brand-300 animate-pulse"
                    : "border-brand-500/25 bg-brand-500/8 hover:bg-brand-500/15 hover:border-brand-500/50 text-brand-400 hover:text-brand-300"
                )}
              >
                <kbd className="font-mono text-sm font-semibold tracking-tight">{isMac ? "⌘" : "Ctrl"}</kbd>
                <kbd className="font-mono text-sm font-semibold tracking-tight">K</kbd>
              </button>
              {isFirstVisit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 380, damping: 22 }}
                  className="absolute top-full mt-2 left-0 pointer-events-none z-[200]"
                >
                  {/* caret pinned to ⌘K button center (~26px from left) */}
                  <div className="absolute -top-[5px] left-[22px] w-2.5 h-2.5 bg-card border-l border-t border-brand-500/40 rotate-45" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-500/40 bg-card backdrop-blur-md shadow-lg shadow-brand-500/10 whitespace-nowrap">
                    <span className="text-brand-400 text-[12px] leading-none">✦</span>
                    <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
                      Press{" "}
                      <kbd className="mx-0.5 px-1 py-0.5 rounded bg-brand-500/20 border border-brand-500/30 font-mono text-[10px] text-brand-300">{isMac ? "⌘" : "Ctrl"}</kbd>
                      <kbd className="mx-0.5 px-1 py-0.5 rounded bg-brand-500/20 border border-brand-500/30 font-mono text-[10px] text-brand-300">K</kbd>
                      {" "}to explore
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            <a
              href="https://github.com/asperger99"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <GithubIcon size={18} />
            </a>

            <a
              href="https://www.linkedin.com/in/mayank-kumar-singh-b096491b9"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LinkedinIcon size={18} />
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <nav className="container-max section-padding py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                if (link.upcoming) {
                  return (
                    <span
                      key={link.label}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
                    >
                      {link.label}
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        Coming Soon
                      </span>
                    </span>
                  );
                }
                return link.href.startsWith("/#") ? (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className="px-4 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent text-left transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
