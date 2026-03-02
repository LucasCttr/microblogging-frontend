import FeedClient from "./FeedClient";
import type { FeedResponse } from "@/types/feed";
import { Tweet } from "@/types/tweet";
import { cookies } from 'next/headers';

async function getFeed(): Promise<{ items: Tweet[]; nextCursor?: string | null }> {
  const backend = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
  const url = `${backend.replace(/\/$/, "")}/feed?take=20`;
  try {
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    } catch (e) {}
    const res = await fetch(url, { cache: 'no-store', headers });
    if (!res.ok) return { items: [] };
    const json = await res.json();
    if (Array.isArray(json)) return { items: json };
    return { items: json.items ?? [], nextCursor: json.nextCursor };
  } catch {
    return { items: [] };
  }
}

export default async function HomeFeedPage() {
  const { items, nextCursor } = await getFeed();
  return <FeedClient initialTweets={items} initialCursor={nextCursor} />;
}
