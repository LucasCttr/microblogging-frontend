import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../_utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const backendUrl = new URL(`${process.env.BACKEND_URL}/trending`);

  let hasLimit = false;
  let hasCountry = false;
  let hasIncludeCounts = false;
  for (const [k, v] of searchParams.entries()) {
    if (v) backendUrl.searchParams.set(k, v);
    if (k === 'limit') hasLimit = true;
    if (k === 'country') hasCountry = true;
    if (k === 'includeCounts') hasIncludeCounts = true;
  }

  // Apply sensible defaults server-side if not provided
  if (!hasLimit) backendUrl.searchParams.set('limit', '10');
  if (!hasCountry) backendUrl.searchParams.set('country', 'united-states');
  if (!hasIncludeCounts) backendUrl.searchParams.set('includeCounts', 'true');

  const result = await forwardWithAutoRefresh(req, backendUrl.toString(), { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
