"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  actor?: { username?: string; email?: string; handle?: string; id?: string };
  action?: string;
  textPreview?: string;
  createdAt: string;
  read?: boolean;
  url?: string;
  targetType?: string;
  targetId?: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function fetchNotifications(cursor?: string) {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/notifications?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching notifications");
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.items || [])]);
      setNextCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  function handleLoadMore() {
    if (nextCursor) fetchNotifications(nextCursor);
  }

  function handleClickNotification(id: string, url?: string) {
    // Optionally mark as read here
    if (url) router.push(url);
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {items.length === 0 && !loading && <div className="text-zinc-500">No notifications to show.</div>}
      <div className="space-y-2">
        {items.map((it) => {
          let url: string | undefined = it.url;
          try {
            if (typeof url === 'string' && url.includes('/user/')) {
              url = url.replace(/\/user\//, '/profile/');
            }
          } catch {}
          if (!url) {
            if (it.targetType === 'TWEET' && it.targetId) url = `/tweet/${it.targetId}`;
            else if (typeof it.action === 'string' && it.action.toLowerCase().includes('follow')) {
              const actorUsername = it.actor?.username ?? it.actor?.handle;
              const actorId = it.actor?.id;
              if (actorUsername) url = `/profile/${actorUsername}`;
              else if (actorId) url = `/profile/${actorId}`;
            }
          }
          return (
            <div
              key={it.id}
              className={`p-3 border rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 ${it.read ? 'opacity-60' : ''}`}
              onClick={() => handleClickNotification(it.id, url)}
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex-1">
                  <div className="text-sm text-zinc-800 dark:text-zinc-100"><strong>{it.actor?.username ?? it.actor?.email}</strong> <span className="text-xs text-zinc-500">{it.action}</span></div>
                  {it.textPreview && <div className="text-xs text-zinc-500 mt-1">{it.textPreview}</div>}
                  <div className="text-xs text-zinc-400 mt-1">{new Date(it.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {hasMore && !loading && (
        <button onClick={handleLoadMore} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Cargar más</button>
      )}
      {loading && <div className="mt-4 text-zinc-500">Cargando…</div>}
    </div>
  );
}
