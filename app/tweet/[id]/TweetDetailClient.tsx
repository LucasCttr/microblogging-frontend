"use client";
import TweetCard from "@/components/TweetCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tweet } from "@/types/tweet";

export default function TweetDetailClient({ tweet }: { tweet: Tweet }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Tweet[]>(tweet.replies ?? []);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/tweets/${tweet.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment.trim() }),
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Error: ${res.status} ${body}`);
      }
      setComment("");
      const newReply = await res.json().catch(() => null);
      if (newReply) setReplies((prev) => [newReply, ...prev]);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="rounded-md overflow-hidden border">
        <div className="rounded-t-md">
          <TweetCard tweet={tweet} />
        </div>
        <section className="border-t rounded-b-md">
          <form onSubmit={handleCommentSubmit} className="p-4 border-b bg-transparent">
            <label className="sr-only">Nuevo comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full min-h-[48px] resize-none rounded-md border p-2 text-base text-zinc-900 dark:text-zinc-100 bg-transparent border-zinc-200 dark:border-zinc-700"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              {error && <div className="text-sm text-red-600 mr-auto">{error}</div>}
              <Button
                type="submit"
                disabled={loading || !comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition-colors"
              >
                {loading ? "Commenting..." : "Comment"}
              </Button>
            </div>
          </form>
          <div>
            {replies.length ? (
              replies.map((reply: Tweet) => (
                <TweetCard key={reply.id} tweet={reply} depth={1} />
              ))
            ) : (
              <div className="p-4 text-center text-sm text-zinc-500">No comments yet</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
