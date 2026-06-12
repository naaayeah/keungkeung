"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";
import ResultView from "@/components/ResultView";
import type { Perfume } from "@/data/perfumes";

const GRADIENT = "linear-gradient(90deg, #FF8FB1, #A586FF, #5AA9FF)";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;
const MAX_IMAGES = 10;

type AppState = "upload" | "loading" | "result";

interface ImageFile {
  preview: string;
  base64: string;
  mediaType: string;
}

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
  const [images, setImages] = useState<ImageFile[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File): Promise<ImageFile | null> =>
    new Promise((resolve) => {
      if (!ALLOWED.includes(file.type)) { resolve(null); return; }
      if (file.size > MAX_MB * 1024 * 1024) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        resolve({ preview: src, base64: src.split(",")[1], mediaType: file.type });
      };
      reader.readAsDataURL(file);
    });

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const arr = Array.from(files);
    const invalid = arr.filter(f => !ALLOWED.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (invalid.length > 0) {
      setError(`JPG·PNG·WEBP 형식, 각 ${MAX_MB}MB 이하만 업로드할 수 있어요.`);
    }
    const valid = arr.filter(f => ALLOWED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    const loaded = (await Promise.all(valid.map(readFile))).filter(Boolean) as ImageFile[];
    setImages(prev => {
      const merged = [...prev, ...loaded];
      if (merged.length > MAX_IMAGES) {
        setError(`이미지는 최대 ${MAX_IMAGES}장까지 추가할 수 있어요.`);
        return merged.slice(0, MAX_IMAGES);
      }
      return merged;
    });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const removeImage = (idx: number) =>
    setImages(prev => prev.filter((_, i) => i !== idx));

  const analyze = async () => {
    if (images.length === 0) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map(({ base64, mediaType }) => ({ base64, mediaType })),
        }),
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
    setImages([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <header className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur border-b border-[#ECEDF1] sticky top-0 z-10">
        <button
          onClick={reset}
          className="flex flex-col items-start focus-visible:outline-2 focus-visible:outline-[#2D6CFF] rounded"
          aria-label="홈으로"
        >
          <span
            className="text-[10px] tracking-[0.25em] font-medium"
            style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            AI FRAGRANCE
          </span>
          <span className="text-xl font-bold text-[#17171C] leading-tight">Sillage</span>
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
            <div className="text-center pt-4">
              <h1 className="text-2xl font-bold text-[#17171C] mb-2">추구미로 찾는 향수</h1>
              <p className="text-sm text-[#6B6E7B]">
                내 추구미 이미지를 올리면 AI가 딱 맞는 향수를 골라드려요
              </p>
            </div>

            {/* 드롭존 */}
            <label
              htmlFor="image-upload"
              className={`block w-full rounded-[22px] border-2 border-dashed transition-all py-10 px-6 text-center cursor-pointer ${
                dragging ? "border-[#2D6CFF] bg-[#2D6CFF]/5" : "border-[#ECEDF1] bg-white hover:border-[#A586FF]/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
              }}
            >
              <div
                className="text-3xl mb-2"
                aria-hidden="true"
                style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                ✦
              </div>
              <p className="text-base font-medium text-[#17171C] mb-0.5">
                추구미 이미지를 올려주세요
              </p>
              <p className="text-xs text-[#9A9CA8]">
                클릭 또는 드래그 · 최대 {MAX_IMAGES}장 · JPG·PNG·WEBP · 각 5MB 이하
              </p>
            </label>

            <input
              id="image-upload"
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); }}
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
            />

            {/* 썸네일 그리드 */}
            {images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[#6B6E7B] font-medium">{images.length}/{MAX_IMAGES}장</p>
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="text-xs text-[#2D6CFF] font-medium hover:underline"
                    >
                      + 추가
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={img.preview} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="이미지 삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <label
                      htmlFor="image-upload"
                      className="aspect-square rounded-xl border-2 border-dashed border-[#ECEDF1] flex items-center justify-center cursor-pointer hover:border-[#A586FF]/50 transition-colors"
                    >
                      <span className="text-[#9A9CA8] text-lg leading-none">+</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm px-4 py-3 text-center">
                {error}
              </div>
            )}

            {images.length > 0 && (
              <button
                onClick={analyze}
                className="w-full py-4 rounded-2xl text-white font-semibold text-base tracking-wide transition-opacity hover:opacity-90"
                style={{ background: "#2D6CFF" }}
              >
                향수 추천 받기
              </button>
            )}

            <p className="text-[11px] text-[#9A9CA8] text-center leading-relaxed">
              AI가 이미지를 해석해 큐레이션 목록에서 고른 추천이며, 실제 향은 다르게 느껴질 수 있습니다.
            </p>
          </div>
        )}

        {state === "loading" && images.length > 0 && (
          <Loading previews={images.map(i => i.preview)} />
        )}

        {state === "result" && result && (
          <ResultView data={result} previews={images.map(i => i.preview)} onReset={reset} />
        )}
      </main>
    </div>
  );
}
