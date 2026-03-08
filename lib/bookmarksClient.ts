type BookmarksParams = {
  cursor?: string | null;
  limit?: number;
};

interface BookmarksResponse<T> {
  items: T[];
  nextCursor?: string | null;
}

export async function fetchBookmarks(params: BookmarksParams = {}): Promise<BookmarksResponse<any>> {
  const { cursor, limit } = params;
  const qs = new URLSearchParams();
  if (cursor) qs.append('cursor', cursor);
  if (limit) qs.append('limit', String(limit));
  const url = `/api/proxy/bookmarks?${qs.toString()}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch bookmarks: ${res.status}`);
  const raw = await res.json();
  const items = raw?.items ?? raw?.data ?? raw ?? [];
  const nextCursor = raw?.nextCursor ?? raw?.cursor ?? raw?.next_cursor ?? null;
  return { items, nextCursor };
}
