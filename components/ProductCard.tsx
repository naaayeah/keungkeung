"use client";

import ProductImage from "./ProductImage";
import type { Perfume } from "@/data/perfumes";

interface ProductCardProps {
  perfume: Perfume & { reason: string };
  onToggleSave: (id: string) => void;
  saved: boolean;
}

export default function ProductCard({ perfume, onToggleSave, saved }: ProductCardProps) {
  const firstChannel = perfume.channels?.[0];

  return (
    <article className="bg-white rounded-[20px] shadow-sm border border-[#ECEDF1] overflow-hidden">
      {/* 상단: 이미지 + 기본 정보 */}
      <div className="flex">
        {/* 썸네일 — 크기 고정으로 이미지 깨져도 레이아웃 유지 */}
        <div
          className="flex-shrink-0 bg-[#F8F8FA] flex items-center justify-center p-3"
          style={{ width: 88, minHeight: 88 }}
        >
          <ProductImage imageUrl={perfume.imageUrl} family={perfume.family} size={62} />
        </div>

        {/* 정보 */}
        <div className="flex-1 p-4 flex flex-col gap-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] text-[#9A9CA8] tracking-widest uppercase">{perfume.brand}</p>
              <h3 className="text-[16px] font-semibold text-[#17171C] leading-tight">{perfume.name}</h3>
            </div>
            <button
              onClick={() => onToggleSave(perfume.id)}
              aria-label={saved ? "찜 취소" : "찜하기"}
              aria-pressed={saved}
              className="flex-shrink-0 text-xl transition-transform active:scale-90 mt-0.5 focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded-full"
            >
              {saved ? (
                <span style={{ color: "#B98E33" }}>♥</span>
              ) : (
                <span className="text-[#ECEDF1]">♡</span>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F4F5F7] text-[#6B6E7B]">
              {perfume.family}
            </span>
            <span className="text-[11px] text-[#9A9CA8]">{perfume.priceText}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#2D6CFF] font-medium">
              {perfume.target.gender}
            </span>
            <span className="text-[11px] text-[#6B6E7B]">{perfume.target.age} 추천</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* AI 추천 이유 */}
        <div className="bg-gradient-to-r from-[#FF8FB1]/10 via-[#A586FF]/10 to-[#5AA9FF]/10 rounded-xl px-4 py-3">
          <p className="text-[10px] text-[#6B6E7B] mb-1 font-medium">이 무드라면</p>
          <p className="text-sm text-[#17171C] leading-relaxed">{perfume.reason}</p>
        </div>

        {/* 노트 피라미드 */}
        <div className="border-t border-[#ECEDF1] pt-3 flex flex-col gap-2">
          <NoteRow label="탑" value={perfume.notes.top} color="#FF8FB1" />
          <NoteRow label="미들" value={perfume.notes.mid} color="#A586FF" />
          <NoteRow label="베이스" value={perfume.notes.base} color="#5AA9FF" />
        </div>

        {/* 향기 설명 */}
        <p className="text-sm text-[#17171C] leading-relaxed">{perfume.desc}</p>

        {/* 후기 */}
        <p className="text-xs text-[#6B6E7B] leading-relaxed border-t border-[#ECEDF1] pt-3">
          {perfume.review}
        </p>

        {/* 구매 링크 */}
        {firstChannel ? (
          <a
            href={firstChannel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[#2D6CFF]"
            style={{ background: "#2D6CFF" }}
          >
            {firstChannel.name}에서 보기 →
          </a>
        ) : (
          <p className="text-center text-xs text-[#9A9CA8] mt-1">온라인 판매처 정보 없음</p>
        )}
      </div>
    </article>
  );
}

function NoteRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-xs font-semibold flex-shrink-0" style={{ color }}>{label}</span>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
      <span className="text-[#17171C] font-light text-xs">{value}</span>
    </div>
  );
}
