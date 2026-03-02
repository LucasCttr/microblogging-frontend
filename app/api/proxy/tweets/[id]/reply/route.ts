import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL;
  if (!apiUrl) return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });

  let headers: Record<string, string> = { "Content-Type": "application/json" };
  const accessToken = req.cookies.get('accessToken')?.value;
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const body = await req.text();
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/tweets/${id}/reply`, {
    method: "POST",
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
}
