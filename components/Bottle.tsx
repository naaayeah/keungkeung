"use client";

// 모노톤 폴백 향수병. 향조별로 회색 농도만 달리한다.
const FAMILY_SHADES: Record<string, { top: string; bottom: string }> = {
  "플로럴": { top: "#D9D9D9", bottom: "#8C8C8C" },
  "시트러스": { top: "#E5E5E5", bottom: "#999999" },
  "우디": { top: "#B3B3B3", bottom: "#4D4D4D" },
  "오리엔탈": { top: "#A6A6A6", bottom: "#333333" },
  "아쿠아틱": { top: "#E0E0E0", bottom: "#7A7A7A" },
  "아로마틱": { top: "#CCCCCC", bottom: "#666666" },
  "구르망": { top: "#C4C4C4", bottom: "#5C5C5C" },
  "머스키": { top: "#D1D1D1", bottom: "#707070" },
  default: { top: "#CFCFCF", bottom: "#5A5A5A" },
};

function getFamilyShade(family: string) {
  for (const key of Object.keys(FAMILY_SHADES)) {
    if (key !== "default" && family.includes(key)) {
      return FAMILY_SHADES[key];
    }
  }
  return FAMILY_SHADES.default;
}

interface BottleProps {
  family: string;
  size?: number;
}

export default function Bottle({ family, size = 80 }: BottleProps) {
  const { top, bottom } = getFamilyShade(family);
  const id = `grad-${family.replace(/\s/g, "")}-${size}`;

  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 80 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${family} 향수병`}
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x="28" y="2" width="24" height="14" rx="4" fill={bottom} opacity="0.9" />
      <rect x="32" y="14" width="16" height="12" rx="2" fill={`url(#${id})`} opacity="0.85" />
      <rect x="14" y="26" width="52" height="72" rx="12" fill={`url(#${id})`} opacity="0.92" />
      <rect x="22" y="34" width="10" height="44" rx="5" fill="white" opacity="0.25" />
      <rect x="20" y="64" width="40" height="22" rx="4" fill="white" opacity="0.3" />
    </svg>
  );
}
