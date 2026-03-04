import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import forwardWithAutoRefresh from "../_utils";

export async function GET(req: NextRequest) {
  // Obtener los parámetros de la query string
  const { searchParams } = new URL(req.url);
  const hasSearch = searchParams.has('q') || searchParams.has('content') || searchParams.has('sort');
  const targetPath = hasSearch ? '/tweets' : '/feed';
  const backendUrl = new URL(`${process.env.BACKEND_URL}${targetPath}`);
  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;
    backendUrl.searchParams.set(key, value);
  }

  const result = await forwardWithAutoRefresh(req, backendUrl.toString(), { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) {
    res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  }
  if (result.newRefreshToken) {
    res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  }
  return res;
}

export async function POST(req: NextRequest) {
  let body: any = null;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const backendUrl = `${process.env.BACKEND_URL}/tweets`;
  const result = await forwardWithAutoRefresh(req, backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const res = NextResponse.json(result.data ?? { message: 'OK' }, { status: result.status });
  if (result.newAccessToken) {
    res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  }
  if (result.newRefreshToken) {
    res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  }
  return res;
}
