"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { PerfumeModal } from "@/components/ProductCard";
import { PERFUMES } from "@/data/perfumes";
import type { Perfume } from "@/data/perfumes";

export default function RankingPage() {
  const [ranked, setRanked] = useState<{ perfume: Perfume; count: number }[]>([]);
  const [detail, setDetail] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/popular")
      .then((r) => r.json())
      .then((d: { ranked: { id: string; count: number }[] }) => {
        const list = d.ranked
          .map((r) => ({ perfume: PERFUMES.find((p) => p.id === r.id), count: r.count }))
          .filter((x): x is { perfume: Perfume; count: number } => !!x.perfume);
        setRanked(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="flex items-center gap-3 px-5 py-4 bg-white/85 backdrop-blur border-b border-[#E5E5E5] sticky top-0 z-10">
        <Link
          href="/"
          className="text-[#555555] hover:text-[#111111] transition-colors text-sm focus-visible:outline-2 focus-visible:outline-[#111111] rounded"
          aria-label="홈으로"
        >
          ← 홈
        </Link>
        <span className="text-[#E5E5E5]">|</span>
        <span className="font-bold text-[#111111] flex items-center gap-1.5">
          <CrownIcon /> 인기 향수 전체 순위
        </span>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8 pb-20">
        <p className="text-sm text-[#999999] mb-5">저장(찜) 많은 순 · 총 {ranked.length}종</p>

        {loading ? (
          <p className="text-center text-sm text-[#999999] py-24">순위를 불러오는 중이에요…</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {ranked.map(({ perfume, count }, i) => (
              <li key={perfume.id} className="animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: `${Math.min(i, 12) * 0.03}s` }}>
                <button
                  onClick={() => setDetail(perfume)}
                  className="w-full text-left flex items-center gap-4 py-3 px-2 rounded-xl transition-colors hover:bg-white group"
                >
                  <span
                    className={`w-7 text-center text-sm font-extrabold flex-shrink-0 ${
                      i === 0 ? "text-[#111111]" : i <= 2 ? "text-[#777777]" : "text-[#BBBBBB]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-shrink-0 w-12 h-12 bg-white rounded-lg border border-[#F0F0F0] flex items-center justify-center overflow-hidden">
                    <ProductImage imageUrl={perfume.imageUrl} family={perfume.family} size={40} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] text-[#999999] tracking-wider uppercase">{perfume.brand}</span>
                    <span className="block text-[13px] font-semibold text-[#111111] truncate group-hover:underline">{perfume.name}</span>
                    <span className="block text-[11px] text-[#999999] mt-0.5">{perfume.family} · {perfume.priceText}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-[#999999] flex-shrink-0">
                    <HeartSmallIcon />
                    {count}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </main>

      {detail && <PerfumeModal perfume={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function CrownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7l4 5 5-7 5 7 4-5v11H3V7z" />
    </svg>
  );
}

function HeartSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#CCCCCC" aria-hidden="true">
      <path d="M12 21s-7.5-4.8-9.8-9.2C.6 8.6 2.6 5 6.1 5c2 0 3.4 1.1 4.2 2.3L12 9l1.7-1.7C14.5 6.1 15.9 5 17.9 5c3.5 0 5.5 3.6 3.9 6.8C19.5 16.2 12 21 12 21z" />
    </svg>
  );
}
