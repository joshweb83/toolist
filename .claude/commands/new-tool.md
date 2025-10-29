---
description: 새로운 툴을 Toolist에 추가합니다 (타이틀 제안, 메인/사이드메뉴 추가, 페이지 생성, 반응형 디자인 적용)
---

# 새로운 툴 추가

사용자가 만들고 싶은 툴에 대해 설명하면, 다음 프로세스를 따라 새로운 툴을 추가합니다.

## 작업 순서

1. **툴 정보 수집**
   - 사용자에게 툴의 기능을 물어보기
   - 적절한 영문 타이틀과 한글 타이틀 제안하기
   - 사용자 확인 받기

2. **파일명 생성**
   - 영문 타이틀을 kebab-case로 변환 (예: "QR Code Generator" → "qr-code-generator")
   - 파일 경로: `pages/tools/[tool-name].js`

3. **메인 페이지 업데이트** (`pages/index.js`)
   - tools 배열에 새로운 툴 추가
   ```javascript
   {
     name: '[English Title]',
     description: '[한글 설명]',
     href: '/tools/[tool-name]',
   }
   ```

4. **사이드 메뉴 업데이트** (`components/Layout.js`)
   - menuItems 배열에 새로운 툴 추가
   - 적절한 아이콘 선택 (Material-UI Icons 사용)
   ```javascript
   { text: '[English Title]', href: '/tools/[tool-name]', icon: <IconName /> }
   ```

5. **새 툴 페이지 생성** (`pages/tools/[tool-name].js`)
   - `.claude/DESIGN_GUIDE.md`의 디자인 가이드를 엄격히 따름
   - 반응형 디자인 적용 (xs, sm, md 브레이크포인트)
   - Paper elevation={3} 컨테이너 사용
   - 타이틀 섹션 (영문 + 한글) 포함
   - 사용자가 요청한 기능 구현
   - useState/useEffect 훅 활용
   - Material-UI 컴포넌트 사용

## 디자인 가이드 준수사항

### 필수 구조
```jsx
<Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
  <Box sx={{ textAlign: 'center', mb: 4 }}>
    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
      [English Title]
    </Typography>
    <Typography variant="subtitle1" color="text.secondary">
      [한글 타이틀]
    </Typography>
  </Box>
  {/* 메인 컨텐츠 */}
</Paper>
```

### 반응형 패턴
- 모바일 우선 접근
- Grid system: `xs={12} md={6}` 형태로 사용
- 반응형 패딩: `sx={{ p: { xs: 2, sm: 4 } }}`
- 폰트 크기 조정: `sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}`
- Flexbox 방향: `flexDirection: { xs: 'column', md: 'row' }`

### 컴포넌트 선택 가이드
- **입력 폼**: TextField, Select, Button
- **결과 표시**: Alert, Paper, Typography
- **레이아웃**: Grid, Box, Container
- **강조**: Paper variant="outlined", backgroundColor: 'action.hover'

## 아이콘 선택 가이드

자주 사용하는 Material-UI 아이콘:
- **계산기**: CalculateIcon
- **타이머**: TimerIcon, AccessTimeIcon
- **이미지**: ImageIcon, ImageSearchIcon
- **문서**: DescriptionIcon, ArticleIcon
- **코드**: CodeIcon
- **차트**: BarChartIcon, PieChartIcon
- **변환**: SwapHorizIcon, TransformIcon
- **다운로드**: DownloadIcon, GetAppIcon
- **업로드**: UploadIcon, CloudUploadIcon
- **QR코드**: QrCodeIcon, QrCode2Icon
- **색상**: PaletteIcon, ColorLensIcon
- **텍스트**: TextFieldsIcon, FormatSizeIcon
- **날짜**: CalendarTodayIcon, EventIcon
- **위치**: PlaceIcon, LocationOnIcon

## 작업 완료 후

1. 사용자에게 변경 사항 요약 제시
2. 로컬에서 테스트 권장 (`npm run dev`)
3. 자동으로 GitHub에 커밋 및 푸시
4. 커밋 메시지 형식:
   ```
   feat: Add [Tool Name] tool

   - Add [tool-name] page with responsive design
   - Update main page and side menu
   - Implement [기능 설명]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

## 예시

**사용자 요청:** "새로운 툴 작성할게. QR 코드 생성기 만들어줘"

**처리 과정:**
1. ✅ 타이틀 제안: "QR Code Generator" / "QR 코드 생성기"
2. ✅ 파일명: `qr-code-generator.js`
3. ✅ 아이콘: `QrCode2Icon`
4. ✅ 메인 페이지에 추가
5. ✅ 사이드 메뉴에 추가
6. ✅ 새 페이지 생성 (반응형, 디자인 가이드 준수)
7. ✅ 텍스트 입력 → QR 코드 생성 기능 구현
8. ✅ GitHub 커밋 & 푸시

## 중요 사항

- **반드시** `.claude/DESIGN_GUIDE.md` 파일을 먼저 읽고 디자인 가이드를 숙지할 것
- 모든 툴은 일관된 디자인 패턴을 따라야 함
- 반응형 디자인은 필수 (모바일/데스크탑 모두 지원)
- 사용자 입력 검증 필수
- 에러 처리 구현
- Material-UI 컴포넌트 최대한 활용
