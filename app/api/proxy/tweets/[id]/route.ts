import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import forwardWithAutoRefresh from "../../_utils";

export async function GET(req: NextRequest, context: any) {
  const params = await (context as any).params;
  const id = params?.id;
  const backendUrl = `${process.env.BACKEND_URL}/tweets/${encodeURIComponent(id)}`;
  const result = await forwardWithAutoRefresh(req, backendUrl, { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
