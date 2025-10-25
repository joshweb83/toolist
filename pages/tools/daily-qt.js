import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Collapse,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// 성경 구절 데이터베이스 (확장 가능)
const bibleVerses = [
  {
    id: 1,
    reference: '시편 23편 1-3절',
    text: '여호와는 나의 목자시니 내게 부족함이 없으리로다\n그가 나를 푸른 풀밭에 누이시며 쉴 만한 물가로 인도하시는도다\n내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다',
    questions: [
      '하나님을 어떻게 묘사하고 있나요?',
      '하나님께서 나에게 주신 것은 무엇인가요?',
      '오늘 하나님의 인도하심을 어떻게 경험할 수 있을까요?',
    ],
  },
  {
    id: 2,
    reference: '빌립보서 4장 6-7절',
    text: '아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라\n그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라',
    questions: [
      '염려 대신 무엇을 하라고 말씀하시나요?',
      '하나님께 구할 때 어떤 태도를 가져야 하나요?',
      '오늘 내가 하나님께 감사로 아뢸 것은 무엇인가요?',
    ],
  },
  {
    id: 3,
    reference: '잠언 3장 5-6절',
    text: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라\n너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라',
    questions: [
      '무엇을 의지하지 말라고 하나요?',
      '하나님을 신뢰한다는 것은 구체적으로 어떤 의미일까요?',
      '오늘 내가 하나님을 인정해야 할 일은 무엇인가요?',
    ],
  },
  {
    id: 4,
    reference: '요한복음 15장 5절',
    text: '나는 포도나무요 너희는 가지라 그가 내 안에, 내가 그 안에 거하면 사람이 열매를 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라',
    questions: [
      '예수님과 나의 관계를 어떻게 묘사하고 있나요?',
      '열매를 맺는 비결은 무엇인가요?',
      '오늘 어떻게 예수님 안에 거할 수 있을까요?',
    ],
  },
  {
    id: 5,
    reference: '로마서 8장 28절',
    text: '우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라',
    questions: [
      '&apos;모든 것&apos;이 합력하여 선을 이룬다는 의미는 무엇일까요?',
      '지금 어려운 상황 가운데서도 이 약속을 어떻게 믿을 수 있을까요?',
      '오늘 하나님의 선하심을 어떻게 신뢰할 수 있을까요?',
    ],
  },
];

