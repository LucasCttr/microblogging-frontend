import BookmarksClient from "./BookmarksClient";
import type { Tweet } from "@/types/tweet";
import { cookies } from 'next/headers';

async function getBookmarks(): Promise<{ items: Tweet[]; nextCursor?: string | null }> {
  const url = `/api/proxy/bookmarks?limit=20`;
  try {
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('accessToken')?.value;
      const refreshToken = cookieStore.get('refreshToken')?.value;
      const cookiePairs: string[] = [];
      if (accessToken) cookiePairs.push(`accessToken=${accessToken}`);
      if (refreshToken) cookiePairs.push(`refreshToken=${refreshToken}`);
      if (cookiePairs.length) headers['Cookie'] = cookiePairs.join('; ');
    } catch (e) {}
    const res = await fetch(url, { cache: 'no-store', headers });
    if (!res.ok) return { items: [] };
    const json = await res.json();
    // Backend may return either an array, or an object with `items`, or an object with `data` containing the array.
    if (Array.isArray(json)) return { items: json };
    const items = Array.isArray(json.items)
      ? json.items
      : Array.isArray(json.data)
      ? json.data
      : [];
    const nextCursor = json.nextCursor ?? json.next_cursor ?? null;
    return { items, nextCursor };
  } catch {
    return { items: [] };
  }
}

export default async function BookmarksPage() {
  const { items, nextCursor } = await getBookmarks();
  return <BookmarksClient initialItems={items} initialCursor={nextCursor} />;
}
