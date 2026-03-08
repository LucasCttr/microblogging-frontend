import { useCallback, useEffect, useRef, useState } from "react";
import type { Tweet } from "@/types/tweet";
import { fetchBookmarks } from "./bookmarksClient";

export function useInfiniteBookmarks(initialItems: Tweet[] = [], initialCursor?: string | null) {
  const [items, setItems] = useState<Tweet[]>(initialItems);
  const [cursor, setCursor] = useState<string | null | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchBookmarks({ cursor: cursor ?? undefined, limit: 20 });
      setItems((prev) => {
        const existing = new Set(prev.map((t) => t.id));
        const newItems = (data.items || []).filter((t) => !existing.has(t.id));
        return [...prev, ...newItems];
      });
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor && (data.items?.length ?? 0) > 0);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchMore();
    });
    observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
  }, [fetchMore, hasMore, loading]);

  return { items, loading, hasMore, loadMoreRef, setItems };
}
