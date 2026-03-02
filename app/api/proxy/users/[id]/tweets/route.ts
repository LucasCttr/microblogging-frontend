import { NextRequest, NextResponse } from "next/server";

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
  const accessToken = req.cookies.get('accessToken')?.value;

  let backendUrl = `${process.env.BACKEND_URL}/tweets?authorId=${encodeURIComponent(id)}`;
  if (type) backendUrl += `&type=${encodeURIComponent(type)}`;
  if (cursor) backendUrl += `&cursor=${encodeURIComponent(cursor)}`;
  if (limit) backendUrl += `&limit=${encodeURIComponent(limit)}`;

  const backendRes = await fetch(backendUrl, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
      'Content-Type': 'application/json',
    },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
