import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Link2,
  BookOpen,
} from "lucide-react";
import { TwitterIcon, LinkedinIcon } from "../components/ui/SocialIcons";
import { blogPosts } from "../data/blog";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return progress;
}

function extractHeadings(markdown: string) {
  const lines = markdown.split("\n");
  return lines
    .filter((l) => l.startsWith("## ") || l.startsWith("### "))
    .map((l) => ({
      level: l.startsWith("### ") ? 3 : 2,
      text: l.replace(/^#+\s/, ""),
      id: l.replace(/^#+\s/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));
}

function renderMarkdown(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      // H2
      if (line.startsWith("## ")) {
        const text = line.slice(3);
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return `<h2 id="${id}" class="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border">${text}</h2>`;
      }
      // H3
      if (line.startsWith("### ")) {
        const text = line.slice(4);
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return `<h3 id="${id}" class="text-xl font-semibold text-foreground mt-8 mb-3">${text}</h3>`;
      }
      // Code block open
      if (line.startsWith("```")) {
        const lang = line.slice(3).trim();
        return `<pre class="bg-muted/60 rounded-xl p-4 overflow-x-auto my-4 border border-border text-sm font-mono"><code class="language-${lang}">`;
      }
      // Blockquote
      if (line.startsWith("> ")) {
        return `<blockquote class="border-l-4 border-brand-500 pl-4 my-4 text-muted-foreground italic">${line.slice(2)}</blockquote>`;
      }
      // Bold
      let l = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
      // Inline code
      l = l.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-brand-400">$1</code>');
      // Links
      l = l.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-500 hover:underline" target="_blank" rel="noopener">$1</a>');
      // Table row
      if (l.includes("|") && l.trim().startsWith("|")) {
        const cells = l.split("|").filter(Boolean).map((c) => c.trim());
        if (cells.every((c) => c.match(/^[-:]+$/))) return "";
        const isHeader = false;
        const tag = isHeader ? "th" : "td";
        return `<tr class="border-b border-border">${cells.map((c) => `<${tag} class="px-4 py-2 text-sm text-left">${c}</${tag}>`).join("")}</tr>`;
      }
      // Bullet list
      if (l.startsWith("- ")) {
        return `<li class="text-muted-foreground text-sm leading-relaxed">${l.slice(2)}</li>`;
      }
      // Numbered list
      if (/^\d+\.\s/.test(l)) {
        return `<li class="text-muted-foreground text-sm leading-relaxed">${l.replace(/^\d+\.\s/, "")}</li>`;
      }
      // Empty line
      if (l.trim() === "") return '<div class="h-3" />';
      // Paragraph
      if (!l.startsWith("<")) {
        return `<p class="text-muted-foreground text-sm leading-relaxed mb-2">${l}</p>`;
      }
      return l;
    })
    .join("\n")
    .replace(/```[\s\S]*?```/g, (match) => {
      const inner = match.replace(/^```[^\n]*\n/, "").replace(/```$/, "");
      return `<pre class="bg-muted/60 rounded-xl p-4 overflow-x-auto my-4 border border-border"><code class="text-sm font-mono text-foreground">${inner
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code></pre>`;
    });
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const progress = useReadingProgress();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const post = blogPosts.find((p) => p.slug === slug);
  const related = blogPosts.filter((p) => p.slug !== slug && p.category === post?.category).slice(0, 2);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Article not found</h1>
          <button onClick={() => navigate("/blog")} className="text-brand-500 hover:underline text-sm">
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const headings = extractHeadings(post.content);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-brand-500 to-cyan-400 z-[60] transition-all duration-100"
        style={{ width: `${progress}%` }}
      />

      <div className="section-padding pt-8">
        <div className="container-max">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main article */}
            <article className="flex-1 min-w-0 max-w-3xl">
              {/* Back */}
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft size={14} />
                All Articles
              </Link>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white", post.coverGradient)}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    {post.readingTime} min read
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={11} />
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                  {post.title}
                </h1>

                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      M
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Mayank Kumar Singh</div>
                      <div className="text-xs text-muted-foreground">Sr. Software Engineer</div>
                    </div>
                  </div>
                  {/* Share */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">Share:</span>
                    <button
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, "_blank")}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-brand-500/50 transition-colors"
                      title="Share on Twitter"
                    >
                      <TwitterIcon size={14} />
                    </button>
                    <button
                      onClick={() => window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank")}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-brand-500/50 transition-colors"
                      title="Share on LinkedIn"
                    >
                      <LinkedinIcon size={14} />
                    </button>
                    <button
                      onClick={copyLink}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-brand-500/50 transition-colors"
                      title="Copy link"
                    >
                      {copied ? <span className="text-xs text-brand-500">✓</span> : <Link2 size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Article content */}
              <motion.div
                ref={contentRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="prose-content space-y-1"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag size={12} />
                  Tags:
                </span>
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/blog?tag=${tag}`} className="tech-tag">
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-lg font-bold text-foreground mb-4">Related Articles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map((r) => (
                      <Link key={r.id} to={`/blog/${r.slug}`} className="group">
                        <div className="glass-card rounded-xl p-4 hover:border-brand-500/30 transition-colors">
                          <div className={cn("h-1 rounded-full bg-gradient-to-r mb-3", r.coverGradient)} />
                          <p className="text-sm font-medium text-foreground group-hover:text-brand-500 transition-colors line-clamp-2 mb-1">
                            {r.title}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {r.readingTime} min read
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar: TOC */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {headings.length > 0 && (
                  <div className="glass-card rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
                      <BookOpen size={12} className="text-brand-500" />
                      Contents
                    </h3>
                    <nav className="space-y-1">
                      {headings.map((h) => (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className={cn(
                            "block text-xs text-muted-foreground hover:text-brand-500 transition-colors leading-snug py-0.5",
                            h.level === 3 ? "pl-3 border-l border-border" : ""
                          )}
                        >
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Progress */}
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Reading progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Back to blog */}
                <Link
                  to="/blog"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand-500 transition-colors"
                >
                  <ArrowLeft size={12} />
                  All Articles
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
