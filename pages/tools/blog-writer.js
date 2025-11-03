import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CreateIcon from '@mui/icons-material/Create';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const blogTypes = [
  { value: 'howto', label: '📝 How-to 가이드 (단계별 설명)' },
  { value: 'tutorial', label: '🎓 튜토리얼 (실습형 교육)' },
  { value: 'explanation', label: '💡 설명형 (개념/원리 설명)' },
  { value: 'listicle', label: '📋 리스티클 (Top 10, Best 5 등)' },
  { value: 'comparison', label: '⚖️ 비교/분석형 (A vs B)' },
  { value: 'guide', label: '🗺️ 종합 가이드 (완벽 안내서)' },
];

const tones = [
  { value: 'friendly', label: '친근한 반말체' },
  { value: 'polite', label: '정중한 존댓말' },
  { value: 'professional', label: '전문가 톤' },
  { value: 'casual', label: '캐주얼' },
];

const lengths = [
  { value: 'short', label: '짧게 (500-800자)', chars: '500-800자' },
  { value: 'medium', label: '보통 (1000-1500자)', chars: '1000-1500자' },
  { value: 'long', label: '길게 (2000-3000자)', chars: '2000-3000자' },
];

const audiences = [
  { value: 'beginner', label: '초보자' },
  { value: 'general', label: '일반인' },
  { value: 'expert', label: '전문가' },
];

