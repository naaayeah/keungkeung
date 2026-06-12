"use client";

const FAMILY_COLORS: Record<string, { top: string; bottom: string }> = {
  "플로럴": { top: "#FFB7C5", bottom: "#FF8FAB" },
  "시트러스": { top: "#FFE066", bottom: "#FFB347" },
  "우디": { top: "#C8A97A", bottom: "#8B6340" },
  "오리엔탈": { top: "#C9A24B", bottom: "#7B4F1A" },
  "아쿠아틱": { top: "#7EC8E3", bottom: "#3A8CB0" },
  "아로마틱": { top: "#9DAE8C", bottom: "#5A7A4A" },
  "구르망": { top: "#E8A0BF", bottom: "#C06090" },
  "머스키": { top: "#D4C5E2", bottom: "#9B8DB5" },
  default: { top: "#A586FF", bottom: "#5AA9FF" },
};

function getFamilyColor(family: string) {
  for (const key of Object.keys(FAMILY_COLORS)) {
    if (key !== "default" && family.includes(key)) {
      return FAMILY_COLORS[key];
    }
  }
  return FAMILY_COLORS.default;
}

interface BottleProps {
  family: string;
  size?: number;
}

export default function Bottle({ family, size = 80 }: BottleProps) {
  const { top, bottom } = getFamilyColor(family);
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
      {/* cap */}
      <rect x="28" y="2" width="24" height="14" rx="4" fill={top} opacity="0.9" />
      {/* neck */}
      <rect x="32" y="14" width="16" height="12" rx="2" fill={`url(#${id})`} opacity="0.85" />
      {/* body */}
      <rect x="14" y="26" width="52" height="72" rx="12" fill={`url(#${id})`} opacity="0.92" />
      {/* shine */}
      <rect x="22" y="34" width="10" height="44" rx="5" fill="white" opacity="0.18" />
      {/* label */}
      <rect x="20" y="64" width="40" height="22" rx="4" fill="white" opacity="0.2" />
    </svg>
  );
}
