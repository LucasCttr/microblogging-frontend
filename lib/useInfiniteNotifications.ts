import { useEffect, useRef, useState, useCallback } from "react";

export function useInfiniteNotifications() {
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const url = `/api/notifications?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching notifications");
      const data = await res.json();
      setItems((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newItems = (data.items || []).filter((t: any) => !existingIds.has(t.id));
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
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchMore();
      }
    });
    observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
  }, [fetchMore, hasMore, loading]);

  useEffect(() => {
    fetchMore(); // load first page
    // eslint-disable-next-line
  }, []);

  return { items, loading, hasMore, loadMoreRef };
}
