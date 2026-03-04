import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../../_utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const backendUrl = new URL(`${process.env.BACKEND_URL}/users`);
  for (const [k, v] of searchParams.entries()) {
    if (v) backendUrl.searchParams.set(k, v);
  }

  const result = await forwardWithAutoRefresh(req, backendUrl.toString(), { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
