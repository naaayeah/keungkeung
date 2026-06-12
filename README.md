# Sillage — AI 향수 추천 웹앱

분위기 이미지를 올리면 AI가 어울리는 향수를 큐레이션 목록에서 골라주는 서비스.

## 실행 방법

### 1. 환경 변수 설정

`.env.local` 파일을 열고 API 키를 넣어주세요:

```
ANTHROPIC_API_KEY=sk-ant-...
DAILY_LIMIT=20
```

> ⚠️ **API 키는 서버에만 두세요.** 브라우저(클라이언트 사이드)에 절대 노출되지 않습니다.

### 2. 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 구조

```
app/
  page.tsx              # 업로드·결과 화면
  saved/page.tsx        # 저장함
  api/analyze/route.ts  # 서버 프록시 (AI 호출은 여기서만)
components/
  Bottle.tsx            # SVG 향수병 폴백
  ProductCard.tsx       # 향수 카드
  ResultView.tsx        # 결과 화면 전체
  Loading.tsx           # 로딩 상태
data/perfumes.ts        # 시드 데이터 21종
lib/
  cache.ts              # sha256 이미지 해시 캐시
  ratelimit.ts          # IP별 분당·일일 제한
```

## 주요 정책

- 추천 향수는 `data/perfumes.ts`의 21종 안에서만 나옵니다.
- AI는 무드 해석과 '어울리는 이유'만 생성하며, 노트·가격·향기설명은 시드에서 가져옵니다.
- 같은 이미지는 sha256 해시로 24시간 캐시해 재호출하지 않습니다.
- IP 기준 분당 5회, 일일 20회(환경변수로 조정 가능) 제한.
