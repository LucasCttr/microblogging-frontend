import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../_utils";


export async function GET(req: NextRequest) {
  const userId = req.cookies.get('userId')?.value ?? null;
  if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  const backendUrl = `${process.env.BACKEND_URL}/users/${userId}`;
  const result = await forwardWithAutoRefresh(req, backendUrl, { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
