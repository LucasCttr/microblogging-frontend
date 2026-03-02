import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const userId = req.cookies.get('userId')?.value;
  if (!accessToken || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const backendRes = await fetch(`${process.env.BACKEND_URL}/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
