import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../../_utils";

async function forward(req: NextRequest, method: string) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const idIndex = parts.findIndex(p => p === 'users') + 1;
  const id = parts[idIndex];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const backendUrl = `${process.env.BACKEND_URL}/users/${encodeURIComponent(id)}/follow`;
  const result = await forwardWithAutoRefresh(req, backendUrl, { method });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}

export async function POST(req: NextRequest) {
  return forward(req, 'POST');
}

export async function DELETE(req: NextRequest) {
  return forward(req, 'DELETE');
}
