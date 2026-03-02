export async function fetchTweetsClient() {
  const res = await fetch('/api/proxy/tweets', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch tweets');
  return res.json();
}

// Server-side helper for app routes or server components
// Server-side helper for app routes or server components
import { NextRequest } from "next/server";

export async function serverFetch(path: string, req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const url = `${process.env.BACKEND_URL}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: accessToken ? `Bearer ${accessToken}` : '' },
  });
  const data = await res.json();
  return { status: res.status, data };
}
