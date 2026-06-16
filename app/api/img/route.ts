import { NextRequest, NextResponse } from "next/server";

// 향수 이미지 동일 출처 프록시.
// fimgs.net은 CORS 헤더가 없어 결과 카드를 PNG로 캡처할 때 이미지가 깨진다.
// 이 라우트로 서버에서 받아 같은 출처로 다시 내려주면 캡처가 정상 동작하고,
// CDN 캐시도 태울 수 있다.
const ALLOWED_HOSTS = ["fimgs.net"];

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.some((h) => target.hostname === h || target.hostname.endsWith(`.${h}`))) {
    return NextResponse.json({ error: "host not allowed" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "" },
      cache: "force-cache",
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "upstream error" }, { status: 502 });
    }
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        // 1년 캐시 (이미지 URL은 향수 ID 기반으로 불변)
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
