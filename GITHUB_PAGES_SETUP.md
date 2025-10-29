# GitHub Pages 배포 설정 가이드

이 문서는 Toolist를 GitHub Pages에 배포하기 위한 설정 가이드입니다.

## 📋 사전 요구사항

- GitHub 저장소에 코드가 푸시되어 있어야 합니다
- GitHub Actions 워크플로우 권한이 필요합니다

## 🚀 설정 방법

### 1단계: GitHub Pages 활성화

1. GitHub 저장소로 이동
2. **Settings** → **Pages** 클릭
3. **Source** 섹션에서 **GitHub Actions** 선택
4. 저장

### 2단계: 워크플로우 파일 생성

GitHub 저장소에서 직접 워크플로우 파일을 생성해야 합니다.

1. 저장소의 **Actions** 탭 클릭
2. "set up a workflow yourself" 클릭
3. 파일 이름: `.github/workflows/deploy-gh-pages.yml`
4. 아래 내용을 붙여넣기:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - master
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with Next.js
        run: npm run build
        env:
          NODE_ENV: production
          GITHUB_PAGES: true

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. **Commit changes** 클릭

### 3단계: 배포 확인

1. **Actions** 탭에서 워크플로우 실행 확인
2. 완료되면 **Settings** → **Pages**에서 URL 확인
3. GitHub Pages URL: `https://[username].github.io/toolist/`

## 🔍 주의사항

### Vercel vs GitHub Pages

이 프로젝트는 두 가지 배포 방식을 모두 지원합니다:

| 기능 | Vercel | GitHub Pages |
|------|--------|--------------|
| 배포 방식 | SSR + Static | Static Only |
| API Routes | ✅ 지원 | ❌ 미지원 |
| 빌드 시간 | 빠름 | 보통 |
| 커스텀 도메인 | ✅ 무료 | ✅ 무료 |
| 자동 배포 | ✅ Push 시 | ✅ Push 시 |

**권장사항:**
- **Production**: Vercel (https://toolist-mu.vercel.app)
- **Backup/Mirror**: GitHub Pages

### 환경 변수

GitHub Pages는 정적 사이트이므로 환경 변수를 사용할 수 없습니다:
- `GEMINI_API_KEY`: GitHub Pages에서 작동하지 않음
- API를 사용하는 기능이 필요하면 Vercel을 사용하세요

## 🐛 문제 해결

### 배포 실패

1. **Actions 탭**에서 로그 확인
2. Node.js 버전 확인 (18.x 이상)
3. `npm ci` 실행 여부 확인
4. `GITHUB_PAGES=true` 환경변수 설정 확인

### 페이지가 로드되지 않음

1. GitHub Pages 설정 확인
2. `public/.nojekyll` 파일 존재 확인
3. `basePath`가 `/toolist`로 설정되어 있는지 확인

### 스타일이 깨짐

1. `next.config.js`에서 `assetPrefix` 확인
2. 브라우저 캐시 삭제
3. 하드 리프레시 (Ctrl + Shift + R)

## 📚 추가 자료

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
