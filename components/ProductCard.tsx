"use client";

import { useState } from "react";
import ProductImage from "./ProductImage";
import { getSimilarPerfumes } from "@/data/perfumes";
import type { Perfume } from "@/data/perfumes";

interface ProductCardProps {
  perfume: Perfume & { reason: string };
  onToggleSave: (id: string) => void;
  saved: boolean;
}

export default function ProductCard({ perfume, onToggleSave, saved }: ProductCardProps) {
  const firstChannel = perfume.channels?.[0];
  const [popping, setPopping] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const similar = getSimilarPerfumes(perfume.id, 3);

  const handleSave = () => {
    onToggleSave(perfume.id);
    setPopping(true);
    setTimeout(() => setPopping(false), 400);
  };

  return (
    <article className="bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      {/* 상단: 이미지 + 기본 정보 */}
      <div className="flex">
        {/* 썸네일 — 흰 배경, 칸에 꽉 차게 */}
        <div
          className="flex-shrink-0 bg-white flex items-center justify-center border-r border-[#F0F0F0]"
          style={{ width: 132, minHeight: 150 }}
        >
          <ProductImage imageUrl={perfume.imageUrl} family={perfume.family} fill />
        </div>

        {/* 정보 */}
        <div className="flex-1 p-5 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] text-[#999999] tracking-widest uppercase mb-1">{perfume.brand}</p>
              <h3 className="text-[16px] font-semibold text-[#111111] leading-snug">{perfume.name}</h3>
            </div>
            <button
              onClick={handleSave}
              aria-label={saved ? "찜 취소" : "찜하기"}
              aria-pressed={saved}
              className="flex-shrink-0 mt-0.5 focus-visible:outline-2 focus-visible:outline-[#111111] rounded-full"
              style={popping ? { animation: "pop 0.4s ease" } : undefined}
            >
              <HeartIcon filled={saved} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#F0F0F0] text-[#555555]">
              {perfume.family}
            </span>
            <span className="text-[11px] text-[#999999]">{perfume.priceText}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#111111] text-white font-medium">
              {perfume.target.gender}
            </span>
            <span className="text-[11px] text-[#555555]">{perfume.target.age} 추천</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4 flex flex-col gap-4 border-t border-[#F0F0F0]">
        {/* AI 추천 이유 */}
        <div className="bg-[#F7F7F7] rounded-xl px-4 py-3.5 border border-[#EEEEEE]">
          <p className="text-[10px] text-[#999999] mb-1.5 font-semibold tracking-wide">이 무드라면</p>
          <p className="text-sm text-[#111111] leading-relaxed">{perfume.reason}</p>
        </div>

        {/* 노트 피라미드 */}
        <div className="flex flex-col gap-2.5">
          <NoteRow label="탑" value={perfume.notes.top} shade="#111111" />
          <NoteRow label="미들" value={perfume.notes.mid} shade="#666666" />
          <NoteRow label="베이스" value={perfume.notes.base} shade="#AAAAAA" />
        </div>

        {/* 향기 설명 */}
        <p className="text-sm text-[#111111] leading-relaxed">{perfume.desc}</p>

        {/* 후기 */}
        <p className="text-[13px] text-[#666666] leading-relaxed border-t border-[#EEEEEE] pt-4">
          {perfume.review}
        </p>

        {/* 구매 링크 */}
        {firstChannel ? (
          <a
            href={firstChannel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 w-full py-3 rounded-xl text-center text-sm font-semibold text-white bg-[#111111] transition-all hover:bg-[#333333] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#111111]"
          >
            {firstChannel.name}에서 보기 →
          </a>
        ) : (
          <p className="text-center text-xs text-[#999999] mt-1">온라인 판매처 정보 없음</p>
        )}

        {/* 비슷한 향수 보기 */}
        {similar.length > 0 && (
          <div className="border-t border-[#EEEEEE] pt-3">
            <button
              onClick={() => setShowSimilar((v) => !v)}
              aria-expanded={showSimilar}
              className="w-full flex items-center justify-between text-[13px] font-semibold text-[#555555] hover:text-[#111111] transition-colors py-1"
            >
              비슷한 향수 보기
              <span
                className="text-[#999999] transition-transform duration-300"
                style={{ transform: showSimilar ? "rotate(90deg)" : "none" }}
                aria-hidden="true"
              >
                더보기 ›
              </span>
            </button>
            {showSimilar && (
              <div className="flex flex-col gap-2 mt-3 animate-[fadeUp_0.3s_ease_both]">
                {similar.map((s) => (
                  <a
                    key={s.id}
                    href={s.channels?.[0]?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] transition-all hover:border-[#111111] hover:bg-white group"
                  >
                    <span className="flex-shrink-0 w-12 h-12 bg-white rounded-lg border border-[#F0F0F0] flex items-center justify-center overflow-hidden">
                      <ProductImage imageUrl={s.imageUrl} family={s.family} size={44} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[9px] text-[#999999] tracking-wider uppercase">{s.brand}</span>
                      <span className="block text-[13px] font-semibold text-[#111111] truncate group-hover:underline">{s.name}</span>
                      <span className="block text-[11px] text-[#999999] mt-0.5">{s.family} · {s.priceText}</span>
                    </span>
                    <span className="text-[#CCCCCC] group-hover:text-[#111111] transition-colors flex-shrink-0" aria-hidden="true">›</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7.5-4.8-9.8-9.2C.6 8.6 2.6 5 6.1 5c2 0 3.4 1.1 4.2 2.3L12 9l1.7-1.7C14.5 6.1 15.9 5 17.9 5c3.5 0 5.5 3.6 3.9 6.8C19.5 16.2 12 21 12 21z"
        fill={filled ? "#111111" : "none"}
        stroke={filled ? "#111111" : "#CCCCCC"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NoteRow({ label, value, shade }: { label: string; value: string; shade: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-9 text-xs font-semibold flex-shrink-0" style={{ color: shade }}>{label}</span>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: shade }} aria-hidden="true" />
      <span className="text-[#111111] text-xs">{value}</span>
    </div>
  );
}
