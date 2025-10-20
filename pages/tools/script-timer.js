import { Paper, Typography, Box, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Grid } from '@mui/material';
import { useState, useEffect } from 'react';

// A smaller card for individual stats
const StatCard = ({ title, value }) => (
  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="caption" color="text.secondary">{title}</Typography>
    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
      {value}
    </Typography>
  </Paper>
);

export default function ScriptTimerPage() {
  const [script, setScript] = useState('');
  const [speed, setSpeed] = useState('150'); // Default speed: 150 WPM (Normal)
  const [timeResult, setTimeResult] = useState('0분 0초'); // To store the time result string
  const [stats, setStats] = useState({
    chars: 0,
    charsNoSpace: 0,
    words: 0,
    lines: 0,
    manuscriptPages: 0,
  });

  const handleSpeedChange = (event) => {
    setSpeed(event.target.value);
  };

  useEffect(() => {
    if (!script.trim()) {
      setTimeResult('0분 0초');
      setStats({ chars: 0, charsNoSpace: 0, words: 0, lines: 0, manuscriptPages: 0 });
      return;
    }

    // Calculate stats
    const words = script.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = script.length;
    const charCountNoSpace = script.replace(/\s/g, '').length;
    const lineCount = script.split('\n').length;
    const manuscriptPageCount = (charCountNoSpace / 200).toFixed(1);

    setStats({
      chars: charCount,
      charsNoSpace: charCountNoSpace,
      words: wordCount,
      lines: lineCount,
      manuscriptPages: manuscriptPageCount,
    });

    // Calculate time
    const wpm = parseInt(speed, 10);
    if (wpm === 0) {
      setTimeResult('0분 0초');
      return;
    }
    const totalSeconds = (wordCount / wpm) * 60;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);

    setTimeResult(`${minutes}분 ${seconds}초`);
  }, [script, speed]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Script-Timer
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          스크립트 타이머
        </Typography>
      </Box>
      <TextField
        multiline
        fullWidth
        rows={8}
        variant="outlined"
        label="여기에 프레젠테이션 스크립트를 붙여넣으세요."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />
      <Box sx={{ my: 3, textAlign: 'center' }}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ textAlign: 'center', width: '100%' }}>발표 속도 (분당 단어 수)</FormLabel>
          <RadioGroup row aria-label="speed" name="speed" value={speed} onChange={handleSpeedChange} sx={{ justifyContent: 'center' }}>
            <FormControlLabel value="120" control={<Radio />} label="느리게 (120)" />
            <FormControlLabel value="150" control={<Radio />} label="보통 (150)" />
            <FormControlLabel value="180" control={<Radio />} label="빠르게 (180)" />
            <FormControlLabel value="270" control={<Radio />} label="쇼츠 빠르기 (270)" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ my: 4, p: 2, borderRadius: 2, backgroundColor: 'action.hover' }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>텍스트 분석</Typography>
        <Grid container spacing={2} justifyContent="center"> 
          <Grid item xs={2.4}><StatCard title="단어" value={stats.words} /></Grid>
          <Grid item xs={2.4}><StatCard title="글자" value={stats.chars} /></Grid>
          <Grid item xs={2.4}><StatCard title="공백제외" value={stats.charsNoSpace} /></Grid>
          <Grid item xs={2.4}><StatCard title="줄" value={stats.lines} /></Grid>
          <Grid item xs={2.4}><StatCard title="원고지" value={`${stats.manuscriptPages}`} /></Grid>
        </Grid>
      </Box>

      <Box sx={{ my: 3, p: 3, borderRadius: 2, textAlign: 'center', backgroundColor: 'action.hover' }}>
        <Typography color="text.secondary" mb={1}>예상 발표 시간</Typography>
        <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {timeResult}
        </Typography>
      </Box>
    </Paper>
  );
}