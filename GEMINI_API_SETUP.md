# 🚀 Google Gemini API 키 설정 가이드

AI 기능(Article Writer, Blog Writer)을 사용하기 위해 Google Gemini API 키가 필요합니다.

## 📋 Step 1: Google Gemini API 키 발급

### 1-1. API 키 발급 사이트 접속

**URL**: https://aistudio.google.com/app/apikey

### 1-2. Google 계정 로그인
- 개인 Google 계정으로 로그인
- Gmail 계정이 있으면 바로 사용 가능

### 1-3. API 키 생성
1. **"Get API key"** 또는 **"Create API Key"** 버튼 클릭
2. 프로젝트 선택:
   - 기존 Google Cloud 프로젝트가 있으면 선택
   - 없으면 **"Create API key in new project"** 선택 (권장)
3. API 키가 생성되면 **복사** 버튼 클릭

**생성된 키 형태:**
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **중요**: 이 키는 다시 볼 수 없으니 반드시 안전한 곳에 저장하세요!

---

## 📋 Step 2: Vercel에 환경변수 설정

### 2-1. Vercel Dashboard 접속
```
https://vercel.com/dashboard
```

### 2-2. 프로젝트 선택
- **"toolist"** 프로젝트 클릭

### 2-3. Settings 메뉴 이동
- 상단 메뉴에서 **"Settings"** 클릭

### 2-4. Environment Variables 설정
1. 왼쪽 메뉴에서 **"Environment Variables"** 클릭
2. **"Add New"** 버튼 클릭
3. 다음 정보 입력:

```
Name: GEMINI_API_KEY
Value: [Step 1에서 복사한 API 키 붙여넣기]
```

4. **Environment 선택**:
   - ✅ **Production** (체크)
   - ✅ **Preview** (체크)
   - ✅ **Development** (체크)

5. **"Save"** 버튼 클릭

---

## 📋 Step 3: 재배포

### 3-1. Deployments 메뉴 이동
- 상단 메뉴에서 **"Deployments"** 클릭

### 3-2. 재배포 실행
1. 가장 최근 배포(맨 위)를 찾기
2. 오른쪽 **점 3개(...)** 버튼 클릭
3. **"Redeploy"** 선택
4. **"Redeploy"** 버튼 다시 클릭하여 확인

### 3-3. 배포 완료 대기
- 보통 1-2분 소요
- 상태가 **"Ready"**가 되면 완료
- 초록색 체크 표시 확인

---

## 📋 Step 4: 테스트

### 4-1. AI Article Writer 테스트
1. https://toolist-mu.vercel.app/tools/article-writer 접속
2. 테스트 입력:
   - **기사 스타일**: 뉴스 기사
   - **키워드**: `인공지능 기술의 발전`
3. **"기사 생성"** 버튼 클릭
4. 로딩 후 기사가 생성되는지 확인

### 4-2. AI Blog Writer 테스트
1. https://toolist-mu.vercel.app/tools/blog-writer 접속
2. 테스트 입력:
   - **블로그 타입**: How-to 가이드
   - **주제**: `Next.js로 블로그 만들기`
3. **"블로그 생성하기"** 버튼 클릭
4. 로딩 후 블로그가 생성되는지 확인

---

## 🔧 로컬 개발 환경 설정 (선택사항)

로컬에서도 테스트하고 싶다면:

### 1. .env.local 파일 생성
```bash
# 프로젝트 루트 디렉토리에서
touch .env.local
```

### 2. API 키 추가
```bash
# .env.local 파일 내용
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. 개발 서버 재시작
```bash
npm run dev
```

### 4. 로컬 테스트
```
http://localhost:3000/tools/article-writer
```

---

## ✅ 체크리스트

- [ ] Google Gemini API 키 발급 완료
- [ ] API 키를 안전한 곳에 저장
- [ ] Vercel Environment Variables에 추가
- [ ] Production, Preview, Development 모두 체크
- [ ] Vercel 재배포 완료
- [ ] 배포 상태 "Ready" 확인
- [ ] Article Writer 테스트 성공
- [ ] Blog Writer 테스트 성공

---

## 💡 추가 정보

### Google Gemini 무료 티어 제한
```
✓ 60 requests/minute
✓ 1,500 requests/day
✓ 32,000 tokens per request
✓ 완전 무료
✓ 신용카드 불필요
```

### API 키 보안
- ⚠️ API 키를 GitHub에 커밋하지 마세요
- ⚠️ `.env.local`은 `.gitignore`에 포함되어 있습니다
- ✅ Vercel 환경변수로만 관리하세요

### 문제 해결

**1. 여전히 API 키 오류가 나는 경우:**
```
GEMINI_API_KEY가 설정되지 않았습니다.
```
→ Vercel 재배포 확인 (환경변수 저장 후 반드시 재배포 필요)

**2. API 키가 유효하지 않은 경우:**
```
API 키 오류
```
→ API 키를 다시 확인하고 올바르게 복사했는지 확인

**3. 할당량 초과:**
```
API 할당량 초과
```
→ 잠시 후 다시 시도 (무료 티어: 60 requests/minute)

---

## 📞 도움이 필요하신가요?

- Google AI Studio: https://aistudio.google.com
- Gemini API 문서: https://ai.google.dev/tutorials/get_started_web
- GitHub Issues: https://github.com/joshweb83/toolist/issues
