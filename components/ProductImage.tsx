"use client";

import { useState } from "react";
import Bottle from "./Bottle";

interface ProductImageProps {
  imageUrl?: string;
  family: string;
  size?: number;
}

export default function ProductImage({ imageUrl, family, size = 54 }: ProductImageProps) {
  const [failed, setFailed] = useState(!imageUrl);

  if (failed || !imageUrl) {
    return <Bottle family={family} size={size} />;
  }

  return (
    <img
      src={imageUrl}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: 10,
        background: "#fff",
      }}
    />
  );
}
