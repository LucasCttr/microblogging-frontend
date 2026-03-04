"use client";

import React, { useEffect, useState } from "react";
import type { Tweet } from "@/types/tweet";

import { useRouter } from "next/navigation";

type TweetCardProps = {
  tweet: Tweet;
  depth?: number;
  onRetweet?: (tweet: Tweet) => void;
  onShow?: (tweet: Tweet) => void;
  noBorderTop?: boolean;
};

export default function TweetCard({ tweet, depth = 0, onRetweet, onShow, noBorderTop }: TweetCardProps) {
    const router = useRouter();
  const [localTweet, setLocalTweet] = useState<Tweet>(tweet);
  const [resolved, setResolved] = useState<Tweet | null | undefined>(tweet.retweetOf ?? undefined);

  useEffect(() => {
    setLocalTweet(tweet);
  }, [tweet]);
  // Removed duplicate declaration of resolved and setResolved

  useEffect(() => {
    let mounted = true;
    async function resolveRetweet() {
      if (localTweet.retweetOf) {
        if (mounted) setResolved(localTweet.retweetOf);
        return;
      }
      if (!localTweet.retweetOfId) {
        if (mounted) setResolved(null);
        return;
      }
      try {
        const res = await fetch(`/api/proxy/tweets/${encodeURIComponent(localTweet.retweetOfId)}`, {
          credentials: "include",
        });
        if (!mounted) return;
        if (!res.ok) {
          setResolved(null);
          return;
        }
        const json = await res.json();
        setResolved(json ?? null);
      } catch (e) {
        if (!mounted) return;
        setResolved(null);
      }
    }
    resolveRetweet();
    return () => {
      mounted = false;
    };
  }, [localTweet.retweetOf, localTweet.retweetOfId]);

  // Like/Retweet handlers
  async function handleLike() {
    const endpoint = `/api/proxy/tweets/${localTweet.id}/like`;
    const method = localTweet.likedByCurrentUser ? "DELETE" : "POST";
    console.log(`[LIKE] ${method} ${endpoint}`);
    try {
      const res = await fetch(endpoint, { method, credentials: "include" });
      console.log(`[LIKE] response`, res);
      if (res.ok) {
        const updated = await res.json();
        setLocalTweet((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error(`[LIKE] error`, err);
    }
  }

  async function handleRetweet() {
    const endpoint = `/api/proxy/tweets/${localTweet.id}/retweet`;
    if (!localTweet.retweetedByCurrentUser) {
      // Crear retweet usando el endpoint correcto
      console.log(`[RETWEET] POST ${endpoint}`);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
        });
        console.log(`[RETWEET] response`, res);
        if (res.ok) {
          const newRetweet = await res.json();
          console.log(`[RETWEET] newRetweet`, newRetweet);
          setLocalTweet((prev) => ({ ...prev, retweetedByCurrentUser: true, retweetsCount: (prev.retweetsCount ?? 0) + 1 }));
          if (onRetweet && newRetweet) onRetweet(newRetweet);
        }
      } catch (err) {
        console.error(`[RETWEET] error`, err);
      }
    } else {
      // Eliminar el retweet
      console.log(`[RETWEET] DELETE ${endpoint}`);
      // Optimistic UI: desmarcar antes de la respuesta
      try {
        const res = await fetch(endpoint, { method: "DELETE", credentials: "include" });
        console.log(`[RETWEET] response`, res);
        if (res.ok) {
          const updated = await res.json();
          setLocalTweet((prev) => ({ ...prev, ...updated }));
        }
      } catch (err) {
        console.error(`[RETWEET] error`, err);
      }
    }
  }

  const isNested = (depth ?? 0) > 0;
  const currentRetweet = resolved ?? null;

  function handleShowTweet(e: React.MouseEvent) {
    // Evitar que los botones de like/retweet disparen la navegación
    if ((e.target as HTMLElement).closest(".tweet-actions")) return;
    router.push(`/tweet/${localTweet.id}`);
    if (onShow) onShow(localTweet);
  }

  return (
    <article
      className={
        isNested
          ? "p-3"
          : `p-4 ${noBorderTop ? '' : 'border-t border-zinc-800 dark:border-zinc-700'}`
      }
      onClick={handleShowTweet}
      style={{ cursor: "pointer" }}
    >
      <div className="flex items-start gap-3">
        <div>
          <a
            href={localTweet.author?.id ? `/profile/${localTweet.author.id}` : undefined}
            onClick={e => e.stopPropagation()}
          >
            {localTweet.author?.image ? (
              <img
                src={localTweet.author.image}
                alt={localTweet.author?.name ?? 'avatar'}
                className="h-10 w-10 rounded-full object-cover bg-zinc-200 dark:bg-zinc-700"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {((localTweet.author?.name ?? localTweet.author?.email ?? localTweet.author?.id ?? 'A') + '').charAt(0).toString().toUpperCase()}
              </div>
            )}
          </a>
        </div>
        <div className="flex-1">

          <div className="mt-0.5 mb-1 flex items-center gap-2 text-base text-zinc-700 dark:text-zinc-300" style={{marginTop: '-3px'}}>
            <a
              href={localTweet.author?.id ? `/profile/${localTweet.author.id}` : undefined}
              onClick={e => e.stopPropagation()}
              className="font-bold hover:underline"
            >
              {localTweet.author?.name ?? "Unknown"}
            </a>
            <a
              href={
                localTweet.author?.email
                  ? `/profile/${localTweet.author.email.split("@")[0]}`
                  : localTweet.author?.id
                    ? `/profile/${localTweet.author.id}`
                    : undefined
              }
              onClick={e => e.stopPropagation()}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
            >
              {(() => {
                const email = (localTweet as any).author?.email;
                const name = (localTweet as any).author?.name;
                const id = (localTweet as any).author?.id;
                const handle = email
                  ? String(email).split("@") [0]
                  : name
                  ? String(name).replace(/\s+/g, "").toLowerCase()
                  : id
                    ? String(id).slice(0, 8)
                    : "anon";
                return `@${handle}`;
              })()}
            </a>
          </div>
              {currentRetweet && !isNested && (
                <div className="mb-2 text-[13px] text-blue-500 dark:text-blue-400 flex items-center gap-2" style={{marginTop: '-4px'}}>
                <svg suppressHydrationWarning className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M23 7v6h-6l3.29-3.29L13 4l-1.41 1.41L18.59 10H23zM1 17v-6h6l-3.29 3.29L11 20l1.41-1.41L5.41 14H1z" />
                </svg>
                <span>{localTweet.author?.name ?? "Someone"} retweeted</span>
              </div>
          )}
              {!currentRetweet && localTweet.parentId && !isNested && (
                <div className="mb-2 text-[13px] text-blue-500 dark:text-blue-400 flex items-center gap-2" style={{marginTop: '-4px'}}>
              <svg suppressHydrationWarning className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 6h-2v9H7l-4 4V6c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z" />
              </svg>
              <span>{localTweet.author?.name ?? "Someone"} replied</span>
            </div>
          )}

          {(() => {
            const retweeterText = localTweet.content ?? localTweet.text;
            if (currentRetweet) {
              return (
                <>
                  {retweeterText && (
                    <p className="mt-05 text-sm text-zinc-900 dark:text-zinc-100 break-words whitespace-pre-line">{retweeterText}</p>
                  )}
                  <div className="mt-3 rounded-md border border-zinc-800 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-800 dark:text-zinc-100">
                        {((currentRetweet?.author?.name ?? currentRetweet?.author?.email ?? 'A') + '').charAt(0).toString().toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>{currentRetweet.author?.name ?? "Unknown"}</strong>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">@{(currentRetweet.author?.email ?? currentRetweet.author?.name ?? "").toString().split("@") [0]}</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100 break-words whitespace-pre-line">{currentRetweet.content ?? currentRetweet.text ?? ""}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-2 ${currentRetweet.likedByCurrentUser ? "font-semibold" : ""}`}>
                              <svg suppressHydrationWarning className={`${currentRetweet.likedByCurrentUser ? "h-5 w-5 text-red-500" : "h-5 w-5 text-zinc-500 dark:text-zinc-400"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                              <span className={`${currentRetweet.likedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{currentRetweet.likesCount ?? 0}</span>
                            </span>
                            <span className={`flex items-center gap-2 ${currentRetweet.retweetedByCurrentUser ? "font-semibold" : ""}`}>
                              <svg suppressHydrationWarning className={`${currentRetweet.retweetedByCurrentUser ? "h-5 w-5 text-blue-500" : "h-5 w-5 text-zinc-500 dark:text-zinc-400"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M23 7v6h-6l3.29-3.29L13 4l-1.41 1.41L18.59 10H23zM1 17v-6h6l-3.29 3.29L11 20l1.41-1.41L5.41 14H1z" />
                              </svg>
                              <span className={`${currentRetweet.retweetedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{currentRetweet.retweetsCount ?? 0}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <svg suppressHydrationWarning className="h-5 w-5 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M21 6h-2v9H7l-4 4V6c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z" />
                              </svg>
                              <span className="text-zinc-400 dark:text-zinc-400">{currentRetweet.repliesCount ?? 0}</span>
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">{currentRetweet.createdAt ? new Date(currentRetweet.createdAt).toLocaleString() : "Fecha desconocida"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            }
            // Fallback: show retweeter content (if any)
            return <p className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-100 break-words whitespace-pre-line w-full" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{localTweet.content ?? localTweet.text ?? ""}</p>;
          })()}

          <div className="mt-3 flex items-center justify-between text-sm text-zinc-500 tweet-actions">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-2 py-1 rounded-md transition ${localTweet.likedByCurrentUser ? "bg-transparent font-semibold" : "hover:bg-zinc-800/50 dark:hover:bg-zinc-700/50"}`}
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                title={localTweet.likedByCurrentUser ? "Quitar like" : "Dar like"}
              >
                <svg suppressHydrationWarning className={`${localTweet.likedByCurrentUser ? "h-5 w-5 text-red-500" : "h-5 w-5 text-zinc-500 dark:text-zinc-400"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className={`${localTweet.likedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{localTweet.likesCount ?? 0}</span>
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-2 py-1 rounded-md transition ${localTweet.retweetedByCurrentUser ? "bg-transparent font-semibold" : "hover:bg-zinc-800/50 dark:hover:bg-zinc-700/50"}`}
                onClick={(e) => { e.stopPropagation(); handleRetweet(); }}
                title={localTweet.retweetedByCurrentUser ? "Quitar retweet" : "Dar retweet"}
              >
                <svg suppressHydrationWarning className={`${localTweet.retweetedByCurrentUser ? "h-5 w-5 text-blue-500" : "h-5 w-5 text-zinc-500 dark:text-zinc-400"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23 7v6h-6l3.29-3.29L13 4l-1.41 1.41L18.59 10H23zM1 17v-6h6l-3.29 3.29L11 20l1.41-1.41L5.41 14H1z" />
                </svg>
                <span className={`${localTweet.retweetedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{localTweet.retweetsCount ?? 0}</span>
              </button>
              <div className="inline-flex items-center gap-2 px-2 py-1 text-zinc-400 dark:text-zinc-400">
                <svg suppressHydrationWarning className="h-5 w-5 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M21 6h-2v9H7l-4 4V6c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z" />
                </svg>
                <span>{localTweet.repliesCount ?? 0}</span>
              </div>
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500">{localTweet.createdAt ? new Date(localTweet.createdAt).toLocaleString() : "Fecha desconocida"}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
