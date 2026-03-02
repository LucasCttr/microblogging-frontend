import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  const backendRes = await fetch(`${process.env.BACKEND_URL}/tweets/${encodeURIComponent(id)}/retweet`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  const backendRes = await fetch(`${process.env.BACKEND_URL}/tweets/${encodeURIComponent(id)}/retweet`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
