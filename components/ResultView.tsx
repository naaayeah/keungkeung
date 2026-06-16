"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { toPng } from "html-to-image";
import ProductCard from "./ProductCard";
import { getSavedIds, setSavedIds, reportSaveDelta } from "@/lib/save";
import type { Perfume } from "@/data/perfumes";

type PerfumePick = Perfume & { reason: string };

interface ResultData {
  moodOneLiner: string;
  moodKeywords: string[];
  matchDescription: string;
  families: { name: string; desc: string }[];
  picks: PerfumePick[];
  cached?: boolean;
}

interface ResultViewProps {
  data: ResultData;
  previews: string[];
  onReset: () => void;
}

// 결과 무드에 맞는 톤다운 컬러 (향조·키워드에서 추출)
const MOOD_PALETTE: { keywords: string[]; color: string }[] = [
  { keywords: ["플로럴", "로즈", "피오니", "핑크", "꽃", "로맨틱", "청순"], color: "#9C7B82" },
  { keywords: ["그린", "그리너리", "허브", "잎", "자연", "숲", "초록"], color: "#6F7D6A" },
  { keywords: ["아쿠아", "마린", "바다", "물", "블루", "여름"], color: "#66808F" },
  { keywords: ["시트러스", "레몬", "햇살", "노랑", "상큼"], color: "#9D8E62" },
  { keywords: ["우디", "샌달", "나무", "미니멀"], color: "#7A6A58" },
  { keywords: ["오리엔탈", "스파이시", "구르망", "바닐라", "달콤"], color: "#8A7060" },
  { keywords: ["머스크", "파우더리", "포근", "몽환"], color: "#8C8794" },
];

function getMoodColor(data: ResultData): string {
  // moodKeywords → families → picks 순으로 우선순위 적용
  const sources = [
    data.moodKeywords.join(" "),
    data.families.map((f) => f.name).join(" "),
    data.picks.map((p) => p.family).join(" "),
  ];
  for (const haystack of sources) {
    for (const { keywords, color } of MOOD_PALETTE) {
      if (keywords.some((k) => haystack.includes(k))) return color;
    }
  }
  return "#5C5C5C";
}

