import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Briefcase,
  FolderOpen,
  BookOpen,
  Mail,
  Download,
  Sun,
  Moon,
  Award,
  Code2,
  X,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./SocialIcons";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/utils";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  shortcut?: string;
  upcoming?: boolean;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_ORDER = ["Actions", "Navigation", "Preferences"];
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform);

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const commands: Command[] = [
    // ── Actions ──────────────────────────────────────────────────────
    {
      id: "action-email",
      label: "Send Email",
      description: "mayanksingh.inf@gmail.com",
      icon: Mail,
      action: () => { window.location.href = "mailto:mayanksingh.inf@gmail.com"; onClose(); },
      category: "Actions",
      shortcut: "M",
    },
    {
      id: "action-github",
      label: "Open GitHub",
      icon: GithubIcon,
      action: () => { window.open("https://github.com/asperger99", "_blank"); onClose(); },
      category: "Actions",
      shortcut: "G",
    },
    {
      id: "action-linkedin",
      label: "Open LinkedIn",
      icon: LinkedinIcon,
      action: () => { window.open("https://www.linkedin.com/in/mayank-kumar-singh-b096491b9", "_blank"); onClose(); },
      category: "Actions",
      shortcut: "L",
    },
    {
      id: "action-resume",
      label: "Download Resume",
      icon: Download,
      action: () => {
        const a = document.createElement("a");
        a.href = "/MayannkSinghResume.pdf";
        a.download = "Mayank_Kumar_Singh_Resume.pdf";
        a.click();
        onClose();
      },
      category: "Actions",
      shortcut: "R",
    },

    // ── Navigation ────────────────────────────────────────────────────
    {
      id: "nav-experience",
      label: "Go to Experience",
      icon: Briefcase,
      action: () => scrollTo("experience"),
      category: "Navigation",
      shortcut: "E",
    },
    {
      id: "nav-projects",
      label: "Go to Projects",
      icon: FolderOpen,
      action: () => scrollTo("projects"),
      category: "Navigation",
      shortcut: "P",
    },
    {
      id: "nav-skills",
      label: "Go to Skills",
      icon: Code2,
      action: () => scrollTo("skills"),
      category: "Navigation",
      shortcut: "S",
    },
    {
      id: "nav-education",
      label: "Go to Education",
      icon: Award,
      action: () => scrollTo("education"),
      category: "Navigation",
      shortcut: "D",
    },
    {
      id: "nav-contact",
      label: "Go to Contact",
      icon: Mail,
      action: () => scrollTo("contact"),
      category: "Navigation",
      shortcut: "C",
    },
    {
      id: "nav-blog",
      label: "Go to Blog",
      icon: BookOpen,
      action: () => { onClose(); navigate("/blog"); },
      category: "Navigation",
      shortcut: "B",
      upcoming: true,
    },

    // ── Preferences ───────────────────────────────────────────────────
    {
      id: "action-theme",
      label: `Switch to ${isDark ? "Light" : "Dark"} Mode`,
      icon: isDark ? Sun : Moon,
      action: () => { toggleTheme(); onClose(); },
      category: "Preferences",
      shortcut: "T",
    },
  ];

  const filtered = commands.filter(
    (c) =>
      query === "" ||
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group and sort by CATEGORY_ORDER
  const grouped = CATEGORY_ORDER.reduce<Record<string, Command[]>>((acc, cat) => {
    const cmds = filtered.filter((c) => c.category === cat);
    if (cmds.length) acc[cat] = cmds;
    return acc;
  }, {});

  // Only selectable (non-upcoming) items respond to keyboard
  const selectableFiltered = Object.values(grouped).flat().filter((c) => !c.upcoming);

  // Build shortcut map for instant lookup
  const shortcutMap = commands.reduce<Record<string, Command>>((acc, c) => {
    if (c.shortcut && !c.upcoming) acc[c.shortcut.toLowerCase()] = c;
    return acc;
  }, {});

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => (s + 1) % selectableFiltered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => (s - 1 + selectableFiltered.length) % selectableFiltered.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        selectableFiltered[selected]?.action();
        return;
      }
      // Ctrl/⌘ + letter shortcuts — work on Mac and Windows
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.length === 1) {
        const cmd = shortcutMap[e.key.toLowerCase()];
        if (cmd) { e.preventDefault(); cmd.action(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selected, selectableFiltered, shortcutMap, query, onClose]);

  // Scroll selected item into view when it changes via keyboard
  useEffect(() => {
    const el = document.querySelector(`[data-cmd-idx="${selected}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  let selectableIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[201] px-4"
          >
            <div className="bg-card border border-border rounded-2xl dark:shadow-2xl overflow-hidden">
              {/* Search */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={16} className="text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, navigate sections..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
                <kbd className="kbd">Esc</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {Object.values(grouped).flat().length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No commands found for "{query}"
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, cmds]) => (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        {category}
                      </div>
                      {cmds.map((cmd) => {
                        if (cmd.upcoming) {
                          return (
                            <div
                              key={cmd.id}
                              className="flex items-center gap-3 px-4 py-2.5 cursor-not-allowed opacity-45 select-none"
                            >
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
                                <cmd.icon size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{cmd.label}</div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide bg-brand-500/10 text-brand-400 border border-brand-500/20 opacity-100">
                                Coming Soon
                              </span>
                            </div>
                          );
                        }

                        const idx = selectableIdx++;
                        const isSel = idx === selected;
                        return (
                          <button
                            key={cmd.id}
                            data-cmd-idx={idx}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelected(idx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              isSel
                                ? "bg-brand-500/10 text-foreground"
                                : "text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                              isSel ? "bg-brand-500/20" : "bg-muted"
                            )}>
                              <cmd.icon size={14} className={isSel ? "text-brand-500" : ""} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{cmd.label}</div>
                              {cmd.description && (
                                <div className="text-xs text-muted-foreground/70 truncate">
                                  {cmd.description}
                                </div>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <span className="flex items-center gap-1">
                                <kbd className="kbd">{isMac ? "⌘" : "Ctrl"}</kbd>
                                <kbd className="kbd">{cmd.shortcut}</kbd>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[11px] text-muted-foreground/60">
                <span className="flex items-center gap-1"><kbd className="kbd">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> select</span>
                <span className="flex items-center gap-1"><kbd className="kbd">Esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
