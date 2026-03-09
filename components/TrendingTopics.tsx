"use client";
import React, { useEffect, useState } from "react";
import { TrendingTopic } from "@/types/trending";

export default function TrendingTopics({ limit = 20, fullWidth = false }: { limit?: number; fullWidth?: boolean }) {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const res = await fetch(`/api/proxy/trending?limit=${encodeURIComponent(String(limit))}&includeCounts=true`, { credentials: "include" });
        if (!res.ok) {
          setTopics([]);
        } else {
          const data = await res.json().catch(() => null);
          // backend may return { tendencias: [...] } or { topics: [...] } or raw array
          const list = data?.tendencias ?? data?.topics ?? data ?? [];
          // Normalize shape: expect objects with hashtag and count
          const normalized = Array.isArray(list)
            ? list.map((t: any) => ({
                hashtag: t.hashtag ?? t.tag ?? t.name ?? String(t),
                count: t.count ?? t.posts ?? t.counts ?? 0,
                url: t.url ?? t.link ?? t.href ?? t.permalink ?? null,
              }))
            : [];
          setTopics(normalized.slice(0, Number(limit)));
        }
      } catch (e) {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, [limit]);

  const containerClass = fullWidth
    ? "w-full -mt-1"
    : "w-full max-w-[380px] mx-auto mt-4 rounded-md shadow border border-zinc-600 p-4";

  const containerStyle = fullWidth ? { backgroundColor: 'transparent' } : { backgroundColor: '#0b0b0b' };

  const titleClass = fullWidth ? "text-2xl font-bold mb-1 text-zinc-100" : "text-lg font-bold mb-1 text-zinc-100";
  const itemClass = fullWidth ? "text-xl font-medium text-zinc-100" : "text-base font-medium text-zinc-100";
  const countClass = fullWidth ? "text-sm text-zinc-400" : "text-xs text-zinc-400";

  return (
    <div className={containerClass} style={containerStyle}>
      <h2 className={titleClass}>Trending topics</h2>
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : topics.length === 0 ? (
        <div className="text-zinc-400">No trends</div>
      ) : (
        <ul className="divide-y divide-zinc-600">
          {topics.map((topic) => (
            <li key={topic.hashtag} className="flex items-center justify-between py-2">
              {topic.url ? (
                <a href={topic.url} target="_blank" rel="noopener noreferrer" className={itemClass + " hover:underline"}>
                  {topic.hashtag}
                </a>
              ) : (
                <span className={itemClass}>{topic.hashtag}</span>
              )}
              {typeof topic.count === 'number' && topic.count > 0 ? (
                <span className={countClass}>{topic.count} posts</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
