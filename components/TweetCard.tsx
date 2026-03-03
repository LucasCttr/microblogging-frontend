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
              <img
                src={(() => {
                  const seed = (localTweet.author?.email ?? localTweet.author?.id ?? localTweet.author?.name ?? 'anon').toString();
                  return `https://api.dicebear.com/6.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
                })()}
                alt={(localTweet.author?.name ?? 'avatar')}
                className="h-10 w-10 rounded-full object-cover bg-zinc-200 dark:bg-zinc-700"
              />
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
              <span>🔁</span>
              <span>{localTweet.author?.name ?? "Someone"} retweeted</span>
            </div>
          )}
              {!currentRetweet && localTweet.parentId && !isNested && (
                <div className="mb-2 text-[13px] text-blue-500 dark:text-blue-400 flex items-center gap-2" style={{marginTop: '-4px'}}>
              <span>💬</span>
              <span>{localTweet.author?.name ?? "Someone"} replied</span>
            </div>
          )}

          {(() => {
            const retweeterText = localTweet.content ?? localTweet.text;
            if (currentRetweet) {
              return (
                <>
                  {retweeterText && (
                    <p className="mt-05 text-sm text-zinc-900 dark:text-zinc-100">{retweeterText}</p>
                  )}
                  <div className="mt-3 rounded-md border border-zinc-800 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>{currentRetweet.author?.name ?? "Unknown"}</strong>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">@{(currentRetweet.author?.email ?? currentRetweet.author?.name ?? "").toString().split("@") [0]}</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{currentRetweet.content ?? currentRetweet.text ?? ""}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                          <div className="flex items-center gap-3">
                            <span className={currentRetweet.likedByCurrentUser ? "font-bold text-red-500" : ""}>
                              ❤️ {currentRetweet.likesCount ?? 0}
                            </span>
                            <span className={currentRetweet.retweetedByCurrentUser ? "font-bold text-blue-500" : ""}>
                              🔁 {currentRetweet.retweetsCount ?? 0}
                            </span>
                            <span>💬 {currentRetweet.repliesCount ?? 0}</span>
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
            return <p className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-100">{localTweet.content ?? localTweet.text ?? ""}</p>;
          })()}

          <div className="mt-3 flex items-center justify-between text-sm text-zinc-500 tweet-actions">
            <div className="flex items-center gap-4">
              <span
                className={localTweet.likedByCurrentUser ? "font-bold text-red-500 cursor-pointer" : "cursor-pointer"}
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                title={localTweet.likedByCurrentUser ? "Quitar like" : "Dar like"}
              >
                ❤️ {localTweet.likesCount ?? 0}
              </span>
              <span
                className={localTweet.retweetedByCurrentUser ? "font-bold text-blue-500 cursor-pointer" : "cursor-pointer"}
                onClick={(e) => { e.stopPropagation(); handleRetweet(); }}
                title={localTweet.retweetedByCurrentUser ? "Quitar retweet" : "Dar retweet"}
              >
                🔁 {localTweet.retweetsCount ?? 0}
              </span>
              <span>💬 {localTweet.repliesCount ?? 0}</span>
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500">{localTweet.createdAt ? new Date(localTweet.createdAt).toLocaleString() : "Fecha desconocida"}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
