"use client";
import React from "react";
import { useInfiniteBookmarks } from "@/lib/useInfiniteBookmarks";
import TweetCard from "@/components/TweetCard";
import type { Tweet } from "@/types/tweet";

export default function BookmarksClient({ initialItems, initialCursor }: { initialItems: Tweet[]; initialCursor?: string | null }) {
  const { items, loading, hasMore, loadMoreRef, setItems } = useInfiniteBookmarks(initialItems, initialCursor);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <main className="w-full">
        <div className="w-full inner-bg">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No bookmarks yet</div>
          ) : (
            items.map((t, i) => (
              <TweetCard key={t.id} tweet={t} onRetweet={() => {}} noBorderTop={i === 0} />
            ))
          )}
          <div ref={loadMoreRef} />
          {loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
          {!hasMore && items.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more bookmarks</div>}
        </div>
      </main>
    </div>
  );
}
