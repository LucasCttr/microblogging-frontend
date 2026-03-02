import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = req.cookies.get('userId')?.value ?? null;
  if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  const url = `${process.env.BACKEND_URL}/users/${userId}`;
  const backendRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
