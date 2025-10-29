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
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';
import QRCode from 'qrcode';

export default function QRCodeGenerator() {
  const [inputText, setInputText] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const generateQRCode = async () => {
    if (!inputText.trim()) {
      setError('텍스트 또는 URL을 입력해주세요.');
      setQrCodeUrl('');
      return;
    }

    try {
      setError('');
      const canvas = canvasRef.current;

      await QRCode.toCanvas(canvas, inputText, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Canvas를 이미지 URL로 변환
      const url = canvas.toDataURL('image/png');
      setQrCodeUrl(url);
    } catch (err) {
      setError('QR 코드 생성에 실패했습니다.');
      console.error(err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCodeUrl;
    link.click();
  };

  // 입력값이 변경되면 자동으로 QR 코드 생성
  useEffect(() => {
    if (inputText.trim()) {
      generateQRCode();
    } else {
      setQrCodeUrl('');
      setError('');
    }
  }, [inputText, qrSize]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      {/* 타이틀 섹션 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          QR Code Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          QR 코드 생성기
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
        <Box sx={{ flex: '1 1 50%' }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              입력
            </Typography>

            <TextField
              label="텍스트 또는 URL"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              margin="normal"
              placeholder="예: https://example.com 또는 안녕하세요!"
              helperText="QR 코드로 변환할 텍스트나 URL을 입력하세요"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="qr-size-label">QR 코드 크기</InputLabel>
              <Select
                labelId="qr-size-label"
                label="QR 코드 크기"
                value={qrSize}
                onChange={(e) => setQrSize(e.target.value)}
              >
                <MenuItem value={128}>작게 (128x128)</MenuItem>
                <MenuItem value={256}>보통 (256x256)</MenuItem>
                <MenuItem value={512}>크게 (512x512)</MenuItem>
                <MenuItem value={1024}>매우 크게 (1024x1024)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 'auto', pt: 3 }}>
              <Alert severity="info">
                <AlertTitle>사용 방법</AlertTitle>
                텍스트나 URL을 입력하면 자동으로 QR 코드가 생성됩니다.
              </Alert>
            </Box>
          </Paper>
        </Box>

        {/* 오른쪽: 결과 표시 */}
        <Box sx={{ flex: '1 1 50%' }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              결과
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                backgroundColor: 'action.hover',
                borderRadius: 2,
                p: 3,
                mt: 2,
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!inputText.trim() && !error && (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <QrCode2Icon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                  <Typography variant="body1">
                    텍스트를 입력하면 QR 코드가 여기에 표시됩니다
                  </Typography>
                </Box>
              )}

              {qrCodeUrl && (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      maxWidth: '400px',
                      maxHeight: '400px',
                      margin: '0 auto',
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        width: 'auto',
                        height: 'auto',
                        display: 'block',
                        imageRendering: 'pixelated',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    원본 크기: {qrSize}x{qrSize} 픽셀
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    (프리뷰는 화면에 맞게 축소됩니다)
                  </Typography>
                </Box>
              )}

              {/* Canvas는 숨겨져 있지만 QR 코드 생성에 사용됨 */}
              {!qrCodeUrl && (
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              )}
            </Box>

            {qrCodeUrl && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={downloadQRCode}
                sx={{ mt: 3 }}
              >
                QR 코드 다운로드
              </Button>
            )}
          </Paper>
        </Box>
      </Box>

      {/* 추가 정보 */}
      <Box sx={{ mt: 4 }}>
        <Alert severity="success">
          <AlertTitle>QR 코드란?</AlertTitle>
          QR(Quick Response) 코드는 2차원 바코드로, 스마트폰 카메라로 스캔하여 텍스트, URL, 연락처 등의 정보를 빠르게 읽을 수 있습니다.
        </Alert>
      </Box>
    </Paper>
  );
}
