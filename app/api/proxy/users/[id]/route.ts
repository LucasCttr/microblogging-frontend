import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.length - 1];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const accessToken = req.cookies.get('accessToken')?.value;
  const backendUrl = `${process.env.BACKEND_URL}/users/${encodeURIComponent(id)}`;
  const backendRes = await fetch(backendUrl, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
      'Content-Type': 'application/json',
    },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
