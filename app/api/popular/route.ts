import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PERFUMES } from "@/data/perfumes";

// 저장(찜) 수를 파일로 집계하는 간단한 인기순 저장소.
// 서버 재시작에도 유지되며, 출시 시 DB로 교체 권장.
const STORE = path.join(process.cwd(), ".data", "popularity.json");

async function readCounts(): Promise<Record<string, number>> {
  try {
    return JSON.parse(await fs.readFile(STORE, "utf8"));
  } catch {
    return {};
  }
}

async function writeCounts(counts: Record<string, number>) {
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.writeFile(STORE, JSON.stringify(counts));
}

export async function GET() {
  const counts = await readCounts();
  const ranked = PERFUMES
    .map((p) => ({ id: p.id, count: counts[p.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);
  return NextResponse.json({ ranked });
}

export async function POST(req: NextRequest) {
  let body: { id?: string; delta?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const { id, delta } = body;
  if (!id || !PERFUMES.some((p) => p.id === id) || (delta !== 1 && delta !== -1)) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const counts = await readCounts();
  counts[id] = Math.max(0, (counts[id] ?? 0) + delta);
  await writeCounts(counts);
  return NextResponse.json({ ok: true, count: counts[id] });
}
