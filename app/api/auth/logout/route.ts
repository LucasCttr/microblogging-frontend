import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Clear cookies
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: 'accessToken', value: '', httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set({ name: 'refreshToken', value: '', httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