export default function BlogWriter() {
  const [topic, setTopic] = useState('');
  const [blogType, setBlogType] = useState('howto');
  const [tone, setTone] = useState('friendly');
  const [length, setLength] = useState('medium');
  const [audience, setAudience] = useState('general');
  const [useEmoji, setUseEmoji] = useState(true);
  const [seoKeywords, setSeoKeywords] = useState('');
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedBlog('');

    try {
      const typeLabel = blogTypes.find(t => t.value === blogType)?.label || '';
      const toneLabel = tones.find(t => t.value === tone)?.label || '';
      const lengthInfo = lengths.find(l => l.value === length)?.chars || '';
      const audienceLabel = audiences.find(a => a.value === audience)?.label || '';

      let prompt = `다음 조건에 맞는 ${typeLabel} 스타일의 정보 전달형 블로그 포스트를 작성해주세요:\n\n`;

      prompt += `📌 주제: ${topic}\n`;
      prompt += `🎯 대상 독자: ${audienceLabel}\n`;
      prompt += `💬 작성 톤: ${toneLabel}\n`;
      prompt += `📏 목표 분량: ${lengthInfo}\n\n`;

      // 블로그 타입별 특화 구조
      if (blogType === 'howto') {
        prompt += `구조:\n`;
        prompt += `1. 매력적인 제목\n`;
        prompt += `2. 간단한 소개 (왜 이 방법이 필요한지)\n`;
        prompt += `3. 단계별 설명 (Step 1, Step 2...)\n`;
        prompt += `4. 팁과 주의사항\n`;
        prompt += `5. 결론 및 요약\n\n`;
      } else if (blogType === 'tutorial') {
        prompt += `구조:\n`;
        prompt += `1. 매력적인 제목\n`;
        prompt += `2. 배울 내용 소개\n`;
        prompt += `3. 준비물/사전 지식\n`;
        prompt += `4. 실습 단계 (코드나 예시 포함)\n`;
        prompt += `5. 응용 방법\n`;
        prompt += `6. 마무리\n\n`;
      } else if (blogType === 'explanation') {
        prompt += `구조:\n`;
        prompt += `1. 매력적인 제목\n`;
        prompt += `2. 개념 소개\n`;
        prompt += `3. 상세 설명 (예시 포함)\n`;
        prompt += `4. 실생활 적용\n`;
        prompt += `5. 요약 및 정리\n\n`;
      } else if (blogType === 'listicle') {
        prompt += `구조:\n`;
        prompt += `1. 매력적인 제목 (예: "최고의 10가지 방법")\n`;
        prompt += `2. 간단한 도입부\n`;
        prompt += `3. 번호별 목록 (각 항목마다 설명)\n`;
        prompt += `4. 결론\n\n`;
      } else if (blogType === 'comparison') {
        prompt += `구조:\n`;
        prompt += `1. 매력적인 제목\n`;
        prompt += `2. 비교 대상 소개\n`;
        prompt += `3. 항목별 비교 (기능, 가격, 성능 등)\n`;
        prompt += `4. 장단점 정리\n`;
        prompt += `5. 추천 및 결론\n\n`;
      } else if (blogType === 'guide') {
        prompt += `구조:\n`;
        prompt += `1. 매력적인 제목\n`;
        prompt += `2. 가이드 개요\n`;
        prompt += `3. 주요 섹션별 상세 설명\n`;
        prompt += `4. 자주 묻는 질문 (FAQ)\n`;
        prompt += `5. 마무리 및 다음 단계\n\n`;
      }

      if (seoKeywords.trim()) {
        prompt += `🔍 SEO 키워드: ${seoKeywords}\n`;
        prompt += `(자연스럽게 키워드를 본문에 포함해주세요)\n\n`;
      }

      if (useEmoji) {
        prompt += `✨ 이모지를 적절히 사용하여 읽기 쉽게 작성해주세요.\n\n`;
      }

      prompt += `작성 가이드라인:\n`;
      prompt += `- ${audienceLabel}가 이해하기 쉬운 수준으로 작성\n`;
      prompt += `- 구체적인 예시와 실용적인 정보 포함\n`;
      prompt += `- 명확한 소제목으로 구조화\n`;
      prompt += `- 읽기 쉬운 문단 구성\n`;
      prompt += `- 한국어로 작성\n`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API에서 반환한 상세 에러 메시지 사용
        console.error('API Error Response:', data);
        const errorMsg = data.details
          ? `${data.error}\n\n${data.details}`
          : data.error || `블로그 생성에 실패했습니다. (Status: ${response.status})`;
        throw new Error(errorMsg);
      }

      if (!data.text) {
        throw new Error('생성된 블로그가 비어있습니다. API 응답을 확인해주세요.');
      }

      setGeneratedBlog(data.text);
    } catch (err) {
      console.error('Blog Generation Error:', err);
      setError(err.message || '블로그 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedBlog).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <CreateIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            AI 블로그 작성기
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph align="center">
          정보 전달에 특화된 블로그 포스트를 Google Gemini AI로 자동 생성합니다
        </Typography>

        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Topic Input */}
            <TextField
              fullWidth
              label="블로그 주제"
              placeholder="예: 리액트 훅스 완벽 가이드, 제주도 여행 필수 코스 10곳"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              rows={2}
              helperText="작성하고 싶은 블로그의 주제를 입력하세요"
            />

            {/* Blog Type Selector */}
            <FormControl fullWidth>
              <InputLabel id="blog-type-label">블로그 타입</InputLabel>
              <Select
                labelId="blog-type-label"
                id="blog-type"
                value={blogType}
                label="블로그 타입"
                onChange={(e) => setBlogType(e.target.value)}
              >
                {blogTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Row 1: Tone and Length */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <FormControl fullWidth>
                <InputLabel id="tone-label">작성 톤</InputLabel>
                <Select
                  labelId="tone-label"
                  value={tone}
                  label="작성 톤"
                  onChange={(e) => setTone(e.target.value)}
                >
                  {tones.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="length-label">글 길이</InputLabel>
                <Select
                  labelId="length-label"
                  value={length}
                  label="글 길이"
                  onChange={(e) => setLength(e.target.value)}
                >
                  {lengths.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                      {l.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Row 2: Audience and Emoji Toggle */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
              <FormControl fullWidth>
                <InputLabel id="audience-label">대상 독자</InputLabel>
                <Select
                  labelId="audience-label"
                  value={audience}
                  label="대상 독자"
                  onChange={(e) => setAudience(e.target.value)}
                >
                  {audiences.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={useEmoji}
                    onChange={(e) => setUseEmoji(e.target.checked)}
                    color="primary"
                  />
                }
                label="이모지 사용"
                sx={{ minWidth: '150px' }}
              />
            </Box>

            {/* Advanced Options */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>고급 옵션 (선택사항)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="SEO 키워드"
                  placeholder="예: 리액트, 웹개발, 프론트엔드"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  helperText="검색 최적화를 위한 키워드 (쉼표로 구분)"
                />
              </AccordionDetails>
            </Accordion>

            {/* Generate Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <CreateIcon />}
              sx={{ py: 1.5 }}
            >
              {loading ? '생성 중...' : '블로그 생성하기'}
            </Button>

            {/* Error Message */}
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Copy Success Message */}
            {copySuccess && (
              <Alert severity="success">
                클립보드에 복사되었습니다!
              </Alert>
            )}
          </Box>
        </Paper>

        {/* Generated Blog Display */}
        {generatedBlog && (
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                생성된 블로그
              </Typography>
              <Tooltip title="복사하기">
                <IconButton onClick={handleCopyToClipboard} color="primary">
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              <Typography variant="body1" component="div">
                {generatedBlog}
              </Typography>
            </Box>

            {/* Blog Info Chips */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`타입: ${blogTypes.find(t => t.value === blogType)?.label}`} size="small" />
              <Chip label={`톤: ${tones.find(t => t.value === tone)?.label}`} size="small" />
              <Chip label={`길이: ${lengths.find(l => l.value === length)?.label}`} size="small" />
              <Chip label={`독자: ${audiences.find(a => a.value === audience)?.label}`} size="small" />
            </Box>
          </Paper>
        )}

        {/* Usage Instructions */}
        <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            💡 사용 팁:
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>How-to 가이드</strong>: 단계별 실행 방법을 설명하는 블로그<br />
            • <strong>튜토리얼</strong>: 실습을 통해 배우는 교육용 콘텐츠<br />
            • <strong>설명형</strong>: 개념이나 원리를 자세히 설명<br />
            • <strong>리스티클</strong>: &apos;10가지 방법&apos;, &apos;Best 5&apos; 같은 목록형<br />
            • <strong>비교/분석</strong>: 두 가지 이상을 비교 분석<br />
            • <strong>종합 가이드</strong>: 주제에 대한 완벽한 안내서
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
