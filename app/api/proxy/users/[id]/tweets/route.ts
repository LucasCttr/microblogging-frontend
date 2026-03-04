import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../../../_utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  // pathname like /api/proxy/users/:id/tweets
  const idIndex = parts.findIndex(p => p === 'users') + 1;
  const id = parts[idIndex];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { searchParams } = url;
  const type = searchParams.get('type');
  const cursor = searchParams.get('cursor');
  const limit = searchParams.get('limit');

  let backendUrl = `${process.env.BACKEND_URL}/tweets?authorId=${encodeURIComponent(id)}`;
  if (type) backendUrl += `&type=${encodeURIComponent(type)}`;
  if (cursor) backendUrl += `&cursor=${encodeURIComponent(cursor)}`;
  if (limit) backendUrl += `&limit=${encodeURIComponent(limit)}`;

  const result = await forwardWithAutoRefresh(req, backendUrl, { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
