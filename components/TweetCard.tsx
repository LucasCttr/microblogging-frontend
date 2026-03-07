"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
      style={{ cursor: "pointer", backgroundColor: isNested ? undefined : '#0b0b0b' }}
    >
      <div className="flex items-start gap-3">
        <div>
          <Link
            href={localTweet.author?.id ? `/profile/${localTweet.author.id}` : "#"}
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
          </Link>
        </div>
        <div className="flex-1">

          <div className="mt-0.5 mb-1 flex items-center gap-2 text-base text-zinc-700 dark:text-zinc-300" style={{marginTop: '-3px'}}>
            <Link
              href={localTweet.author?.id ? `/profile/${localTweet.author.id}` : "#"}
              onClick={e => e.stopPropagation()}
              className="font-bold hover:underline"
            >
              {localTweet.author?.name ?? "Unknown"}
            </Link>
            <Link
              href={
                localTweet.author?.email
                  ? `/profile/${localTweet.author.email.split("@") [0]}`
                  : localTweet.author?.id
                    ? `/profile/${localTweet.author.id}`
                    : "#"
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
            </Link>
          </div>
              {currentRetweet && !isNested && (
                <div className="mb-2 text-[13px] text-blue-500 dark:text-blue-400 flex items-center gap-2" style={{marginTop: '-4px'}}>
                {/* Lucide Repeat2 (retweet, estilo Twitter/X) */}
                <svg className="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span>{localTweet.author?.name ?? "Someone"} retweeted</span>
              </div>
          )}
              {!currentRetweet && localTweet.parentId && !isNested && (
                <div className="mb-2 text-[13px] text-blue-500 dark:text-blue-400 flex items-center gap-2" style={{marginTop: '-4px'}}>
              {/* Heroicons Chat Bubble Left (outline) para reply */}
              <svg className="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-4.556 4.694-8.25 10.5-8.25s10.5 3.694 10.5 8.25-4.694 8.25-10.5 8.25c-1.086 0-2.136-.12-3.125-.34a.75.75 0 00-.625.13l-3.25 2.5a.75.75 0 01-1.2-.6v-2.11a.75.75 0 00-.22-.53A7.457 7.457 0 012.25 12z" />
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
                  <div
                    className="mt-3 rounded-md border border-zinc-800 p-3 cursor-pointer transition"
                    style={{ backgroundColor: '#1b1c1f' }}
                    onClick={e => {
                      e.stopPropagation();
                      if (currentRetweet?.id) router.push(`/tweet/${currentRetweet.id}`);
                    }}
                  >
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
                        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-2 ${currentRetweet.likedByCurrentUser ? "font-semibold" : ""}`}>
                              <svg className={`${currentRetweet.likedByCurrentUser ? "h-4 w-4 text-red-500" : "h-4 w-4 text-zinc-500 dark:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.657 0-3.156.832-4 2.09C10.156 4.582 8.657 3.75 7 3.75c-2.761 0-5 2.015-5 4.5 0 7.25 10 12 10 12s10-4.75 10-12z" />
                              </svg>
                              <span className={`${currentRetweet.likedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{currentRetweet.likesCount ?? 0}</span>
                            </span>
                            <span className={`flex items-center gap-2 ${currentRetweet.retweetedByCurrentUser ? "font-semibold" : ""}`}>
                              <svg className={`${currentRetweet.retweetedByCurrentUser ? "h-4 w-4 text-blue-500" : "h-4 w-4 text-zinc-500 dark:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                                <polyline points="17 1 21 5 17 9" />
                                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                <polyline points="7 23 3 19 7 15" />
                                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                              </svg>
                              <span className={`${currentRetweet.retweetedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{currentRetweet.retweetsCount ?? 0}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-4.556 4.694-8.25 10.5-8.25s10.5 3.694 10.5 8.25-4.694 8.25-10.5 8.25c-1.086 0-2.136-.12-3.125-.34a.75.75 0 00-.625.13l-3.25 2.5a.75.75 0 01-1.2-.6v-2.11a.75.75 0 00-.22-.53A7.457 7.457 0 012.25 12z" />
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
            <div className="flex items-center gap-4 -ml-2">
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-2 py-1 rounded-md transition ${localTweet.likedByCurrentUser ? "bg-transparent font-semibold" : "hover:bg-zinc-800/50 dark:hover:bg-zinc-700/50"}`}
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                title={localTweet.likedByCurrentUser ? "Quitar like" : "Dar like"}
              >
                {/* Heroicons Heart (outline) */}
                <svg className={`${localTweet.likedByCurrentUser ? "h-4 w-4 text-red-500" : "h-4 w-4 text-zinc-500 dark:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.657 0-3.156.832-4 2.09C10.156 4.582 8.657 3.75 7 3.75c-2.761 0-5 2.015-5 4.5 0 7.25 10 12 10 12s10-4.75 10-12z" />
                </svg>
                <span className={`${localTweet.likedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{localTweet.likesCount ?? 0}</span>
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-2 py-1 rounded-md transition ${localTweet.retweetedByCurrentUser ? "bg-transparent font-semibold" : "hover:bg-zinc-800/50 dark:hover:bg-zinc-700/50"}`}
                onClick={(e) => { e.stopPropagation(); handleRetweet(); }}
                title={localTweet.retweetedByCurrentUser ? "Quitar retweet" : "Dar retweet"}
              >
                {/* Lucide Repeat2 (retweet, estilo Twitter/X) */}
                <svg className={`${localTweet.retweetedByCurrentUser ? "h-4 w-4 text-blue-500" : "h-4 w-4 text-zinc-500 dark:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span className={`${localTweet.retweetedByCurrentUser ? "font-semibold text-zinc-50" : "text-zinc-400 dark:text-zinc-400"}`}>{localTweet.retweetsCount ?? 0}</span>
              </button>
              <div className="inline-flex items-center gap-2 px-2 py-1 text-zinc-400 dark:text-zinc-400">
                {/* Heroicons Chat Bubble Left (outline) */}
                <svg className="h-4 w-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-4.556 4.694-8.25 10.5-8.25s10.5 3.694 10.5 8.25-4.694 8.25-10.5 8.25c-1.086 0-2.136-.12-3.125-.34a.75.75 0 00-.625.13l-3.25 2.5a.75.75 0 01-1.2-.6v-2.11a.75.75 0 00-.22-.53A7.457 7.457 0 012.25 12z" />
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
