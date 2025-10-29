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

### 로컬 개발 환경

1. `.env.local.example` 파일을 복사하여 `.env.local` 생성:

```bash
cp .env.local.example .env.local
```

2. `.env.local` 파일에 실제 API 키 입력:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

3. Gemini API 키 발급: [Google AI Studio](https://makersuite.google.com/app/apikey)

### Vercel 배포 환경

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

### 🔄 자동 배포 워크플로우

이 프로젝트는 **GitHub Actions**를 통해 자동으로 배포됩니다.

#### 개발 프로세스

```bash
# 1. claude/* 브랜치에서 작업
git checkout -b claude/your-feature-name

# 2. 코드 수정 및 커밋
git add .
git commit -m "feat: Add new feature"

# 3. GitHub에 Push
git push -u origin claude/your-feature-name

# 4. 자동 실행:
#    ✅ GitHub Actions가 자동으로 main 브랜치에 머지
#    ✅ Vercel이 자동으로 Production 배포
```

#### 자동 배포 플로우

1. **`claude/**` 브랜치에 Push**
   → GitHub Actions가 자동으로 main 브랜치에 머지

2. **main 브랜치 업데이트**
   → Vercel이 자동으로 Production 배포

3. **배포 완료**
   → 실시간으로 사이트 반영

**결과:** 어떤 브랜치에서 작업하더라도 `claude/*` 패턴이면 자동으로 Production에 배포됩니다! 🚀

### Vercel 초기 설정

#### 1단계: Vercel과 GitHub 연동

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New Project" 클릭
3. GitHub 저장소 `joshweb83/toolist` 선택
4. Framework Preset: **Next.js** 자동 감지
5. Root Directory: `.` (기본값)

#### 2단계: 환경 변수 설정

Vercel Dashboard → 프로젝트 선택 → Settings → Environment Variables

```
GEMINI_API_KEY=your_gemini_api_key_here
```

**적용 환경 선택:**
- ✅ Production
- ✅ Preview
- ✅ Development

#### 3단계: 자동 배포 동작

연동 완료 후 자동으로 배포됩니다:

- **Main 브랜치 Push** → ✅ Production 배포 (자동)
- **Claude 브랜치 Push** → ✅ Main 머지 → Production 배포 (자동)
- **다른 브랜치 Push** → 🔍 Preview 배포 (자동)

#### 배포 확인

- Production URL: `https://toolist-[project-id].vercel.app`
- GitHub Actions: Repository → Actions 탭에서 워크플로우 확인

#### 배포 실패 시 확인사항

1. GitHub Actions 로그 확인 (Actions 탭)
2. Vercel Dashboard → Deployments에서 로그 확인
3. 환경 변수 설정 확인
4. `vercel.json` 설정 확인

## 📝 라이선스

ISC
