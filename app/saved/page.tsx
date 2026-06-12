"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { PERFUMES } from "@/data/perfumes";
import { getSavedIds, setSavedIds, reportSaveDelta } from "@/lib/save";
import type { Perfume } from "@/data/perfumes";

export default function SavedPage() {
  const [savedIds, setIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIds(getSavedIds());
  }, []);

  const remove = (id: string) => {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      setSavedIds(next);
      reportSaveDelta(id, -1);
      return next;
    });
  };

  const savedPerfumes: Perfume[] = savedIds
    .map((id) => PERFUMES.find((p) => p.id === id))
    .filter((p): p is Perfume => !!p);

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
        <span className="font-bold text-[#111111]">저장함</span>
      </header>

      <main className="max-w-lg mx-auto px-5 py-10 pb-20">
        {!mounted ? null : savedPerfumes.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-5">
            <span aria-hidden="true" className="animate-[floaty_3s_ease-in-out_infinite]">
              <EmptyHeartIcon />
            </span>
            <p className="text-[#555555] text-sm">아직 찜한 향수가 없어요.</p>
            <Link
              href="/"
              className="text-sm font-semibold text-[#111111] hover:underline focus-visible:outline-2 focus-visible:outline-[#111111] rounded"
            >
              향수 추천 받으러 가기 →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-[#555555]">
              {savedPerfumes.length}개의 향수를 찜했어요
            </p>
            {savedPerfumes.map((p, i) => (
              <div key={p.id} className="animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: `${i * 0.06}s` }}>
                <SavedCard perfume={p} onRemove={() => remove(p.id)} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SavedCard({
  perfume,
  onRemove,
}: {
  perfume: Perfume;
  onRemove: () => void;
}) {
  return (
    <article className="bg-white rounded-[20px] border border-[#E5E5E5] p-5 flex gap-4 items-center transition-shadow hover:shadow-md">
      <div className="flex-shrink-0 w-16 h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center overflow-hidden">
        <ProductImage imageUrl={perfume.imageUrl} family={perfume.family} size={52} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#999999] tracking-widest uppercase mb-1">
          {perfume.brand}
        </p>
        <p className="font-semibold text-[#111111] text-base leading-snug">
          {perfume.name}
        </p>
        <p className="text-xs text-[#555555] mt-1.5">{perfume.family} · {perfume.priceText}</p>
      </div>
      <button
        onClick={onRemove}
        aria-label={`${perfume.name} 찜 취소`}
        className="flex-shrink-0 transition-transform active:scale-90 hover:animate-[wiggle_0.4s_ease] focus-visible:outline-2 focus-visible:outline-[#111111] rounded-full p-1"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 21s-7.5-4.8-9.8-9.2C.6 8.6 2.6 5 6.1 5c2 0 3.4 1.1 4.2 2.3L12 9l1.7-1.7C14.5 6.1 15.9 5 17.9 5c3.5 0 5.5 3.6 3.9 6.8C19.5 16.2 12 21 12 21z"
            fill="#111111"
          />
        </svg>
      </button>
    </article>
  );
}

function EmptyHeartIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 21s-7.5-4.8-9.8-9.2C.6 8.6 2.6 5 6.1 5c2 0 3.4 1.1 4.2 2.3L12 9l1.7-1.7C14.5 6.1 15.9 5 17.9 5c3.5 0 5.5 3.6 3.9 6.8C19.5 16.2 12 21 12 21z" />
    </svg>
  );
}
