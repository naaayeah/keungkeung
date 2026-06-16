"use client";

import { useState } from "react";
import Bottle from "./Bottle";

interface ProductImageProps {
  imageUrl?: string;
  family: string;
  size?: number;
  fill?: boolean; // true면 부모 칸을 꽉 채운다 (흰 배경, contain)
}

export default function ProductImage({ imageUrl, family, size = 54, fill = false }: ProductImageProps) {
  const [failed, setFailed] = useState(!imageUrl);

  if (failed || !imageUrl) {
    return <Bottle family={family} size={fill ? 72 : size} />;
  }

  // 동일 출처 프록시 경유 — 핫링크 안정화 + 결과 카드 PNG 캡처 시 이미지 정상 렌더
  const src = imageUrl.includes("fimgs.net")
    ? `/api/img?u=${encodeURIComponent(imageUrl)}`
    : imageUrl;

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      crossOrigin="anonymous"
      onError={() => setFailed(true)}
      style={
        fill
          ? { width: "100%", height: "100%", objectFit: "contain", background: "#fff" }
          : { width: size, height: size, objectFit: "contain", borderRadius: 10, background: "#fff" }
      }
    />
  );
}
