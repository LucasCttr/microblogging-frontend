import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (!refreshToken) return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });

    // Forward the refresh token to backend as cookie header
    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${refreshToken}` },
    });

    const data = await backendRes.json().catch(() => null);
    const res = NextResponse.json(data ?? {}, { status: backendRes.status });

    // If backend included a Set-Cookie header for refreshToken, attempt to forward it
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      // try to extract refreshToken value
      const match = setCookie.match(/refreshToken=([^;]+);?/i);
      if (match) {
        res.cookies.set({ name: 'refreshToken', value: match[1], httpOnly: true, path: '/' });
      }
    }

    // If backend returned token in body, set accessToken cookie
    const accessToken = data?.token ?? data?.accessToken ?? null;
    if (accessToken) {
      res.cookies.set({ name: 'accessToken', value: accessToken, httpOnly: true, path: '/' });
    }

    // set userId cookie for convenience
    const userId = data?.user?.id ?? data?.id ?? null;
    if (userId) {
      res.cookies.set({ name: 'userId', value: String(userId), httpOnly: true, path: '/' });
    }

    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
