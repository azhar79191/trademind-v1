import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";

const CATEGORIES = ["all", "institutional", "technology", "macro", "defi", "regulation", "exchange", "market"];

export default function News() {
  const [category, setCategory] = useState("all");

  const { data: articles, isLoading } = trpc.market.getNews.useQuery(
    category === "all" ? undefined : { category },
    { retry: false }
  );

  const sentimentIcon = (sentiment: string) => {
    if (sentiment === "positive") return <TrendingUp className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />;
    if (sentiment === "negative") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4" style={{ color: "var(--grey-dim)" }} />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Market News</h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>Curated news with AI sentiment analysis</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${category === cat ? "" : ""}`}
                style={{
                  background: category === cat ? "var(--navy-highlight)" : "transparent",
                  color: category === cat ? "var(--lime-primary)" : "var(--grey-dim)",
                  border: category === cat ? "1px solid var(--lime-primary)" : "1px solid var(--navy-highlight)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        {articles && articles.length > 0 && (
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(210, 249, 0, 0.1)", color: "var(--lime-primary)" }}>
                {articles[0].category}
              </span>
              <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--grey-dim)" }}>
                {sentimentIcon(articles[0].sentiment ?? "neutral")}
                {articles[0].sentiment}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{articles[0].title}</h2>
            <p className="text-sm mb-4" style={{ color: "var(--grey-dim)" }}>{(articles[0] as any).summary ?? ""}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--grey-dim)" }}>
                <span className="font-medium">{articles[0].source}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(articles[0].publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <a 
                href={(articles[0] as any).url || "https://www.coindesk.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80" 
                style={{ color: "var(--lime-primary)" }}
              >
                Read More <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-surface p-5">
                <div className="h-3 rounded animate-pulse mb-3" style={{ background: "var(--navy-highlight)", width: "20%" }} />
                <div className="h-4 rounded animate-pulse mb-2" style={{ background: "var(--navy-highlight)" }} />
                <div className="h-3 rounded animate-pulse" style={{ background: "var(--navy-highlight)", width: "80%" }} />
              </div>
            ))
          ) : (
            articles?.slice(1).map((article) => (
              <div key={article.id} className="card-surface p-5 transition-all hover:translate-y-[-2px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: "var(--navy-highlight)", color: "var(--grey-dim)" }}>
                    {article.category}
                  </span>
                  {sentimentIcon(article.sentiment ?? "neutral")}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--grey-dim)" }}>{article.source}</span>
                  <span className="text-[10px]" style={{ color: "var(--grey-dim)" }}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                {article.relatedAssets && article.relatedAssets.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {article.relatedAssets.map((asset) => (
                      <span key={asset} className="px-1.5 py-0.5 rounded text-[10px] font-mono-data" style={{ background: "var(--navy-base)", color: "var(--lime-primary)" }}>
                        {asset}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
