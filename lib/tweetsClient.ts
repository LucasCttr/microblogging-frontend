type TweetsParams = {
  authorId?: string;
  type?: string;
  cursor?: string | null;
  limit?: number;
  take?: number; // legacy for feed
};

interface TweetsResponse<T> {
  items: T[];
  nextCursor?: string | null;
}

export async function fetchTweets(params: TweetsParams = {}): Promise<TweetsResponse<any>> {
  const { authorId, type, cursor, limit, take } = params;
  const qs = new URLSearchParams();
  if (authorId) qs.append('authorId', authorId);
  if (type) qs.append('type', type);
  if (cursor) qs.append('cursor', cursor);
  // support both take (feed) and limit (profile)
  if (take) qs.append('take', String(take));
  else if (limit) qs.append('limit', String(limit));

  const base = authorId ? `/api/proxy/users/${encodeURIComponent(authorId)}/tweets` : '/api/proxy/tweets';
  const url = `${base}?${qs.toString()}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch tweets: ${res.status}`);
  const raw = await res.json();
  // normalize shapes: { items, nextCursor } or { data, cursor } or { items: [], meta: { nextCursor }}
  const items = raw?.items ?? raw?.data ?? raw?.tweets ?? [];
  const nextCursor = raw?.nextCursor ?? raw?.cursor ?? raw?.meta?.nextCursor ?? raw?.next_cursor ?? null;
  return { items, nextCursor };
}

export async function fetchTweetById(id: string) {
  if (!id) throw new Error('Missing id');
  const res = await fetch(`/api/proxy/tweets/${encodeURIComponent(id)}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch tweet ${id}: ${res.status}`);
  return res.json();
}
