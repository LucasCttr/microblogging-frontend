import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // Obtener los parámetros de la query string
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = searchParams.get("take");
  // Construir la URL del backend con los parámetros
  const backendUrl = new URL(`${process.env.BACKEND_URL}/feed`);
  if (cursor) backendUrl.searchParams.set("cursor", cursor);
  if (take) backendUrl.searchParams.set("take", take);

  const backendRes = await fetch(backendUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  let data;
  try {
    data = await backendRes.json();
  } catch (e) {
    data = null;
  }
  return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  let body: any = null;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const backendRes = await fetch(`${process.env.BACKEND_URL}/tweets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data ?? { message: 'OK' }, { status: backendRes.status });
}
