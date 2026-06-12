"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";
import ResultView from "@/components/ResultView";
import type { Perfume } from "@/data/perfumes";

const GRADIENT = "linear-gradient(90deg, #FF8FB1, #A586FF, #5AA9FF)";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

type AppState = "upload" | "loading" | "result";

interface ResultData {
  moodOneLiner: string;
  moodKeywords: string[];
  matchDescription: string;
  families: { name: string; desc: string }[];
  picks: (Perfume & { reason: string })[];
  cached?: boolean;
}

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [b64, setB64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!ALLOWED.includes(file.type)) {
      setError("JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`이미지는 ${MAX_MB}MB 이하여야 해요.`);
      return;
    }
    setError(null);
    setResult(null);
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setPreview(src);
      setB64(src.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const analyze = async () => {
    if (!b64) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: b64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "알 수 없는 오류가 발생했어요.");
        setState("upload");
        return;
      }
      setResult(data as ResultData);
      setState("result");
    } catch {
      setError("네트워크 오류가 발생했어요. 다시 시도해 주세요.");
      setState("upload");
    }
  };

  const reset = () => {
    setState("upload");
    setPreview(null);
    setB64(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur border-b border-[#ECEDF1] sticky top-0 z-10">
        <button
          onClick={reset}
          className="flex flex-col items-start focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded"
          aria-label="홈으로"
        >
          <span
            className="text-[10px] tracking-[0.25em] font-medium"
            style={{
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI FRAGRANCE
          </span>
          <span className="text-xl font-bold text-[#17171C] leading-tight">
            Sillage
          </span>
        </button>
        <Link
          href="/saved"
          className="text-sm text-[#6B6E7B] hover:text-[#17171C] transition-colors focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded px-1"
        >
          저장함
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8 pb-16">
        {state === "upload" && (
          <div className="flex flex-col gap-6">
            {/* hero */}
            <div className="text-center pt-4">
              <h1 className="text-2xl font-bold text-[#17171C] mb-2">
                추구미로 찾는 향수
              </h1>
              <p className="text-sm text-[#6B6E7B]">
                내 추구미 이미지를 올리면 AI가 딱 맞는 향수를 골라드려요
              </p>
            </div>

            {/* drop zone */}
            {!preview ? (
              <label
                htmlFor="image-upload"
                className={`block w-full rounded-[22px] border-2 border-dashed transition-all py-14 px-6 text-center cursor-pointer focus-within:outline-2 focus-within:outline-[#2D6CFF] ${
                  dragging
                    ? "border-[#2D6CFF] bg-[#2D6CFF]/5"
                    : "border-[#ECEDF1] bg-white hover:border-[#A586FF]/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) loadFile(file);
                }}
              >
                <div
                  className="text-4xl mb-3"
                  aria-hidden="true"
                  style={{
                    background: GRADIENT,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ✦
                </div>
                <p className="text-base font-medium text-[#17171C] mb-1">
                  추구미 이미지를 올려주세요
                </p>
                <p className="text-sm text-[#9A9CA8]">
                  클릭 또는 드래그 · JPG, PNG, WEBP · 최대 5MB
                </p>
              </label>
            ) : (
              <div className="rounded-[22px] overflow-hidden border border-[#ECEDF1] bg-white">
                <img
                  src={preview}
                  alt="업로드한 이미지"
                  className="w-full max-h-80 object-cover"
                />
                <div className="flex gap-2 p-3">
                  <button
                    className="flex-1 text-sm text-[#6B6E7B] border border-[#ECEDF1] rounded-xl py-2 hover:border-[#2D6CFF] hover:text-[#2D6CFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2D6CFF]"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    다른 이미지
                  </button>
                  <button
                    className="flex-1 text-sm text-[#6B6E7B] border border-[#ECEDF1] rounded-xl py-2 hover:border-[#2D6CFF] hover:text-[#2D6CFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2D6CFF]"
                    onClick={reset}
                  >
                    지우기
                  </button>
                </div>
              </div>
            )}

            <input
              id="image-upload"
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="sr-only"
            />

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm px-4 py-3 text-center"
              >
                {error}
              </div>
            )}

            {preview && (
              <button
                onClick={analyze}
                className="w-full py-4 rounded-2xl text-white font-semibold text-base tracking-wide transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[#2D6CFF]"
                style={{ background: "#2D6CFF" }}
              >
                향수 추천 받기
              </button>
            )}

            {/* disclaimer */}
            <p className="text-[11px] text-[#9A9CA8] text-center leading-relaxed">
              AI가 이미지를 해석해 큐레이션 목록에서 고른 추천이며, 실제 향은 다르게 느껴질 수 있습니다.
            </p>
          </div>
        )}

        {state === "loading" && preview && <Loading preview={preview} />}

        {state === "result" && result && (
          <ResultView data={result} onReset={reset} />
        )}
      </main>
    </div>
  );
}
