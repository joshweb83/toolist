import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  IconButton,
  Slider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function ShortsFrameViewer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [frameRate, setFrameRate] = useState(30);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  // YouTube Video ID 추출
  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/shorts\/|youtu\.be\/shorts\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return null;
  };

  // YouTube IFrame API 로드
  useEffect(() => {
    // YouTube IFrame API 스크립트 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API Ready');
      };
    }
  }, []);

  // 비디오 로드
  const loadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (!id) {
      setError('유효한 YouTube Shorts URL을 입력해주세요.');
      setVideoId('');
      setIsVideoReady(false);
      return;
    }

    setError('');
    setVideoId(id);
    setIsVideoReady(false);
    setCurrentTime(0);
    setDuration(0);

    // 기존 플레이어가 있으면 제거
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // 새 플레이어 생성
    setTimeout(() => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: id,
          playerVars: {
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      } else {
        setTimeout(() => loadVideo(), 100);
      }
    }, 100);
  };

  const onPlayerReady = (event) => {
    setIsVideoReady(true);
    setDuration(event.target.getDuration());
    event.target.pauseVideo();
    setIsPlaying(false);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    }
  };

  // 현재 시간 업데이트
  useEffect(() => {
    if (!playerRef.current || !isVideoReady) return;

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isVideoReady]);

  // 재생/일시정지
  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // 프레임 이동 (초 단위)
  const frameStep = 1 / frameRate;

  const nextFrame = () => {
    if (!playerRef.current) return;
    const newTime = Math.min(currentTime + frameStep, duration);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const previousFrame = () => {
    if (!playerRef.current) return;
    const newTime = Math.max(currentTime - frameStep, 0);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    if (!playerRef.current) return;
    const newTime = Math.min(currentTime + 1, duration);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    if (!playerRef.current) return;
    const newTime = Math.max(currentTime - 1, 0);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleSliderChange = (event, newValue) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(newValue, true);
    setCurrentTime(newValue);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      {/* 타이틀 섹션 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Shorts Frame Viewer
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          YouTube Shorts 프레임 뷰어
        </Typography>
      </Box>

      {/* 메인 컨텐츠 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          alignItems: 'stretch',
        }}
      >
        {/* 왼쪽: 입력 폼 */}
        <Box sx={{ flex: '1 1 40%' }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              설정
            </Typography>

            <TextField
              label="YouTube Shorts URL"
              variant="outlined"
              fullWidth
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              margin="normal"
              placeholder="예: https://youtube.com/shorts/abc123"
              helperText="YouTube Shorts URL 또는 비디오 ID를 입력하세요"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="frame-rate-label">프레임 레이트</InputLabel>
              <Select
                labelId="frame-rate-label"
                label="프레임 레이트"
                value={frameRate}
                onChange={(e) => setFrameRate(e.target.value)}
              >
                <MenuItem value={24}>24 FPS (시네마틱)</MenuItem>
                <MenuItem value={30}>30 FPS (표준)</MenuItem>
                <MenuItem value={60}>60 FPS (고프레임)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<YouTubeIcon />}
              onClick={loadVideo}
              sx={{ mt: 2 }}
            >
              비디오 로드
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 'auto', pt: 3 }}>
              <Alert severity="info">
                <AlertTitle>사용 방법</AlertTitle>
                <Typography variant="body2" component="div">
                  1. YouTube Shorts URL 입력<br />
                  2. 비디오 로드 버튼 클릭<br />
                  3. 프레임 단위 이동 버튼 사용<br />
                  • ◀◀ / ▶▶ : 1초 이동<br />
                  • ◀ / ▶ : 1프레임 이동
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Box>

        {/* 오른쪽: 비디오 플레이어 */}
        <Box sx={{ flex: '1 1 60%' }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              플레이어
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                minHeight: { xs: 400, md: 500 },
                mt: 2,
              }}
            >
              {!videoId ? (
                <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
                  <YouTubeIcon sx={{ fontSize: 80, opacity: 0.5, mb: 2 }} />
                  <Typography variant="body1">
                    YouTube Shorts URL을 입력하고 비디오를 로드하세요
                  </Typography>
                </Box>
              ) : (
                <Box
                  id="youtube-player"
                  ref={iframeRef}
                  sx={{
                    width: '100%',
                    height: '100%',
                    aspectRatio: '9/16',
                    maxHeight: '100%',
                  }}
                />
              )}
            </Box>

            {/* 컨트롤 패널 */}
            {isVideoReady && (
              <Box sx={{ mt: 3 }}>
                {/* 타임라인 슬라이더 */}
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={currentTime}
                    min={0}
                    max={duration}
                    step={frameStep}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatTime(value)}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(currentTime)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(duration)}
                    </Typography>
                  </Box>
                </Box>

                {/* 재생 컨트롤 버튼 */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <IconButton
                    onClick={skipBackward}
                    color="primary"
                    size="large"
                    title="1초 뒤로"
                  >
                    <FastRewindIcon fontSize="large" />
                  </IconButton>

                  <IconButton
                    onClick={previousFrame}
                    color="primary"
                    size="large"
                    title="이전 프레임"
                  >
                    <SkipPreviousIcon fontSize="large" />
                  </IconButton>

                  <IconButton
                    onClick={togglePlayPause}
                    color="primary"
                    size="large"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    {isPlaying ? (
                      <PauseIcon fontSize="large" />
                    ) : (
                      <PlayArrowIcon fontSize="large" />
                    )}
                  </IconButton>

                  <IconButton
                    onClick={nextFrame}
                    color="primary"
                    size="large"
                    title="다음 프레임"
                  >
                    <SkipNextIcon fontSize="large" />
                  </IconButton>

                  <IconButton
                    onClick={skipForward}
                    color="primary"
                    size="large"
                    title="1초 앞으로"
                  >
                    <FastForwardIcon fontSize="large" />
                  </IconButton>
                </Box>

                {/* 프레임 정보 */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    프레임: {Math.floor(currentTime * frameRate)} / {Math.floor(duration * frameRate)}
                    ({frameRate} FPS)
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* 추가 정보 */}
      <Box sx={{ mt: 4 }}>
        <Alert severity="success">
          <AlertTitle>프레임 뷰어란?</AlertTitle>
          YouTube Shorts 영상을 프레임 단위로 세밀하게 탐색할 수 있는 도구입니다.
          영상 분석, 장면 캡처, 세밀한 편집 작업에 유용합니다.
        </Alert>
      </Box>
    </Paper>
  );
}
