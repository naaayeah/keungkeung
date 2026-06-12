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
  preview: string;
}

export default function Loading({ preview }: LoadingProps) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-md">
        <img
          src={preview}
          alt="분석 중인 이미지"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin"
            aria-hidden="true"
          />
        </div>
      </div>
      <p
        className="text-sm text-[#6B6E7B] font-medium transition-all duration-500"
        aria-live="polite"
        aria-atomic="true"
      >
        {MESSAGES[msgIdx]}
      </p>
    </div>
  );
}
