import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ScrollProgress } from "./components/layout/ScrollProgress";
import { CommandPalette } from "./components/ui/CommandPalette";
import { HomePage } from "./pages/HomePage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { useTheme } from "./hooks/useTheme";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();
  useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <Navbar onCommandPalette={() => setCmdOpen(true)} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/blog"
              element={
                <PageTransition>
                  <BlogListPage />
                </PageTransition>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <PageTransition>
                  <BlogDetailPage />
                </PageTransition>
              }
            />
            <Route
              path="*"
              element={
                <PageTransition>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-brand-500 mb-4">404</h1>
                      <p className="text-muted-foreground mb-6">Page not found</p>
                      <a href="/" className="text-brand-500 hover:underline">
                        Go home
                      </a>
                    </div>
                  </div>
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
