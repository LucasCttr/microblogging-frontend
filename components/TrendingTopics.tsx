"use client";
import React, { useEffect, useState } from "react";

interface TrendingTopic {
  hashtag: string;
  count?: number;
  url?: string | null;
}

export default function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const res = await fetch(`/api/proxy/trending?limit=10&includeCounts=true`, { credentials: "include" });
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
          setTopics(normalized.slice(0, 10));
        }
      } catch (e) {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  return (
    <div className="w-full max-w-[380px] mx-auto mt-4 rounded-md shadow border border-zinc-600 p-4" style={{ backgroundColor: '#0b0b0b' }}>
      <h2 className="text-lg font-bold mb-1 text-zinc-100">Trending topics</h2>
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : topics.length === 0 ? (
        <div className="text-zinc-400">No trends</div>
      ) : (
        <ul className="divide-y divide-zinc-600">
          {topics.map((topic) => (
            <li key={topic.hashtag} className="flex items-center justify-between py-2">
              {topic.url ? (
                <a href={topic.url} target="_blank" rel="noopener noreferrer" className="text-zinc-100 font-medium hover:underline">
                  {topic.hashtag}
                </a>
              ) : (
                <span className="text-zinc-100 font-medium">{topic.hashtag}</span>
              )}
              {typeof topic.count === 'number' && topic.count > 0 ? (
                <span className="text-xs text-zinc-400">{topic.count} posts</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
