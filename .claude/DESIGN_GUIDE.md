# Toolist 디자인 가이드

## 📐 기본 구조

모든 툴 페이지는 다음 구조를 따릅니다:

```jsx
import { Paper, Typography, Box, Container } from '@mui/material';

export default function ToolName() {
  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      {/* 타이틀 섹션 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Tool Name (영문)
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          툴 이름 (한글)
        </Typography>
      </Box>

      {/* 메인 컨텐츠 */}
      {/* ... */}
    </Paper>
  );
}
```

## 🎨 디자인 원칙

### 1. 반응형 디자인

**브레이크포인트:**
- `xs`: 0px ~ 600px (모바일)
- `sm`: 600px ~ 960px (태블릿)
- `md`: 960px ~ 1280px (데스크탑)

**반응형 패딩:**
```jsx
sx={{ p: { xs: 2, sm: 4 } }}  // 모바일: 16px, 데스크탑: 32px
```

**반응형 Grid:**
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>  {/* 모바일: 전체, 데스크탑: 반 */}
    {/* 컨텐츠 */}
  </Grid>
</Grid>
```

### 2. 타이포그래피

**타이틀:**
```jsx
<Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
```

**서브타이틀:**
```jsx
<Typography variant="subtitle1" color="text.secondary">
```

**본문:**
```jsx
<Typography variant="body1" color="text.primary">
```

**캡션:**
```jsx
<Typography variant="caption" color="text.secondary">
```

### 3. 컬러 스킴

- **Primary**: 주요 액션 버튼, 강조 텍스트
- **Secondary**: 보조 정보
- **text.primary**: 기본 텍스트
- **text.secondary**: 보조 텍스트, 설명
- **action.hover**: 배경 강조 영역
- **background.paper**: 카드 배경

### 4. 레이아웃 패턴

**좌우 분할 레이아웃:**
```jsx
<Box sx={{ display: 'flex', gap: 4, alignItems: 'stretch' }}>
  <Box sx={{ flex: '1 1 50%' }}>  {/* 왼쪽 */}
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
      {/* 입력 폼 */}
    </Paper>
  </Box>

  <Box sx={{ flex: '1 1 50%' }}>  {/* 오른쪽 */}
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
      {/* 결과 표시 */}
    </Paper>
  </Box>
</Box>
```

**그리드 레이아웃:**
```jsx
<Grid container spacing={3} justifyContent="center">
  <Grid item xs={12} md={6}>
    {/* 컨텐츠 */}
  </Grid>
  <Grid item xs={12} md={6}>
    {/* 컨텐츠 */}
  </Grid>
</Grid>
```

### 5. 폼 입력

**텍스트 필드:**
```jsx
<TextField
  label="레이블"
  variant="outlined"
  fullWidth
  value={value}
  onChange={handleChange}
  margin="normal"
  InputProps={{
    startAdornment: <InputAdornment position="start">₩</InputAdornment>,
  }}
/>
```

**셀렉트 박스:**
```jsx
<FormControl fullWidth>
  <InputLabel id="select-label">선택하세요</InputLabel>
  <Select
    labelId="select-label"
    label="선택하세요"
    value={value}
    onChange={handleChange}
  >
    <MenuItem value="option1">옵션 1</MenuItem>
    <MenuItem value="option2">옵션 2</MenuItem>
  </Select>
</FormControl>
```

**버튼:**
```jsx
<Button
  variant="contained"
  color="primary"
  size="large"
  fullWidth
  onClick={handleClick}
>
  버튼 텍스트
</Button>
```

### 6. 결과 표시

**Alert 컴포넌트:**
```jsx
<Alert severity="success">
  <AlertTitle>성공</AlertTitle>
  결과 메시지
</Alert>

<Alert severity="warning">
  <AlertTitle>경고</AlertTitle>
  경고 메시지
</Alert>

<Alert severity="error">
  <AlertTitle>오류</AlertTitle>
  오류 메시지
</Alert>

<Alert severity="info">
  <AlertTitle>정보</AlertTitle>
  정보 메시지
</Alert>
```

**통계 카드:**
```jsx
const StatCard = ({ title, value }) => (
  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="caption" color="text.secondary">{title}</Typography>
    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
      {value}
    </Typography>
  </Paper>
);
```

**강조 박스:**
```jsx
<Box sx={{
  my: 3,
  p: 3,
  borderRadius: 2,
  textAlign: 'center',
  backgroundColor: 'action.hover'
}}>
  <Typography color="text.secondary" mb={1}>라벨</Typography>
  <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
    {result}
  </Typography>
</Box>
```

## 📱 모바일 최적화

### 1. 스택 레이아웃
모바일에서는 좌우 분할을 수직 스택으로 변경:

```jsx
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 4
}}>
```

### 2. 그리드 반응형
```jsx
<Grid item xs={12} sm={6} md={4}>  {/* 모바일: 100%, 태블릿: 50%, 데스크탑: 33% */}
```

### 3. 폰트 크기 조정
```jsx
<Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
```

### 4. 패딩/마진 조정
```jsx
sx={{ p: { xs: 2, sm: 3, md: 4 } }}
sx={{ mb: { xs: 2, sm: 3 } }}
```

## 🎯 네이밍 컨벤션

### 파일명
- 소문자와 하이픈 사용: `tool-name.js`
- 페이지 위치: `pages/tools/tool-name.js`

### 컴포넌트명
- PascalCase 사용: `ToolName`
- Default export 사용

### 변수명
- camelCase 사용: `toolResult`, `handleChange`

## ✅ 체크리스트

새로운 툴을 만들 때 확인사항:

- [ ] Paper elevation={3} 컨테이너 사용
- [ ] 반응형 패딩 적용 (xs: 2, sm: 4)
- [ ] 타이틀 섹션 (영문 + 한글)
- [ ] 모바일/데스크탑 레이아웃 고려
- [ ] 일관된 색상 스킴 사용
- [ ] 폼 입력 검증 구현
- [ ] 결과 표시 UI 구현
- [ ] Grid/Flexbox 적절히 사용
- [ ] TextField margin="normal" 적용
- [ ] 버튼 fullWidth 적용

## 📦 필수 Import

```jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  InputAdornment,
} from '@mui/material';
```

## 🔗 참고

기존 툴 예제:
- `pages/tools/vat-calculator.js` - 좌우 분할 레이아웃
- `pages/tools/script-timer.js` - 단일 컬럼 레이아웃
- `pages/tools/resolution-checker.js` - 폼 입력 + 결과 표시 패턴
