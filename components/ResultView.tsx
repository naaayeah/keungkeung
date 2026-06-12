"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
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
  onReset: () => void;
}

const GRADIENT = "linear-gradient(90deg, #FF8FB1, #A586FF, #5AA9FF)";

export default function ResultView({ data, onReset }: ResultViewProps) {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("sillage-saved") ?? "[]");
      setSaved(new Set(stored));
    } catch {}
  }, []);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("sillage-saved", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const byTier = {
    entry: data.picks.filter((p) => p.tier === "entry"),
    mid: data.picks.filter((p) => p.tier === "mid"),
    luxury: data.picks.filter((p) => p.tier === "luxury"),
  };

  return (
    <section className="flex flex-col gap-8 animate-[fadeUp_0.5s_ease_both]">
      {/* SCENT READING */}
      <div className="text-center px-2 pb-6 border-b border-[#ECEDF1]">
        <p
          className="text-[10px] tracking-[0.3em] font-medium mb-4"
          style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          SCENT READING
        </p>
        <p className="font-serif text-2xl leading-snug text-[#17171C] italic mb-4">
          {data.moodOneLiner}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {data.moodKeywords.map((kw, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full border text-[#6B6E7B] border-[#ECEDF1]"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* match description */}
      <div>
        <SectionTitle>나랑 잘 맞는 향</SectionTitle>
        <p className="text-[15px] text-[#17171C] leading-relaxed">{data.matchDescription}</p>
      </div>

      {/* families */}
      {data.families.length > 0 && (
        <div>
          <SectionTitle>이 무드의 향조</SectionTitle>
          <div className="flex flex-col gap-3">
            {data.families.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-white flex-shrink-0"
                  style={{ background: GRADIENT }}
                >
                  {f.name}
                </span>
                <p className="text-sm text-[#6B6E7B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* picks by tier */}
      <div>
        <SectionTitle>가격대별 추천</SectionTitle>
        <div className="flex flex-col gap-6">
          {byTier.entry.length > 0 && (
            <TierGroup label="엔트리" picks={byTier.entry} saved={saved} onToggle={toggleSave} />
          )}
          {byTier.mid.length > 0 && (
            <TierGroup label="미들" picks={byTier.mid} saved={saved} onToggle={toggleSave} />
          )}
          {byTier.luxury.length > 0 && (
            <TierGroup label="럭셔리" picks={byTier.luxury} saved={saved} onToggle={toggleSave} />
          )}
        </div>
      </div>

      {/* reset */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-2xl border border-[#ECEDF1] text-[#6B6E7B] text-sm hover:border-[#2D6CFF] hover:text-[#2D6CFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2D6CFF]"
      >
        다른 이미지로 다시 찾기
      </button>

      {/* disclaimer */}
      <p className="text-[11px] text-[#9A9CA8] text-center leading-relaxed pb-2">
        AI가 이미지를 해석해 큐레이션 목록에서 고른 추천이며, 실제 향은 다르게 느껴질 수 있습니다.
      </p>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-semibold text-[#17171C] tracking-wide mb-3 uppercase">
      {children}
    </h2>
  );
}

function TierGroup({
  label,
  picks,
  saved,
  onToggle,
}: {
  label: string;
  picks: PerfumePick[];
  saved: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-[#9A9CA8] mb-2 font-medium">{label}</p>
      <div className="flex flex-col gap-3">
        {picks.map((p) => (
          <ProductCard
            key={p.id}
            perfume={p}
            saved={saved.has(p.id)}
            onToggleSave={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
