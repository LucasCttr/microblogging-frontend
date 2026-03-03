import type { Tweet } from "@/types/tweet";
import { cookies } from 'next/headers';
import TweetDetailClient from "./TweetDetailClient";

async function fetchTweet(id: string): Promise<Tweet> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  } catch (e) {}
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/tweets/${id}`, { headers });
  if (!res.ok) throw new Error("Tweet not found");
  return res.json();
}

export default async function TweetDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const tweet = await fetchTweet(id);
  return (
    <div className="mx-auto max-w-3xl border-l border-r border-white dark:border-white min-h-[calc(100vh-4rem)]">
      <TweetDetailClient tweet={tweet} />
    </div>
  );
}
