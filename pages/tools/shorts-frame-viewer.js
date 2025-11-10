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
  IconButton,
  Slider,
  Dialog,
  DialogContent,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SwipeIcon from '@mui/icons-material/Swipe';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function ShortsFrameViewer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [frameRate, setFrameRate] = useState(30);
  const [navigationUnit, setNavigationUnit] = useState('frame'); // 'frame', '0.1s', '0.5s', '1s'
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const playerRef = useRef(null);
  const viewerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchEndRef = useRef({ x: 0, y: 0 });

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
      return;
    }

    setError('');
    setVideoId(id);
    setIsVideoReady(false);
    setCurrentTime(0);
    setDuration(0);
    setShowViewer(true);

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
            fs: 0,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      } else {
        setTimeout(() => loadVideo(), 100);
      }
    }, 300);
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
    }, 50);

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

  // 넘기는 단위 계산
  const getNavigationStep = () => {
    switch (navigationUnit) {
      case 'frame':
        return 1 / frameRate;
      case '0.1s':
        return 0.1;
      case '0.5s':
        return 0.5;
      case '1s':
        return 1;
      default:
        return 1 / frameRate;
    }
  };

  // 다음/이전으로 이동
  const navigate = (direction) => {
    if (!playerRef.current || !isVideoReady) return;

    const step = getNavigationStep();
    const newTime = direction === 'next'
      ? Math.min(currentTime + step, duration)
      : Math.max(currentTime - step, 0);

    playerRef.current.seekTo(newTime, true);
    playerRef.current.pauseVideo();
    setCurrentTime(newTime);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = Math.abs(touchEndRef.current.y - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // 가로 스와이프가 세로보다 크고, 최소 거리를 이동했을 때
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX > 0) {
        // 오른쪽 스와이프 -> 이전
        navigate('prev');
      } else {
        // 왼쪽 스와이프 -> 다음
        navigate('next');
      }
    }
  };

  // 마우스 이벤트 핸들러 (데스크톱)
  const handleMouseDown = (e) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      touchEndRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }
  };

  const handleMouseUp = () => {
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = Math.abs(touchEndRef.current.y - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX > 0) {
        navigate('prev');
      } else {
        navigate('next');
      }
    }
  };

  // 키보드 이벤트 핸들러
  useEffect(() => {
    if (!showViewer || !isVideoReady) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate('next');
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showViewer, isVideoReady, currentTime, navigationUnit]);

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

  const closeViewer = () => {
    setShowViewer(false);
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  };

  const getUnitLabel = () => {
    switch (navigationUnit) {
      case 'frame':
        return `1프레임 (${(1000 / frameRate).toFixed(1)}ms)`;
      case '0.1s':
        return '0.1초';
      case '0.5s':
        return '0.5초';
      case '1s':
        return '1초';
      default:
        return '';
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        {/* 타이틀 섹션 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Shorts Frame Viewer
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            YouTube Shorts 이북 스타일 프레임 뷰어
          </Typography>
        </Box>

        {/* 입력 폼 */}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              비디오 설정
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

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                넘기는 단위
              </Typography>
              <ToggleButtonGroup
                value={navigationUnit}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) setNavigationUnit(newValue);
                }}
                fullWidth
                size="small"
              >
                <ToggleButton value="frame">1프레임</ToggleButton>
                <ToggleButton value="0.1s">0.1초</ToggleButton>
                <ToggleButton value="0.5s">0.5초</ToggleButton>
                <ToggleButton value="1s">1초</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<YouTubeIcon />}
              onClick={loadVideo}
              sx={{ mt: 3 }}
            >
              뷰어 열기
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>

          {/* 사용 방법 */}
          <Alert severity="info" sx={{ mt: 3 }} icon={<SwipeIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              사용 방법
            </Typography>
            <Typography variant="body2" component="div">
              • 이북처럼 좌우로 스와이프하여 프레임 이동<br />
              • 키보드 ← → 방향키로도 이동 가능<br />
              • 스페이스바로 재생/일시정지<br />
              • 하단 슬라이더로 빠른 이동
            </Typography>
          </Alert>
        </Box>
      </Paper>

      {/* 전체화면 뷰어 팝업 */}
      <Dialog
        open={showViewer}
        onClose={closeViewer}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: '#000',
            m: 0,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 상단 컨트롤 바 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={closeViewer}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                Shorts Frame Viewer
              </Typography>
            </Box>
            <Chip
              label={getUnitLabel()}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>

          {/* 비디오 영역 */}
          <Box
            ref={viewerRef}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              height: '100%',
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing',
              },
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {!isVideoReady ? (
              <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
                <YouTubeIcon sx={{ fontSize: 80, opacity: 0.5, mb: 2 }} />
                <Typography variant="body1">
                  비디오 로딩 중...
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  id="youtube-player"
                  sx={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    aspectRatio: '9/16',
                    pointerEvents: 'none',
                  }}
                />

                {/* 좌우 네비게이션 힌트 */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.3,
                    pointerEvents: 'none',
                  }}
                >
                  <KeyboardArrowLeftIcon sx={{ fontSize: 60, color: 'white' }} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.3,
                    pointerEvents: 'none',
                  }}
                >
                  <KeyboardArrowRightIcon sx={{ fontSize: 60, color: 'white' }} />
                </Box>
              </>
            )}
          </Box>

          {/* 하단 컨트롤 바 */}
          {isVideoReady && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                p: 2,
                pb: 3,
              }}
            >
              {/* 프레임 정보 */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  프레임: {Math.floor(currentTime * frameRate)} / {Math.floor(duration * frameRate)}
                  ({frameRate} FPS)
                </Typography>
              </Box>

              {/* 타임라인 슬라이더 */}
              <Box sx={{ px: 2, mb: 2 }}>
                <Slider
                  value={currentTime}
                  min={0}
                  max={duration}
                  step={getNavigationStep()}
                  onChange={handleSliderChange}
                  sx={{
                    color: 'white',
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                    },
                  }}
                />
              </Box>

              {/* 재생 버튼 */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  onClick={togglePlayPause}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                  size="large"
                >
                  {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                </IconButton>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
