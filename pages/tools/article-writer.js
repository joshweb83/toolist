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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArticleIcon from '@mui/icons-material/Article';

const articleStyles = [
  { value: 'news', label: '뉴스 기사 (News Article)' },
  { value: 'blog', label: '블로그 포스트 (Blog Post)' },
  { value: 'press', label: '보도자료 (Press Release)' },
  { value: 'technical', label: '기술 문서 (Technical Article)' },
  { value: 'feature', label: '피처 스토리 (Feature Story)' },
  { value: 'opinion', label: '오피니언 (Opinion/Editorial)' },
  { value: 'interview', label: '인터뷰 (Interview)' },
  { value: 'review', label: '리뷰 (Review)' },
];

export default function ArticleWriter() {
  const [articleStyle, setArticleStyle] = useState('news');
  const [keywords, setKeywords] = useState('');
  const [sampleLink, setSampleLink] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      setError('키워드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedArticle('');

    try {
      const styleLabel = articleStyles.find(s => s.value === articleStyle)?.label || '';

      let prompt = `다음 조건에 맞는 ${styleLabel} 형식의 기사를 작성해주세요:\n\n`;
      prompt += `키워드: ${keywords}\n\n`;

      if (sampleLink.trim()) {
        prompt += `참고 자료 링크: ${sampleLink}\n`;
        prompt += `위 링크의 스타일과 톤을 참고하되, 제공된 키워드를 중심으로 새로운 내용을 작성해주세요.\n\n`;
      }

      prompt += `요구사항:\n`;
      prompt += `1. 명확하고 읽기 쉬운 문장으로 작성\n`;
      prompt += `2. 적절한 단락 구분과 구조화\n`;
      prompt += `3. 제목과 본문을 포함한 완전한 기사\n`;
      prompt += `4. ${styleLabel}의 특징을 잘 반영\n`;
      prompt += `5. 한국어로 작성\n`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('기사 생성에 실패했습니다.');
      }

      const data = await response.json();
      setGeneratedArticle(data.text);
    } catch (err) {
      setError(err.message || '기사 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle).then(() => {
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
          <ArticleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            AI 기사 작성기
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Google Gemini AI를 활용하여 다양한 스타일의 기사를 자동으로 생성합니다
        </Typography>

        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Article Style Selector */}
            <FormControl fullWidth>
              <InputLabel id="article-style-label">기사 스타일</InputLabel>
              <Select
                labelId="article-style-label"
                id="article-style"
                value={articleStyle}
                label="기사 스타일"
                onChange={(e) => setArticleStyle(e.target.value)}
              >
                {articleStyles.map((style) => (
                  <MenuItem key={style.value} value={style.value}>
                    {style.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Keywords Input */}
            <TextField
              fullWidth
              label="키워드"
              placeholder="예: 인공지능, 기술 혁신, 미래 산업"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              rows={2}
              helperText="기사의 핵심 키워드를 입력하세요 (쉼표로 구분)"
            />

            {/* Sample Article Link Input */}
            <TextField
              fullWidth
              label="참고 기사 링크 (선택사항)"
              placeholder="https://example.com/article"
              value={sampleLink}
              onChange={(e) => setSampleLink(e.target.value)}
              helperText="참고할 기사의 URL을 입력하면 해당 스타일을 참고합니다"
            />

            {/* Generate Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={loading || !keywords.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <ArticleIcon />}
              sx={{ py: 1.5 }}
            >
              {loading ? '생성 중...' : '기사 생성'}
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

        {/* Generated Article Display */}
        {generatedArticle && (
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                생성된 기사
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
                {generatedArticle}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Usage Instructions */}
        <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            사용 방법:
          </Typography>
          <Typography variant="body2" component="div">
            1. 원하는 기사 스타일을 선택하세요<br />
            2. 기사의 핵심 키워드를 입력하세요<br />
            3. (선택) 참고할 기사 링크를 입력하면 해당 스타일을 참고합니다<br />
            4. &apos;기사 생성&apos; 버튼을 클릭하세요<br />
            5. 생성된 기사를 확인하고 복사 버튼으로 클립보드에 복사할 수 있습니다
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