export default function DailyQT() {
  const [todayVerse, setTodayVerse] = useState(null);
  const [myNote, setMyNote] = useState('');
  const [savedNotes, setSavedNotes] = useState({});
  const [streak, setStreak] = useState(0);
  const [lastQTDate, setLastQTDate] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 초기 로드: LocalStorage에서 데이터 가져오기
  useEffect(() => {
    // 오늘 날짜로 성경 구절 선택
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const verseIndex = dayOfYear % bibleVerses.length;
    setTodayVerse(bibleVerses[verseIndex]);

    // LocalStorage에서 저장된 묵상 노트 불러오기
    const saved = localStorage.getItem('qt-notes');
    if (saved) {
      setSavedNotes(JSON.parse(saved));
    }

    // Streak 계산
    const lastDate = localStorage.getItem('qt-last-date');
    const streakCount = parseInt(localStorage.getItem('qt-streak') || '0');

    if (lastDate) {
      const last = new Date(lastDate);
      const diffDays = Math.floor((today - last) / 86400000);

      if (diffDays === 0) {
        // 오늘 이미 했음
        setStreak(streakCount);
      } else if (diffDays === 1) {
        // 어제 했음 - 연속
        setStreak(streakCount);
      } else {
        // 연속 끊김
        setStreak(0);
      }
    }

    setLastQTDate(lastDate);

    // 오늘 날짜의 노트 불러오기
    const todayKey = getTodayKey();
    if (saved) {
      const notes = JSON.parse(saved);
      setMyNote(notes[todayKey] || '');
    }
  }, []);

  const getTodayKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const handleSaveNote = () => {
    const todayKey = getTodayKey();
    const updatedNotes = {
      ...savedNotes,
      [todayKey]: myNote,
    };

    setSavedNotes(updatedNotes);
    localStorage.setItem('qt-notes', JSON.stringify(updatedNotes));

    // Streak 업데이트
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('qt-last-date');

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (lastDate === yesterdayStr) {
        // 연속
        newStreak = streak + 1;
      }

      setStreak(newStreak);
      localStorage.setItem('qt-streak', String(newStreak));
      localStorage.setItem('qt-last-date', today);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    try {
      const prompt = `당신은 성경을 깊이 이해하고 있는 목회자이자 큐티 멘토입니다.
오늘의 말씀: ${todayVerse.reference}
"${todayVerse.text}"

질문: ${aiQuestion}

위 말씀과 관련하여 질문에 대해 은혜롭고 따뜻하게, 하지만 성경적으로 깊이 있게 답변해주세요. 가능하면 관련된 다른 성경 구절도 함께 소개해주세요.`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.text) {
        setAiResponse(data.text);
      } else if (data.error) {
        setAiResponse('AI 도우미에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
      }
    } catch (error) {
      setAiResponse('AI 도우미 연결에 실패했습니다. 네트워크를 확인해주세요.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleShare = () => {
    const shareText = `📖 오늘의 말씀 큐티\n\n${todayVerse.reference}\n\n${todayVerse.text}\n\n나의 묵상:\n${myNote}\n\n🔗 https://toolist-mu.vercel.app/tools/daily-qt`;

    if (navigator.share) {
      navigator.share({
        title: '오늘의 말씀 큐티',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('클립보드에 복사되었습니다!');
    }
  };

  if (!todayVerse) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* 헤더 */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            📖 오늘의 말씀 큐티
          </Typography>

          {/* Streak 표시 */}
          {streak > 0 && (
            <Chip
              icon={<LocalFireDepartmentIcon />}
              label={`${streak}일 연속!`}
              color="error"
              sx={{ mt: 1 }}
            />
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 오늘의 말씀 */}
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              {todayVerse.reference}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {todayVerse.text}
            </Typography>
          </CardContent>
        </Card>

        {/* 묵상 질문 */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            💭 묵상 질문
          </Typography>
          <Stack spacing={1.5}>
            {todayVerse.questions.map((question, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', minWidth: 24 }}>
                  {index + 1}.
                </Typography>
                <Typography variant="body1">{question}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* AI 도우미 */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            endIcon={<ExpandMoreIcon sx={{ transform: showAiHelper ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />}
            onClick={() => setShowAiHelper(!showAiHelper)}
            sx={{ mb: showAiHelper ? 2 : 0 }}
          >
            AI 큐티 도우미
          </Button>

          <Collapse in={showAiHelper}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="말씀에 대해 궁금한 점을 물어보세요..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleAskAI}
              disabled={aiLoading || !aiQuestion.trim()}
              fullWidth
            >
              {aiLoading ? <CircularProgress size={24} /> : '질문하기'}
            </Button>

            {aiResponse && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {aiResponse}
                </Typography>
              </Alert>
            )}
          </Collapse>
        </Paper>

        {/* 나의 묵상 노트 */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditNoteIcon /> 나의 묵상 노트
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="오늘 받은 은혜와 깨달음을 기록해보세요...&#10;&#10;- 관찰: 본문에서 발견한 것은?&#10;- 해석: 하나님께서 말씀하시는 것은?&#10;- 적용: 오늘 어떻게 살아갈까?"
            value={myNote}
            onChange={(e) => setMyNote(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleSaveNote}
              disabled={!myNote.trim()}
              fullWidth
            >
              저장하기
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              disabled={!myNote.trim()}
            >
              공유
            </Button>
          </Stack>

          {saveSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              묵상이 저장되었습니다! 🙏
            </Alert>
          )}
        </Paper>

        {/* 안내 메시지 */}
        <Alert severity="info">
          💡 매일 새로운 말씀으로 큐티하고, 연속 기록을 쌓아보세요!
        </Alert>
      </Paper>
    </Box>
  );
}
