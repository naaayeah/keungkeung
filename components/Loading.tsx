"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "킁킁… 무드를 맡아보는 중이에요",
  "향의 언어로 번역하는 중이에요",
  "큐레이터가 향을 고르는 중이에요",
  "잔향까지 꼼꼼히 맡아보는 중이에요",
  "분위기를 향기로 담는 중이에요",
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
    <div className="flex flex-col items-center gap-8 py-10">
      {/* 이미지 + 킁킁 향수병 */}
      <div className="relative">
        <div className="flex items-center gap-5">
          {/* 업로드 이미지 스택 */}
          <div className="relative w-32 h-32">
            {previews.slice(1, 3).map((src, i) => (
              <div
                key={i}
                className="absolute rounded-xl overflow-hidden border-2 border-white shadow"
                style={{
                  width: 64, height: 64,
                  top: i === 0 ? -6 : 2,
                  right: i === 0 ? -8 : 0,
                  zIndex: 2 - i,
                  opacity: 0.85 - i * 0.2,
                  filter: "grayscale(1)",
                }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-2xl overflow-hidden border-2 border-white shadow-lg z-10">
              <img src={main} alt="분석 중" className="w-full h-full object-cover" style={{ filter: "grayscale(1)" }} />
            </div>
          </div>

          {/* 킁킁대는 향수병 */}
          <div className="relative flex flex-col items-center" aria-hidden="true">
            {/* 향기 파동 */}
            <div className="absolute -top-7 flex flex-col items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  width="34" height="8" viewBox="0 0 34 8" fill="none"
                  style={{ animation: `scentWave 1.6s ease-out ${i * 0.45}s infinite` }}
                >
                  <path d="M1 4c4-4 7 4 11 0s7 4 11 0 7 4 10 0" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ))}
            </div>
            <svg
              width="52" height="74" viewBox="0 0 80 112" fill="none"
              style={{ animation: "sniff 1.2s ease-in-out infinite" }}
            >
              <rect x="28" y="2" width="24" height="14" rx="4" fill="#333333" />
              <rect x="32" y="14" width="16" height="12" rx="2" fill="#777777" />
              <rect x="14" y="26" width="52" height="72" rx="12" fill="#111111" />
              <rect x="22" y="34" width="10" height="44" rx="5" fill="white" opacity="0.2" />
              {/* 눈 */}
              <circle cx="32" cy="58" r="3" fill="white" />
              <circle cx="48" cy="58" r="3" fill="white" />
              {/* 입 */}
              <path d="M34 70c2.5 3 9.5 3 12 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 메시지 + 진행바 */}
      <div className="text-center w-full max-w-[260px] flex flex-col items-center gap-4">
        <p className="text-sm text-[#111111] font-medium" aria-live="polite" aria-atomic="true">
          {MESSAGES[msgIdx]}
        </p>
        <div className="w-full h-1 rounded-full bg-[#EEEEEE] overflow-hidden">
          <div
            className="h-full w-1/3 rounded-full bg-[#111111]"
            style={{ animation: "progressSlide 1.4s ease-in-out infinite" }}
          />
        </div>
        {previews.length > 1 && (
          <p className="text-xs text-[#999999]">{previews.length}장의 이미지를 함께 분석 중이에요</p>
        )}
      </div>
    </div>
  );
}
