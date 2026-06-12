"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "무드를 읽는 중…",
  "향의 언어로 번역하는 중…",
  "큐레이터가 향을 고르는 중…",
  "잔향을 찾는 중…",
  "분위기를 향기로 담는 중…",
];

interface LoadingProps {
  previews: string[];
}

export default function Loading({ previews }: LoadingProps) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);

  const main = previews[0];

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* 이미지 콜라주 */}
      <div className="relative">
        {previews.length === 1 ? (
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-md">
            <img src={main} alt="분석 중" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            </div>
          </div>
        ) : (
          <div className="relative w-40 h-40">
            {/* 뒤 이미지들 */}
            {previews.slice(1, 4).map((src, i) => (
              <div
                key={i}
                className="absolute rounded-xl overflow-hidden shadow border-2 border-white"
                style={{
                  width: 72, height: 72,
                  top: i === 0 ? 0 : i === 1 ? 4 : 8,
                  right: i === 0 ? 0 : i === 1 ? 4 : 8,
                  zIndex: 3 - i,
                  opacity: 1 - i * 0.15,
                }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {/* 메인 이미지 */}
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-white z-10">
              <img src={main} alt="분석 중" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-[#17171C] font-medium mb-1" aria-live="polite" aria-atomic="true">
          {MESSAGES[msgIdx]}
        </p>
        {previews.length > 1 && (
          <p className="text-xs text-[#9A9CA8]">{previews.length}장의 이미지를 함께 분석 중</p>
        )}
      </div>
    </div>
  );
}
