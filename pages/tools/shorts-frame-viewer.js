import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  Slider,
  Dialog,
  DialogContent,
  Chip,
  CircularProgress,
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
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [apiReady, setApiReady] = useState(false);
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
    // 이미 API가 로드되어 있는 경우
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // API 로드 중인 경우
    if (window.YT && !window.YT.Player) {
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API Ready');
        setApiReady(true);
      };
      return;
    }

    // API 스크립트 추가
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API Ready');
        setApiReady(true);
      };
    }
  }, []);

  // 플레이어 생성 함수
  const createPlayer = useCallback((id) => {
    console.log('Attempting to create player with ID:', id);

    if (!apiReady) {
      console.log('API not ready yet');
      return;
    }

    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
      console.log('Player element not found');
      setTimeout(() => createPlayer(id), 300);
      return;
    }

    console.log('Creating YouTube player...');

    try {
      // 기존 플레이어 제거
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying old player:', err);
        }
        playerRef.current = null;
      }

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
          autoplay: 0,
        },
        events: {
          onReady: (event) => {
            console.log('Player ready');
            setIsLoading(false);
            setIsVideoReady(true);
            const videoDuration = event.target.getDuration();
            setDuration(videoDuration);
            event.target.pauseVideo();
            setIsPlaying(false);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            setIsLoading(false);
            setError('비디오를 로드할 수 없습니다. URL을 확인해주세요.');
          },
        },
      });
    } catch (err) {
      console.error('Player creation error:', err);
      setError('플레이어 생성 중 오류가 발생했습니다: ' + err.message);
      setIsLoading(false);
    }
  }, [apiReady]);

  // Dialog가 열릴 때 플레이어 생성
  useEffect(() => {
    if (showViewer && videoId && apiReady) {
      console.log('Dialog opened, creating player...');
      // Dialog 전환 애니메이션 완료 후 플레이어 생성
      const timer = setTimeout(() => {
        createPlayer(videoId);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showViewer, videoId, apiReady, createPlayer]);

  // 비디오 로드
  const loadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (!id) {
      setError('유효한 YouTube Shorts URL을 입력해주세요.');
      return;
    }

    if (!apiReady) {
      setError('YouTube API를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setError('');
    setVideoId(id);
    setIsVideoReady(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setShowViewer(true);
  };

  // 현재 시간 업데이트
  useEffect(() => {
    if (!playerRef.current || !isVideoReady) return;

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (err) {
          console.error('Error getting current time:', err);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVideoReady]);

  // 재생/일시정지
  const togglePlayPause = () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (err) {
      console.error('Error toggling play/pause:', err);
    }
  };

  // 1프레임 단위로 고정
  const frameStep = 1 / frameRate;

  // 다음/이전으로 이동
  const navigate = useCallback((direction) => {
    if (!playerRef.current || !isVideoReady) return;

    try {
      const newTime = direction === 'next'
        ? Math.min(currentTime + frameStep, duration)
        : Math.max(currentTime - frameStep, 0);

      playerRef.current.seekTo(newTime, true);
      playerRef.current.pauseVideo();
      setCurrentTime(newTime);
    } catch (err) {
      console.error('Error navigating:', err);
    }
  }, [isVideoReady, currentTime, frameStep, duration]);

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
        navigate('prev');
      } else {
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
  }, [showViewer, isVideoReady, navigate]);

  const handleSliderChange = (event, newValue) => {
    if (!playerRef.current) return;
    try {
      playerRef.current.seekTo(newValue, true);
      setCurrentTime(newValue);
    } catch (err) {
      console.error('Error seeking:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const closeViewer = () => {
    setShowViewer(false);
    setIsLoading(false);
    setIsVideoReady(false);
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (err) {
        console.error('Error destroying player:', err);
      }
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
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  loadVideo();
                }
              }}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>프레임 단위 이동:</strong> 1프레임씩 정밀하게 탐색합니다.
                영상 FPS는 30fps로 설정되어 있습니다.
              </Typography>
            </Alert>

            {!apiReady && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                YouTube API 로딩 중...
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<YouTubeIcon />}
              onClick={loadVideo}
              disabled={!apiReady}
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
              • 이북처럼 좌우로 스와이프하여 1프레임씩 이동<br />
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
            {isVideoReady && (
              <Chip
                label={`1프레임 (${(1000 / frameRate).toFixed(1)}ms)`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            )}
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
              cursor: isVideoReady ? 'grab' : 'default',
              '&:active': {
                cursor: isVideoReady ? 'grabbing' : 'default',
              },
            }}
            onTouchStart={isVideoReady ? handleTouchStart : undefined}
            onTouchMove={isVideoReady ? handleTouchMove : undefined}
            onTouchEnd={isVideoReady ? handleTouchEnd : undefined}
            onMouseDown={isVideoReady ? handleMouseDown : undefined}
            onMouseMove={isVideoReady ? handleMouseMove : undefined}
            onMouseUp={isVideoReady ? handleMouseUp : undefined}
          >
            {isLoading || !isVideoReady ? (
              <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
                <CircularProgress sx={{ color: 'white', mb: 2 }} size={60} />
                <Typography variant="body1">
                  비디오 로딩 중...
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                  잠시만 기다려주세요
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
                  step={frameStep}
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
