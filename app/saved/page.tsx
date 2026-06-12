"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Bottle from "@/components/Bottle";
import { PERFUMES } from "@/data/perfumes";
import type { Perfume } from "@/data/perfumes";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(
        localStorage.getItem("sillage-saved") ?? "[]"
      ) as string[];
      setSavedIds(stored);
    } catch {}
  }, []);

  const remove = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      try {
        localStorage.setItem("sillage-saved", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const savedPerfumes: Perfume[] = savedIds
    .map((id) => PERFUMES.find((p) => p.id === id))
    .filter((p): p is Perfume => !!p);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <header className="flex items-center gap-3 px-5 py-4 bg-white/80 backdrop-blur border-b border-[#ECEDF1] sticky top-0 z-10">
        <Link
          href="/"
          className="text-[#6B6E7B] hover:text-[#17171C] transition-colors text-sm focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded"
          aria-label="홈으로"
        >
          ← 홈
        </Link>
        <span className="text-[#ECEDF1]">|</span>
        <span className="font-bold text-[#17171C]">저장함</span>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8 pb-16">
        {!mounted ? null : savedPerfumes.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <span className="text-5xl" aria-hidden="true">♡</span>
            <p className="text-[#6B6E7B] text-sm">찜한 향수가 없어요.</p>
            <Link
              href="/"
              className="text-sm text-[#2D6CFF] hover:underline focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded"
            >
              향수 추천 받으러 가기 →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#6B6E7B]">
              {savedPerfumes.length}개의 향수를 찜했어요
            </p>
            {savedPerfumes.map((p) => (
              <SavedCard key={p.id} perfume={p} onRemove={() => remove(p.id)} />
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
  const [imgErr, setImgErr] = useState(false);

  return (
    <article className="bg-white rounded-[20px] shadow-sm border border-[#ECEDF1] p-4 flex gap-4 items-center">
      <div className="flex-shrink-0">
        {perfume.imageUrl && !imgErr ? (
          <img
            src={perfume.imageUrl}
            alt={`${perfume.brand} ${perfume.name}`}
            width={56}
            height={80}
            className="object-contain rounded-xl"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Bottle family={perfume.family} size={44} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#9A9CA8] tracking-widest uppercase mb-0.5">
          {perfume.brand}
        </p>
        <p className="font-semibold text-[#17171C] text-base leading-tight">
          {perfume.name}
        </p>
        <p className="text-xs text-[#6B6E7B] mt-1">{perfume.family} · {perfume.priceText}</p>
      </div>
      <button
        onClick={onRemove}
        aria-label={`${perfume.name} 찜 취소`}
        className="text-2xl flex-shrink-0 transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded-full p-1"
        style={{ color: "#B98E33" }}
      >
        ♥
      </button>
    </article>
  );
}
