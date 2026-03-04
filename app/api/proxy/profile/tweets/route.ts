import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../../_utils";

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('userId')?.value ?? null;
  if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const cursor = searchParams.get("cursor");
  const limit = searchParams.get("limit");
  let backendUrl = `${process.env.BACKEND_URL}/tweets?authorId=${encodeURIComponent(userId)}`;
  if (type) backendUrl += `&type=${encodeURIComponent(type)}`;
  if (cursor) backendUrl += `&cursor=${encodeURIComponent(cursor)}`;
  if (limit) backendUrl += `&limit=${encodeURIComponent(limit)}`;

  const result = await forwardWithAutoRefresh(req, backendUrl, { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
