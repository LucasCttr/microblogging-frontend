import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json().catch(() => null);

    // Expect backend to return { token, refreshToken, user }
    const accessToken = data?.token ?? data?.accessToken ?? null;
    const refreshToken = data?.refreshToken ?? data?.refresh_token ?? null;

    const res = NextResponse.json(data ?? {}, { status: backendRes.status });

    if (accessToken) {
      // Set httpOnly cookie for accessToken and refreshToken
      res.cookies.set({ name: 'accessToken', value: accessToken, httpOnly: true, path: '/' });
    }
    if (refreshToken) {
      res.cookies.set({ name: 'refreshToken', value: refreshToken, httpOnly: true, path: '/' });
    }
    // set userId cookie for convenience (not httpOnly so client may read if needed)
    const userId = data?.user?.id ?? data?.id ?? null;
    if (userId) {
      res.cookies.set({ name: 'userId', value: String(userId), httpOnly: true, path: '/' });
    }

    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
