"use client";

const KEY = "sillage-saved";

export function getSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function setSavedIds(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
}

// 찜 토글 + 서버 인기 집계 반영 (실패해도 UI는 영향 없음)
export function reportSaveDelta(id: string, delta: 1 | -1) {
  fetch("/api/popular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, delta }),
  }).catch(() => {});
}
