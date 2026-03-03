"use client";
import { useInfiniteFeed } from "@/lib/useInfiniteFeed";
import TweetCard from "@/components/TweetCard";
import NewTweetComposer from "@/components/NewTweetComposer";
import type { Tweet } from "@/types/tweet";

export default function FeedClient({ initialTweets, initialCursor }: { initialTweets: Tweet[]; initialCursor?: string | null }) {
  const { tweets, loading, hasMore, loadMoreRef, setTweets } = useInfiniteFeed(initialTweets, initialCursor);

  // Callback para agregar el nuevo tweet al inicio del feed, evitando duplicados por id
  const handleNewTweet = (tweet: Tweet) => {
    setTweets((prev: Tweet[]) => {
      if (prev.some((t) => t.id === tweet.id)) {
        return prev;
      }
      return [tweet, ...prev];
    });
  };

  return (
    <div className="mx-auto max-w-3xl border-l border-r border-white dark:border-white min-h-[calc(100vh-4rem)]">
      <main className="max-w-2xl mx-auto p-4">
        <section className="rounded-md overflow-hidden border border-zinc-800 dark:border-zinc-700">
          <div className="border-b-0">
            <NewTweetComposer onTweetCreated={handleNewTweet} />
          </div>
          {tweets.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No tweets yet</div>
          ) : (
            tweets.map((t, i) => (
              <TweetCard key={t.id} tweet={t} onRetweet={handleNewTweet} noBorderTop={i === 0} />
            ))
          )}
          <div ref={loadMoreRef} />
          {loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
          {!hasMore && tweets.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more tweets</div>}
        </section>
      </main>
    </div>
  );
}
