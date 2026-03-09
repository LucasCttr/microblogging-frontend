"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useInfiniteNotifications } from "@/lib/useInfiniteNotifications";



export default function NotificationsPage() {
  const router = useRouter();
  const { items, loading, hasMore, loadMoreRef } = useInfiniteNotifications();

  function handleClickNotification(id: string, url?: string) {
    // Optionally mark as read here
    if (url) router.push(url);
  }
  
  // Card anidada para mostrar el tweet original del usuario logueado
  function ShowOwnTweetCard({ tweet }: { tweet: any }) {
    // Obtener usuario logueado desde window.__USER__ (debería setearse en _app o layout)
    const [user, setUser] = React.useState<{ id?: string; name?: string | null; email?: string | null; username?: string | null } | null>(null);
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        if ((window as any).__USER__) {
          setUser((window as any).__USER__);
        } else {
          // Leer de cookies si no está window.__USER__
          const getCookie = (name: string) => {
            const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? decodeURIComponent(v[2]) : undefined;
          };
          const id = getCookie('userId');
          const name = getCookie('userName');
          const email = getCookie('userEmail');
          if (id || name || email) {
            setUser({ id, name, email });
          }
        }
      }
    }, []);
    let name = user?.name;
    let handle = user?.username
      ?? (user?.email ? user.email.split("@")[0] : undefined)
      ?? (user?.id ? user.id.slice(0, 8) : undefined)
      ?? undefined;
    if (!user) {
      // fallback: mostrar id del tweet si no hay user
      name = '';
      handle = tweet.authorId ? tweet.authorId.slice(0, 8) : '';
    }
    return (
      <div className="mt-2 p-3 rounded border border-zinc-700 bg-zinc-900 w-full flex flex-col self-stretch" style={{width: '100vw', maxWidth: '100%', minWidth: 0, alignSelf: 'stretch'}}>
        <div className="flex items-center gap-2 mb-1">
          {name && <span className="font-semibold text-zinc-200">{user?.name}</span>}
          {handle && <span className="text-xs text-zinc-400">@{handle}</span>}
        </div>
        <div className="text-zinc-100 text-sm break-words whitespace-pre-line">{tweet.content}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <main className="w-full">
        {/* Mark all notifications read on mount */}
        <MarkAllReadOnMount />
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-0 text-white text-center">Notifications</h1>
            {items.length === 0 && !loading && <div className="text-zinc-500">No hay notificaciones.</div>}
          </div>
          <div className="border-t border-[#262629] divide-y divide-[#262629]">
            {items.map((it) => {
            let url: string | undefined = it.url;
            try {
              if (typeof url === 'string' && url.includes('/user/')) {
                url = url.replace(/\/user\//, '/profile/');
              }
            } catch {}
            if (it.targetType === 'TWEET' && it.targetId) url = `/tweet/${it.targetId}`;
            else if (typeof it.action === 'string' && it.action.toLowerCase().includes('follow')) {
              const actorUsername = it.actor?.username ?? it.actor?.handle;
              const actorId = it.actor?.id;
              if (actorUsername) url = `/profile/${actorUsername}`;
              else if (actorId) url = `/profile/${actorId}`;
            }
            const actor = it.actor ?? ({} as any);
            const actorImage = (actor.image ?? actor.profileImage) as string | undefined;
            const actorName = actor.name ?? actor.username ?? actor.email ?? 'Unknown';
            const actorHandle =
              actor.username
              ?? actor.handle
              ?? (actor.email ? actor.email.split("@")[0] : undefined)
              ?? (actor.id ? actor.id.slice(0, 8) : undefined)
              ?? "anon";
            return (
              <div
                key={it.id}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 ${it.read ? 'opacity-60' : ''}`}
                onClick={() => handleClickNotification(it.id, url)}
              >
                <div className="flex-shrink-0">
                  {(() => {
                    const provided = Boolean(actorImage && actorImage.trim());
                    const isGenerated = provided && /dicebear|identicon|gravatar|ui-avatars|avatars\.github/i.test(actorImage as string);
                    const shouldShowInitial = !provided || isGenerated;
                    const label = (actorName || 'U').toString();
                    const initial = String(label).charAt(0).toUpperCase();
                    if (!shouldShowInitial && actorImage) {
                      return (
                        <img
                          src={actorImage}
                          alt={actorName}
                          className="h-10 w-10 rounded-full object-cover bg-zinc-200 dark:bg-zinc-700"
                        />
                      );
                    }
                    return (
                      <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {initial}
                      </div>
                    );
                  })()}
                </div>
                <div className="text-sm text-zinc-800 dark:text-zinc-100 truncate">
                  <strong>{actorName}</strong>{" "}
                  <span className="text-xs text-zinc-500">
                    @{actorHandle} · {it.action}
                  </span>
                  <div className="text-xs text-zinc-400">
                    {it.createdAt && (
                      <>{new Date(it.createdAt).toLocaleString()}</>
                    )}
                  </div>
                  {it.tweet && (
                    <ShowOwnTweetCard tweet={it.tweet} />
                  )}
                </div>
              </div>
            );
          })}
            <div ref={loadMoreRef} />
          </div>
        {loading && <div className="mt-4 text-zinc-500">Cargando…</div>}
      </main>
    </div>
  );
}

function MarkAllReadOnMount() {
  React.useEffect(() => {
    let cancelled = false;
    async function markAll() {
      try {
        const res = await fetch('/api/notifications/mark-read', { method: 'POST', credentials: 'include' });
        if (!res.ok) return;
        if (cancelled) return;
        try { window.dispatchEvent(new CustomEvent('notifications:markedAllRead')); } catch (e) {}
      } catch (e) {
        // ignore
      }
    }
    markAll();
    return () => { cancelled = true; };
  }, []);
  return null;
}
