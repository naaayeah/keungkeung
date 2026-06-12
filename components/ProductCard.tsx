"use client";

import { useState } from "react";
import Bottle from "./Bottle";
import type { Perfume } from "@/data/perfumes";

interface ProductCardProps {
  perfume: Perfume & { reason: string };
  onToggleSave: (id: string) => void;
  saved: boolean;
}

export default function ProductCard({
  perfume,
  onToggleSave,
  saved,
}: ProductCardProps) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <article className="bg-white rounded-[20px] shadow-sm border border-[#ECEDF1] p-5 flex flex-col gap-4">
      {/* top row */}
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0">
          {perfume.imageUrl && !imgErr ? (
            <img
              src={perfume.imageUrl}
              alt={`${perfume.brand} ${perfume.name}`}
              width={72}
              height={100}
              className="object-contain rounded-xl"
              onError={() => setImgErr(true)}
            />
          ) : (
            <Bottle family={perfume.family} size={56} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#9A9CA8] tracking-widest uppercase mb-1">
            {perfume.brand}
          </p>
          <h3 className="text-[17px] font-semibold text-[#17171C] leading-tight mb-1">
            {perfume.name}
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F4F5F7] text-[#6B6E7B]">
              {perfume.family}
            </span>
            <span className="text-xs text-[#6B6E7B]">{perfume.priceText}</span>
          </div>
        </div>
        <button
          onClick={() => onToggleSave(perfume.id)}
          aria-label={saved ? "찜 취소" : "찜하기"}
          aria-pressed={saved}
          className="flex-shrink-0 text-2xl transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded-full p-1"
        >
          {saved ? (
            <span style={{ color: "#B98E33" }}>♥</span>
          ) : (
            <span className="text-[#ECEDF1]">♡</span>
          )}
        </button>
      </div>

      {/* AI reason */}
      <div className="bg-gradient-to-r from-[#FF8FB1]/10 via-[#A586FF]/10 to-[#5AA9FF]/10 rounded-xl px-4 py-3">
        <p className="text-xs text-[#6B6E7B] mb-1 font-medium">이 무드라면</p>
        <p className="text-sm text-[#17171C] leading-relaxed">{perfume.reason}</p>
      </div>

      {/* note pyramid */}
      <div className="border-t border-[#ECEDF1] pt-3 flex flex-col gap-2">
        <NoteRow label="탑" value={perfume.notes.top} color="#FF8FB1" />
        <NoteRow label="미들" value={perfume.notes.mid} color="#A586FF" />
        <NoteRow label="베이스" value={perfume.notes.base} color="#5AA9FF" />
      </div>

      {/* desc + review */}
      <p className="text-sm text-[#17171C] leading-relaxed">{perfume.desc}</p>
      <p className="text-xs text-[#6B6E7B] leading-relaxed border-t border-[#ECEDF1] pt-3">
        💬 {perfume.review}
      </p>
    </article>
  );
}

function NoteRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="w-7 text-xs font-semibold flex-shrink-0"
        style={{ color }}
      >
        {label}
      </span>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span className="text-[#17171C] font-light">{value}</span>
    </div>
  );
}
