"use client";

import { useState } from "react";
import { 
  Newspaper, 
  ArrowLeft, 
  Clock, 
  Heart, 
  Bookmark, 
  Share2, 
  Search, 
  X,
  Sparkles,
  User,
  Plus
} from "lucide-react";
import Link from "next/link";

const BLOG_ARTICLES = [
  {
    id: 1,
    title: "Understanding React 19 & Server Components in Next.js",
    category: "Web Development",
    author: "Bhanu Prakash",
    role: "Staff Software Engineer",
    date: "Oct 24, 2026",
    readTime: "5 min read",
    likes: 142,
    summary: "How Server Components optimize data fetching, eliminate client bundle bloat, and revolutionize frontend rendering pipelines.",
    content: `React Server Components (RSC) represent one of the most fundamental shifts in the React ecosystem. By executing components exclusively on the server, RSCs enable direct access to databases, filesystem caches, and internal microservices without exposing sensitive credentials to the browser bundle.

Key Takeaways:
1. Zero-Bundle-Size Dependencies: Complex markdown parsers or heavy date libraries run on the server and transmit only HTML and JSON payloads.
2. Interleaving Server & Client: Client Components can accept Server Components as children props, creating seamless interactive islands.
3. Native Streaming: Leverage Suspense boundaries to render static chrome immediately while asynchronous data streams into the page progressively.`
  },
  {
    id: 2,
    title: "Defending Against Zero-Day Web Attacks & SQLi",
    category: "Cybersecurity",
    author: "NextGen Labs SecOps",
    role: "Security Researcher",
    date: "Oct 21, 2026",
    readTime: "7 min read",
    likes: 98,
    summary: "Deep dive into web application vulnerabilities, automated penetration testing scripts, and perimeter defense hardening.",
    content: `Modern attack vectors increasingly target application logic flaws rather than classic infrastructure exploits. In this technical dissection, we explore how modern web applications secure their attack surface using defense-in-depth methodologies.

Key Takeaways:
1. Strict Parameterization: Never interpolate unsanitized strings directly into database drivers or ORM queries.
2. Content Security Policy (CSP): Mitigate XSS attacks by restricting scripts to cryptographically signed nonces.
3. Rate Limiting & Anomaly Detection: Throttle automated scanners and brute-force attempts at the edge reverse proxy.`
  },
  {
    id: 3,
    title: "Mastering Dynamic Programming for FAANG Interviews",
    category: "Data Structures",
    author: "Algorithms Research Group",
    role: "Competitive Coding Lead",
    date: "Oct 15, 2026",
    readTime: "8 min read",
    likes: 215,
    summary: "The definitive 4-step framework to identify overlapping subproblems, define state transitions, and convert recursion to tabulation.",
    content: `Dynamic Programming often intimidates candidates, but it is fundamentally about caching subproblem solutions to prevent redundant recalculation.

The 4-Step Framework:
1. Identify State Variables: Determine the minimum parameters needed to describe a subproblem.
2. Formulate Recurrence Relation: Express the current state in terms of previously solved states.
3. Identify Base Cases: Determine the boundary conditions that stop recursion.
4. Optimize Space: Transition from an O(n²) 2D matrix to O(n) rolling 1D arrays when only previous rows are required.`
  }
];

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState(null);
  const [likedArticles, setLikedArticles] = useState({});

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikedArticles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredArticles = BLOG_ARTICLES.filter(a => {
    const matchesCat = selectedCategory === "all" || a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-violet-400" />
              Technical Engineering Articles
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">In-depth insights, architecture patterns, and research from faculty and students.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {["all", "Web Development", "Cybersecurity", "Data Structures"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {cat === "all" ? "All Topics" : cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles.map((article) => {
          const isLiked = likedArticles[article.id];
          return (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.12)] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-3">
                  <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full font-semibold">
                    {article.category}
                  </span>
                  <span>{article.readTime}</span>
                </div>

                <h2 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-violet-400 transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-6">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-[10px]">
                    {article.author.slice(0, 1)}
                  </div>
                  <span className="text-zinc-300 font-medium">{article.author}</span>
                </div>

                <button
                  onClick={(e) => toggleLike(article.id, e)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLiked ? 'text-rose-400 font-bold' : 'text-zinc-500 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                  <span>{article.likes + (isLiked ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-y-auto flex flex-col justify-between space-y-6">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mb-3">
                <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-full font-bold">
                  {activeArticle.category}
                </span>
                <span>•</span>
                <span>{activeArticle.date}</span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>

              <h2 className="text-2xl font-bold text-zinc-50 mb-3 leading-snug">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-zinc-800 text-xs">
                <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center font-bold">
                  {activeArticle.author.slice(0, 1)}
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">{activeArticle.author}</p>
                  <p className="text-zinc-500">{activeArticle.role}</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {activeArticle.content}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="text-zinc-500">Published via NextGen Labs Engineering Library</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
