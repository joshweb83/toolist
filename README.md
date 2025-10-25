# Toolist

다양한 웹 도구를 제공하는 Next.js 애플리케이션

## 🛠️ 포함된 도구

- **부가세 계산기** (VAT Calculator)
- **인쇄물 해상도 체커** (Resolution Checker)
- **스크립트 타이머** (Script Timer)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 결과를 확인하세요.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 🔐 환경 변수

Vercel 배포 시 다음 환경 변수가 필요합니다:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Vercel에서 환경 변수 설정

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. `GEMINI_API_KEY` 추가
4. Production, Preview, Development 환경 선택
5. Save

## 📦 기술 스택

- **Framework**: Next.js 14
- **UI Library**: Material-UI (MUI)
- **AI Integration**: Google Generative AI (Gemini)
- **Styling**: Emotion

## 🌐 배포

### Vercel 배포

1. GitHub 저장소와 연결
2. 환경 변수 설정
3. 자동 배포

## 📝 라이선스

ISC