export default function ResultView({ data, previews, onReset }: ResultViewProps) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(new Set(getSavedIds()));
  }, []);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        reportSaveDelta(id, -1);
      } else {
        next.add(id);
        reportSaveDelta(id, 1);
      }
      setSavedIds(Array.from(next));
      return next;
    });
  };

  // 1. 결과 텍스트 클립보드 복사
  const copyText = async () => {
    const lines = [
      `킁킁이 읽은 내 무드: "${data.moodOneLiner}"`,
      `키워드: ${data.moodKeywords.map((k) => `#${k}`).join(" ")}`,
      "",
      "추천받은 향수:",
      ...data.picks.map((p) => `· ${p.brand} — ${p.name} (${p.priceText})`),
      "",
      "킁킁 — 당신의 향을 찾아드립니다",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // 2. 결과 카드를 이미지(PNG)로 저장
  const saveImage = async () => {
    if (!captureRef.current || savingImg) return;
    setSavingImg(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: "#FAFAFA",
        cacheBust: true,
        filter: (node) => !(node instanceof HTMLElement && node.dataset.noCapture === "true"),
      });
      const link = document.createElement("a");
      link.download = "킁킁-향수추천.png";
      link.href = dataUrl;
      link.click();
    } catch {
      // 캡처 실패 시 조용히 무시
    } finally {
      setSavingImg(false);
    }
  };

  const byTier = {
    entry: data.picks.filter((p) => p.tier === "entry"),
    mid: data.picks.filter((p) => p.tier === "mid"),
    luxury: data.picks.filter((p) => p.tier === "luxury"),
  };

  return (
    <section className="flex flex-col gap-7 animate-[fadeUp_0.5s_ease_both]">

     <div ref={captureRef} className="flex flex-col gap-7 bg-[#FAFAFA]">

      {/* 업로드 이미지 콜라주 */}
      {previews.length > 0 && (
        <div className="rounded-[22px] overflow-hidden relative">
          {previews.length === 1 ? (
            <img src={previews[0]} alt="무드 이미지" className="w-full max-h-64 object-cover" />
          ) : (
            <div className={`grid gap-1 ${previews.length === 2 ? "grid-cols-2" : previews.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {previews.slice(0, previews.length > 4 ? 3 : 4).map((src, i) => {
                const isLast = previews.length > 4 && i === 2;
                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden ${
                      previews.length === 3 ? "aspect-square" :
                      previews.length === 2 ? "aspect-[3/4]" :
                      i === 0 ? "row-span-2 aspect-auto" : "aspect-square"
                    }`}
                    style={previews.length >= 4 && i === 0 ? { gridRow: "span 2" } : {}}
                  >
                    <img src={src} alt={`무드 이미지 ${i + 1}`} className="w-full h-full object-cover" />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">+{previews.length - 3}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      )}

      {/* SCENT READING — 결과 무드에 맞는 톤다운 컬러 */}
      <div
        className="text-center px-2 py-7 rounded-[22px] text-white"
        style={{ background: getMoodColor(data) }}
      >
        <p className="text-[10px] tracking-[0.3em] font-medium mb-4 text-white/60">
          SCENT READING
        </p>
        <p className="text-[22px] font-bold leading-snug mb-5 px-4">
          {data.moodOneLiner}
        </p>
        <div className="flex flex-wrap gap-2 justify-center px-4">
          {data.moodKeywords.map((kw, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full border border-white/30 text-white/90 animate-[fadeUp_0.4s_ease_both]"
              style={{ animationDelay: `${0.15 + i * 0.07}s` }}
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>

      {/* 나랑 잘 맞는 향 */}
      <SectionCard num="01" title="나랑 잘 맞는 향" icon={<NoseIcon />}>
        <p className="text-[15px] text-[#111111] leading-relaxed">{data.matchDescription}</p>
      </SectionCard>

      {/* 향조 */}
      {data.families.length > 0 && (
        <SectionCard num="02" title="이 무드의 향조" icon={<LeafIcon />}>
          <div className="flex flex-col gap-4">
            {data.families.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#111111] text-white flex-shrink-0">
                  {f.name}
                </span>
                <p className="text-sm text-[#555555] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 가격대별 추천 */}
      <SectionCard num="03" title="가격대별 추천" icon={<TagIcon />}>
        <div className="flex flex-col gap-7">
          {byTier.entry.length > 0 && (
            <TierGroup label="엔트리" sub="부담 없이 시작" picks={byTier.entry} saved={saved} onToggle={toggleSave} />
          )}
          {byTier.mid.length > 0 && (
            <TierGroup label="미들" sub="데일리 투자" picks={byTier.mid} saved={saved} onToggle={toggleSave} />
          )}
          {byTier.luxury.length > 0 && (
            <TierGroup label="럭셔리" sub="나를 위한 선물" picks={byTier.luxury} saved={saved} onToggle={toggleSave} />
          )}
        </div>
      </SectionCard>

      {/* 킁킁 워터마크 — 이미지 저장 시 함께 캡처 */}
      <p className="text-center text-[11px] tracking-[0.2em] text-[#BBBBBB] font-medium">
        킁킁 — 당신의 향을 찾아드립니다
      </p>

     </div>

      {/* 공유 + 다시 찾기 (캡처 영역 밖) */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={copyText}
            className="flex-1 py-3.5 rounded-2xl bg-[#111111] text-white text-sm font-semibold transition-all hover:bg-[#333333] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CopyIcon />
            {copied ? "복사됐어요!" : "텍스트 복사"}
          </button>
          <button
            onClick={saveImage}
            disabled={savingImg}
            className="flex-1 py-3.5 rounded-2xl border border-[#111111] bg-white text-[#111111] text-sm font-semibold transition-all hover:bg-[#F5F5F5] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ImageIcon />
            {savingImg ? "저장 중…" : "이미지 저장"}
          </button>
        </div>
        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-2xl border border-[#E5E5E5] bg-white text-[#555555] text-sm transition-all hover:border-[#111111] hover:text-[#111111] active:scale-[0.98]"
        >
          다른 이미지로 다시 찾기
        </button>
      </div>

      <p className="text-[11px] text-[#999999] text-center leading-relaxed pb-2 px-4">
        AI가 이미지를 해석해 큐레이션 목록에서 고른 추천이며, 실제 향은 다르게 느껴질 수 있어요.
      </p>
      {/* TODO: 제휴(어필리에이트) 링크로 전환 시 아래 문구를 반드시 노출해야 합니다.
          예) "이 페이지의 일부 링크는 제휴 링크로, 구매 시 수수료를 받을 수 있습니다."
          channels 배열의 affiliate: true 항목이 하나라도 있으면 자동 표시하도록 구현 권장. */}
    </section>
  );
}

function SectionCard({ num, title, icon, children }: {
  num: string; title: string; icon: ReactNode; children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-[22px] border border-[#E5E5E5] p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#F0F0F0]">
        <span className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
          {icon}
        </span>
        <span className="text-[10px] tracking-[0.2em] text-[#999999] font-medium">{num}</span>
        <h2 className="text-[15px] font-bold text-[#111111]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function TierGroup({
  label, sub, picks, saved, onToggle,
}: {
  label: string;
  sub: string;
  picks: PerfumePick[];
  saved: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-sm font-bold text-[#111111]">{label}</p>
        <p className="text-[11px] text-[#999999]">{sub}</p>
      </div>
      <div className="flex flex-col gap-4">
        {picks.map((p) => (
          <ProductCard key={p.id} perfume={p} saved={saved.has(p.id)} onToggleSave={onToggle} />
        ))}
      </div>
    </div>
  );
}

function NoseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v8c0 3-3 4-3 7a3 3 0 0 0 6 0c0-3-3-4-3-7" />
      <path d="M17 8c1.5 1 2.5 2.5 2.5 4M4.5 12C4.5 9.5 5.5 8 7 7" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z" />
      <path d="M5 19c3-5 7-8 10-9" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h8l10 10-8 8L3 11V3z" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
