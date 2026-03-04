import { NextRequest, NextResponse } from "next/server";
// Update the import path if the utils file is in a different location, for example:
import forwardWithAutoRefresh from "../../../_utils";
// Or, if the file does not exist, create 'app/api/proxy/_utils.ts' with the required export.

export async function POST(req: NextRequest, context: any) {
  const params = await (context as any).params;
  const { id } = params;
  const apiUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL)?.replace(/\/$/, "");
  if (!apiUrl) return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });

  const backendUrl = `${apiUrl}/tweets/${encodeURIComponent(id)}/reply`;
  const bodyText = await req.text();
  const result = await forwardWithAutoRefresh(req, backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyText,
  });

  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
