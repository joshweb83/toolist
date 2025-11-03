# Toolist

다양한 웹 도구를 제공하는 Next.js 애플리케이션

## 🌐 라이브 사이트

**Production:** [https://toolist-mu.vercel.app](https://toolist-mu.vercel.app)

> 각 툴 페이지 직접 링크:
> - [Script Timer](https://toolist-mu.vercel.app/tools/script-timer)
> - [VAT Calculator](https://toolist-mu.vercel.app/tools/vat-calculator)
> - [Print Resolution Checker](https://toolist-mu.vercel.app/tools/resolution-checker)
> - [QR Code Generator](https://toolist-mu.vercel.app/tools/qr-code-generator)
> - [Article Writer](https://toolist-mu.vercel.app/tools/article-writer) (AI)
> - [Blog Writer](https://toolist-mu.vercel.app/tools/blog-writer) (AI)

## 🛠️ 포함된 도구

### 기본 유틸리티
- **스크립트 타이머** (Script Timer) - 대본 리딩 시간 측정
- **부가세 계산기** (VAT Calculator) - 한국 부가세 계산
- **인쇄물 해상도 체커** (Print Resolution Checker) - 이미지 해상도 점검
- **QR 코드 생성기** (QR Code Generator) - QR 코드 생성 및 다운로드

### AI 기반 툴 (Google Gemini API 필요)
- **AI 기사 작성기** (Article Writer) - 8가지 스타일의 기사 자동 생성
- **AI 블로그 작성기** (Blog Writer) - 정보 전달형 블로그 자동 생성

> 📘 **AI 툴 사용을 위한 API 키 설정 가이드**: [GEMINI_API_SETUP.md](./GEMINI_API_SETUP.md)

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

> 🚨 **AI 툴 사용 필수**: Article Writer와 Blog Writer를 사용하려면 Google Gemini API 키가 필요합니다.
>
> 📘 **상세 설정 가이드**: [GEMINI_API_SETUP.md](./GEMINI_API_SETUP.md)

### 빠른 시작

#### 1. Google Gemini API 키 발급
- https://aistudio.google.com/app/apikey 에서 무료 발급 (신용카드 불필요)
- 월 1,500 requests 무료

#### 2. 로컬 개발 환경

```bash
# .env.local 파일 생성
cp .env.local.example .env.local

# API 키 추가
echo "GEMINI_API_KEY=your_api_key_here" > .env.local
```

#### 3. Vercel 배포 환경

```
Vercel Dashboard → Settings → Environment Variables
→ GEMINI_API_KEY 추가
→ Production, Preview, Development 체크
→ Save
```

자세한 단계별 가이드는 [GEMINI_API_SETUP.md](./GEMINI_API_SETUP.md)를 참조하세요.

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

- Production URL: [https://toolist-mu.vercel.app](https://toolist-mu.vercel.app)
- Preview URL: PR 생성 시 Vercel 봇이 댓글로 제공
- GitHub Actions: Repository → Actions 탭에서 워크플로우 확인

#### 배포 실패 시 확인사항

1. GitHub Actions 로그 확인 (Actions 탭)
2. Vercel Dashboard → Deployments에서 로그 확인
3. 환경 변수 설정 확인
4. `vercel.json` 설정 확인

### GitHub Pages 배포 (선택사항)

Vercel 외에도 GitHub Pages로 사이트를 배포할 수 있습니다.

**📖 상세 설정 가이드:** [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md)

#### 빠른 시작

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: GitHub Actions 선택
3. **Actions** 탭에서 워크플로우 파일 생성 ([가이드 참조](./GITHUB_PAGES_SETUP.md))
4. Push 후 자동 배포

#### GitHub Pages URL

- `https://joshweb83.github.io/toolist/`

#### 주의사항

- 정적 사이트로 빌드 (API Routes 미지원)
- Vercel은 계속 정상 작동 (Full SSR 지원)

## 🛠️ 개발자 가이드

### 새로운 툴 추가하기

Claude Code를 사용하여 새로운 툴을 쉽게 추가할 수 있습니다:

```bash
# Claude Code에서 다음과 같이 요청하세요:
"새로운 툴 작성할게. [원하는 기능] 만들어줘"
```

또는 슬래시 커맨드 사용:
```bash
/new-tool
```

### 자동으로 처리되는 작업

1. ✅ **타이틀 제안** - 영문/한글 타이틀 자동 생성
2. ✅ **메인 페이지 업데이트** - 툴 목록에 자동 추가
3. ✅ **사이드 메뉴 업데이트** - 네비게이션에 자동 추가
4. ✅ **페이지 생성** - 디자인 가이드에 따라 자동 생성
5. ✅ **반응형 디자인** - 모바일/데스크탑 자동 지원
6. ✅ **GitHub 푸시** - 자동 커밋 및 배포

### 디자인 가이드

모든 툴은 일관된 디자인 패턴을 따릅니다:

- **컨테이너**: Paper elevation={3}
- **반응형 패딩**: `{ xs: 2, sm: 4 }`
- **타이틀**: 영문 (h4) + 한글 (subtitle1)
- **Material-UI**: 모든 컴포넌트
- **Grid 시스템**: xs/sm/md 브레이크포인트

상세 가이드: [.claude/DESIGN_GUIDE.md](.claude/DESIGN_GUIDE.md)

### 수동으로 툴 추가하기

1. **페이지 생성**: `pages/tools/tool-name.js`
2. **메인 업데이트**: `pages/index.js`의 tools 배열
3. **메뉴 업데이트**: `components/Layout.js`의 menuItems 배열
4. **디자인 적용**: `.claude/DESIGN_GUIDE.md` 참고

### 커스텀 명령어

프로젝트에는 다음 커스텀 명령어가 설정되어 있습니다:

- `/new-tool` - 새로운 툴 추가 프로세스 시작

## 📝 라이선스

ISC
