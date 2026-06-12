import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPerfumeById, getPerfumeSeedList } from "@/data/perfumes";
import { hashImage, getCached, setCached } from "@/lib/cache";
import { checkRateLimit } from "@/lib/ratelimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

interface AiResponse {
  moodOneLiner: string;
  moodKeywords: string[];
  matchDescription: string;
  families: { name: string; desc: string }[];
  picks: { id: string; reason: string }[];
}

function buildPrompt(): string {
  const list = getPerfumeSeedList()
    .map(
      (p) =>
        `${p.id}|${p.brand}|${p.name}|${p.family}|${p.tier}|무드:${p.mood}`
    )
    .join("\n");

  return `당신은 향수 큐레이터입니다. 이미지의 분위기·색감·질감·계절감을 분석해, 아래 큐레이션 목록에서 가장 잘 어울리는 향수를 고르세요.

규칙:
- 반드시 아래 향수 목록의 id만 사용. 목록에 없는 향수는 절대 만들지 마세요.
- JSON만 출력. 코드펜스, 설명, 인사 전부 금지.
- picks는 엔트리/미들/럭셔리 각 1~2개씩 총 5~6개.
- reason은 이미지 무드와 연결되는 이유만 (노트/가격/향기설명은 쓰지 말 것).

향수 목록:
${list}

출력 형식:
{
  "moodOneLiner": "이미지 무드를 향으로 표현한 한 문장 (명조 강조용, 시적으로)",
  "moodKeywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
  "matchDescription": "이 무드와 어울리는 향의 방향성을 2~3문장으로",
  "families": [
    {"name": "향조명", "desc": "한 줄 설명"}
  ],
  "picks": [
    {"id": "향수id", "reason": "이 무드라면 이 향수인 이유 한 문장"}
  ]
}`;
}

async function callAI(
  base64: string,
  mediaType: string
): Promise<AiResponse> {
  const prompt = buildPrompt();

  const tryParse = async (): Promise<AiResponse> => {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system:
        "당신은 향수 큐레이터입니다. JSON만 출력합니다. 코드펜스, 설명, 인사를 절대 쓰지 않습니다.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: base64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("no json");
    return JSON.parse(cleaned.slice(start, end + 1)) as AiResponse;
  };

  try {
    return await tryParse();
  } catch {
    // 1 retry
    return await tryParse();
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    const messages: Record<string, string> = {
      per_minute: "너무 빠르게 요청하고 있어요. 잠시 후 다시 시도해 주세요.",
      per_hour: "시간당 분석 횟수를 초과했어요. 나중에 다시 시도해 주세요.",
      daily:
        "오늘 분석 횟수를 모두 사용했어요. 내일 다시 이용해 주세요.",
    };
    return NextResponse.json(
      { error: messages[rl.reason] },
      { status: 429 }
    );
  }

  let base64: string;
  let mediaType: string;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("image") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "이미지 파일이 없어요." },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "JPG, PNG, WEBP 형식의 이미지만 지원해요." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "이미지 크기는 5MB 이하여야 해요." },
        { status: 400 }
      );
    }
    mediaType = file.type;
    const buf = await file.arrayBuffer();
    base64 = Buffer.from(buf).toString("base64");
  } else {
    const body = await req.json();
    if (!body.base64 || !body.mediaType) {
      return NextResponse.json(
        { error: "이미지 데이터가 없어요." },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(body.mediaType)) {
      return NextResponse.json(
        { error: "JPG, PNG, WEBP 형식의 이미지만 지원해요." },
        { status: 400 }
      );
    }
    const byteLen = Math.ceil((body.base64.length * 3) / 4);
    if (byteLen > MAX_BYTES) {
      return NextResponse.json(
        { error: "이미지 크기는 5MB 이하여야 해요." },
        { status: 400 }
      );
    }
    base64 = body.base64;
    mediaType = body.mediaType;
  }

  const cacheKey = hashImage(base64);
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached as object, cached: true });
  }

  let aiResult: AiResponse;
  try {
    aiResult = await callAI(base64, mediaType);
  } catch {
    return NextResponse.json(
      {
        error:
          "향을 읽어내지 못했어요. 다른 이미지로 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }

  // merge picks with seed data, filter invalid ids
  const picks = (aiResult.picks ?? [])
    .map(({ id, reason }) => {
      const perfume = getPerfumeById(id);
      if (!perfume) return null;
      return { ...perfume, reason };
    })
    .filter(Boolean);

  const response = {
    moodOneLiner: aiResult.moodOneLiner ?? "",
    moodKeywords: aiResult.moodKeywords ?? [],
    matchDescription: aiResult.matchDescription ?? "",
    families: aiResult.families ?? [],
    picks,
  };

  setCached(cacheKey, response);
  return NextResponse.json(response);
}
