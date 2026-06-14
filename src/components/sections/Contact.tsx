import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { cn } from "../../lib/utils";

export function Contact() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [form, setForm] = useState({ name: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Connect through Portfolio");
    const body = encodeURIComponent(`${form.message}\n\nRegards\n${form.name}`);
    window.location.href = `mailto:mayanksingh.inf@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
            <MessageSquare size={12} />
            Get in Touch
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Let's <span className="gradient-text">work together</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Open to Senior Engineering Roles and
            interesting technical conversations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Reach out directly
            </h3>

            {/* Bento contact cards */}
            <div className="space-y-3">
            {[
              {
                href: "mailto:mayanksingh.inf@gmail.com",
                Icon: Mail,
                label: "Email",
                value: "mayanksingh.inf@gmail.com",
                bg: "from-brand-500/10 to-transparent",
                border: "border-brand-500/25 hover:border-brand-500/50",
                dot: "bg-brand-400",
                icon: "text-brand-400",
                iconBg: "bg-brand-500/10 group-hover:bg-brand-500/20",
              },
              {
                href: undefined,
                Icon: MapPin,
                label: "Location",
                value: "Nagpur, Maharashtra, India",
                bg: "from-emerald-500/8 to-transparent",
                border: "border-emerald-500/20",
                dot: "bg-emerald-400",
                icon: "text-emerald-400",
                iconBg: "bg-emerald-500/10",
              },
            ].map(({ href, Icon, label, value, bg, border, dot, icon, iconBg }, i) => {
              const Tag = href ? "a" : "div";
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                >
                  <Tag
                    {...(href ? { href } : {})}
                    className={cn(
                      "relative flex items-center gap-3 p-4 rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden",
                      "transition-all duration-200 group",
                      border
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", bg)} />
                    <Icon size={72} className="absolute -bottom-2 -right-2 opacity-[0.04] pointer-events-none text-foreground" />
                    <div className={cn("relative z-10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", iconBg)}>
                      <Icon size={18} className={icon} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", dot)} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <div className="text-sm font-medium text-foreground">{value}</div>
                    </div>
                  </Tag>
                </motion.div>
              );
            })}
            </div>

          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {sent ? (
              <div className="glass-card rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
                  <Send size={28} className="text-brand-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Message sent!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Thanks for reaching out. I'll get back to you within 24
                  hours.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-sm text-brand-500 hover:underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass-card rounded-2xl p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell me about the role or project..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors resize-none"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors shadow-lg shadow-brand-500/25"
                >
                  <Send size={16} />
                  Send Message
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
