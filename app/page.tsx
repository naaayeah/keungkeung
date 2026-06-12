"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";
import ResultView from "@/components/ResultView";
import ProductImage from "@/components/ProductImage";
import { PERFUMES } from "@/data/perfumes";
import type { Perfume } from "@/data/perfumes";

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
  const [popular, setPopular] = useState<{ perfume: Perfume; count: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/popular")
      .then((r) => r.json())
      .then((d: { ranked: { id: string; count: number }[] }) => {
        const top = d.ranked
          .map((r) => ({ perfume: PERFUMES.find((p) => p.id === r.id), count: r.count }))
          .filter((x): x is { perfume: Perfume; count: number } => !!x.perfume)
          .slice(0, 5);
        setPopular(top);
      })
      .catch(() => {});
  }, [state]);

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
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="flex items-center justify-between px-5 py-4 bg-white/85 backdrop-blur border-b border-[#E5E5E5] sticky top-0 z-10">
        <button
          onClick={reset}
          className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#111111] rounded group"
          aria-label="홈으로"
        >
          <span className="group-hover:animate-[wiggle_0.5s_ease]" aria-hidden="true">
            <MiniBottleIcon />
          </span>
          <span className="flex flex-col items-start">
            <span className="text-[9px] tracking-[0.25em] font-medium text-[#999999]">AI FRAGRANCE</span>
            <span className="text-lg font-extrabold text-[#111111] leading-tight">킁킁</span>
          </span>
        </button>
        <Link
          href="/saved"
          className="text-sm text-[#555555] hover:text-[#111111] transition-colors focus-visible:outline-2 focus-visible:outline-[#111111] rounded px-1 flex items-center gap-1.5"
        >
          <HeartSmallIcon />
          저장함
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-5 py-10 pb-20">
        {state === "upload" && (
          <div className="flex flex-col gap-8">
            {/* 히어로 */}
            <div className="relative text-center pt-4 pb-1">
              <div className="flex items-end justify-center gap-6 mb-6" aria-hidden="true">
                <HeroBottle shade="#BBBBBB" size={32} delay="0s" />
                <HeroBottle shade="#111111" size={46} delay="0.5s" face />
                <HeroBottle shade="#777777" size={32} delay="1s" />
              </div>
              <h1 className="text-[26px] font-extrabold text-[#111111] mb-3 tracking-tight">
                당신의 향을 찾아드립니다
              </h1>
              <p className="text-sm text-[#555555] leading-relaxed">
                내 추구미 이미지를 올리면 AI가 딱 맞는 향수를 골라드려요
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {["청순한", "미니멀", "바닷가", "빈티지", "도시적인", "몽환적인"].map((kw, i) => (
                  <span
                    key={kw}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#555555] transition-all duration-300 hover:-translate-y-1 hover:border-[#111111] hover:text-[#111111] hover:shadow-sm cursor-default animate-[fadeUp_0.5s_ease_both]"
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 드롭존 */}
            <label
              htmlFor="image-upload"
              className={`group block w-full rounded-[22px] border-2 border-dashed transition-all duration-300 py-12 px-6 text-center cursor-pointer ${
                dragging ? "border-[#111111] bg-[#111111]/5 scale-[1.01]" : "border-[#DDDDDD] bg-white hover:border-[#111111]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
              }}
            >
              <div className="flex justify-center mb-3 text-[#111111] transition-transform duration-300 group-hover:-translate-y-1 group-hover:animate-[wiggle_0.5s_ease]" aria-hidden="true">
                <CameraIcon />
              </div>
              <p className="text-base font-semibold text-[#111111] mb-1.5">
                추구미 이미지를 올려주세요
              </p>
              <p className="text-xs text-[#999999] leading-relaxed">
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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#555555] font-medium">{images.length}/{MAX_IMAGES}장</p>
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="text-xs text-[#111111] font-semibold hover:underline"
                    >
                      + 추가
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group animate-[fadeUp_0.3s_ease_both]">
                      <img src={img.preview} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="이미지 삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <label
                      htmlFor="image-upload"
                      className="aspect-square rounded-xl border-2 border-dashed border-[#DDDDDD] flex items-center justify-center cursor-pointer hover:border-[#111111] transition-colors"
                    >
                      <span className="text-[#999999] text-lg leading-none">+</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-2xl border border-[#DDDDDD] bg-white text-[#111111] text-sm px-4 py-3.5 text-center">
                {error}
              </div>
            )}

            {images.length > 0 && (
              <button
                onClick={analyze}
                className="w-full py-4 rounded-2xl text-white font-bold text-base tracking-wide bg-[#111111] transition-all hover:bg-[#333333] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <SniffIcon />
                킁킁, 향수 찾아보기
              </button>
            )}

            {/* 사용 방법 3단계 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { step: "01", title: "이미지 업로드", desc: "추구미를 담은 사진을 올려요", icon: <UploadIcon /> },
                { step: "02", title: "AI 무드 분석", desc: "분위기·컬러·감성을 읽어요", icon: <SparkleIcon /> },
                { step: "03", title: "향수 추천", desc: "딱 맞는 향수를 골라드려요", icon: <DropIcon /> },
              ].map((s, i) => (
                <div
                  key={s.step}
                  className="bg-white rounded-2xl border border-[#E5E5E5] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#111111] animate-[fadeUp_0.5s_ease_both] group"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className="flex justify-center mb-2.5 text-[#111111] group-hover:animate-[wiggle_0.5s_ease]">{s.icon}</div>
                  <p className="text-[9px] tracking-[0.2em] text-[#999999] mb-1.5">{s.step}</p>
                  <p className="text-xs font-bold text-[#111111] mb-1.5">{s.title}</p>
                  <p className="text-[10px] text-[#999999] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* 인기 향수 TOP 5 */}
            {popular.length > 0 && (
              <div className="bg-white rounded-[22px] border border-[#E5E5E5] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[#111111]" aria-hidden="true"><CrownIcon /></span>
                  <h2 className="text-[15px] font-bold text-[#111111]">지금 인기 향수</h2>
                  <span className="text-[10px] text-[#999999]">저장 많은 순</span>
                </div>
                <ol className="flex flex-col gap-1">
                  {popular.map(({ perfume, count }, i) => (
                    <li key={perfume.id}>
                      <a
                        href={perfume.channels?.[0]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 py-2.5 px-2 rounded-xl transition-colors hover:bg-[#F7F7F7] group"
                      >
                        <span className={`w-6 text-center text-sm font-extrabold flex-shrink-0 ${i === 0 ? "text-[#111111]" : "text-[#BBBBBB]"}`}>
                          {i + 1}
                        </span>
                        <span className="flex-shrink-0 w-11 h-11 bg-[#F5F5F5] rounded-lg flex items-center justify-center overflow-hidden">
                          <ProductImage imageUrl={perfume.imageUrl} family={perfume.family} size={36} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[10px] text-[#999999] tracking-wider uppercase">{perfume.brand}</span>
                          <span className="block text-[13px] font-semibold text-[#111111] truncate group-hover:underline">{perfume.name}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#999999] flex-shrink-0">
                          <HeartSmallIcon />
                          {count}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="text-[11px] text-[#999999] text-center leading-relaxed px-4">
              AI가 이미지를 해석해 큐레이션 목록에서 고른 추천이며, 실제 향은 다르게 느껴질 수 있어요.
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

function HeroBottle({ shade, size, delay, face }: { shade: string; size: number; delay: string; face?: boolean }) {
  return (
    <svg
      width={size} height={size * 1.4} viewBox="0 0 40 56" fill="none"
      style={{ animation: `floaty 3.2s ease-in-out ${delay} infinite` }}
    >
      <rect x="15" y="2" width="10" height="8" rx="2" fill={shade} opacity="0.6" />
      <rect x="13" y="9" width="14" height="4" rx="1.5" fill={shade} opacity="0.8" />
      <rect x="6" y="14" width="28" height="38" rx="9" fill={shade} opacity={face ? 1 : 0.25} />
      <rect x="6" y="14" width="28" height="38" rx="9" stroke={shade} strokeWidth="2" opacity="0.7" />
      {face ? (
        <>
          <circle cx="15" cy="31" r="2" fill="white" />
          <circle cx="25" cy="31" r="2" fill="white" />
          <path d="M16 38c1.5 2 6.5 2 8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        <rect x="11" y="28" width="18" height="19" rx="6" fill={shade} opacity="0.35" />
      )}
    </svg>
  );
}

function MiniBottleIcon() {
  return (
    <svg width="20" height="26" viewBox="0 0 40 56" fill="none">
      <rect x="15" y="2" width="10" height="8" rx="2" fill="#111111" opacity="0.6" />
      <rect x="13" y="9" width="14" height="4" rx="1.5" fill="#111111" opacity="0.8" />
      <rect x="6" y="14" width="28" height="38" rx="9" fill="#111111" />
      <circle cx="15" cy="31" r="2" fill="white" />
      <circle cx="25" cy="31" r="2" fill="white" />
      <path d="M16 38c1.5 2 6.5 2 8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartSmallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7.5-4.8-9.8-9.2C.6 8.6 2.6 5 6.1 5c2 0 3.4 1.1 4.2 2.3L12 9l1.7-1.7C14.5 6.1 15.9 5 17.9 5c3.5 0 5.5 3.6 3.9 6.8C19.5 16.2 12 21 12 21z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8a2 2 0 0 1 2-2h1.5l1.2-2h8.6l1.2 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function SniffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 9c2-2 4 2 6 0s4 2 6 0" opacity="0.5" />
      <path d="M4 14c2-2 4 2 6 0s4 2 6 0" />
      <path d="M4 19c2-2 4 2 6 0s4 2 6 0" opacity="0.5" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-4.5-4.5L7 20" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
    </svg>
  );
}

function DropIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6.5 7 6.5 12a6.5 6.5 0 1 1-13 0C5.5 10 12 3 12 3z" />
      <path d="M9.5 14.5a3 3 0 0 0 3 3" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.5 11h-15L3 8z" />
    </svg>
  );
}
