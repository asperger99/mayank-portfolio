import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, Tag, BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import { blogPosts } from "../data/blog";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

const ALL_CATEGORIES = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))];
const ALL_TAGS = Array.from(new Set(blogPosts.flatMap((p) => p.tags))).slice(0, 12);

export function BlogListPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = blogPosts.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const featured = blogPosts.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured || category !== "All" || search !== "");

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="section-padding pb-10 border-b border-border">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
              <BookOpen size={12} />
              Engineering Blog
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-3">
              Thoughts on <span className="gradient-text">Systems Engineering</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Deep dives on distributed systems, databases, API design, observability, and the craft of building reliable software.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="section-padding pt-10">
        <div className="container-max">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Search */}
              <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-8">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                      category === cat
                        ? "bg-brand-500 text-white"
                        : "border border-border text-muted-foreground hover:border-brand-500/50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Featured article */}
              {featured && category === "All" && search === "" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <Link to={`/blog/${featured.slug}`} className="group block">
                    <div className="glass-card rounded-2xl overflow-hidden hover:border-brand-500/30 transition-colors duration-300">
                      <div className={cn("h-2 bg-gradient-to-r", featured.coverGradient)} />
                      <div className="p-6 md:p-8">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/20 text-brand-400">
                            Featured
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                            {featured.category}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-brand-500 transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                          {featured.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {featured.readingTime} min read
                            </span>
                            <span>{formatDate(featured.publishedAt)}</span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-brand-500 font-medium group-hover:gap-2 transition-all">
                            Read article
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Article list */}
              <div className="space-y-4">
                {(category !== "All" || search !== "" ? filtered : rest).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <Link to={`/blog/${post.slug}`} className="group block">
                      <div className="glass-card rounded-2xl p-5 hover:border-brand-500/30 transition-colors duration-300">
                        <div className="flex items-start gap-4">
                          <div className={cn("w-1 self-stretch rounded-full bg-gradient-to-b flex-shrink-0", post.coverGradient)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                                {post.category}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock size={10} />
                                {post.readingTime} min
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(post.publishedAt)}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-brand-500 transition-colors line-clamp-1">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                              {post.excerpt}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {post.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="tech-tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-muted-foreground group-hover:text-brand-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No articles match your search.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
              {/* Trending */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <TrendingUp size={14} className="text-brand-500" />
                  Trending Articles
                </h3>
                <div className="space-y-3">
                  {blogPosts.slice(0, 4).map((p, i) => (
                    <Link
                      key={p.id}
                      to={`/blog/${p.slug}`}
                      className="group flex items-start gap-3"
                    >
                      <span className="text-xl font-bold text-muted-foreground/30 font-mono leading-none mt-0.5 w-5 flex-shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-foreground group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.readingTime} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <Tag size={14} className="text-brand-500" />
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearch(tag)}
                      className="tech-tag cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="glass-card rounded-2xl p-5 border-brand-500/20">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center mb-3">
                  <BookOpen size={16} className="text-brand-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Stay Updated
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Get new engineering deep dives delivered to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50 mb-2"
                />
                <button className="w-full py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
