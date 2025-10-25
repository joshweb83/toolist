import React, { useState, useRef } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  Alert,
  AlertTitle
} from '@mui/material';

const ResolutionChecker = () => {
  // State variables
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [printWidth, setPrintWidth] = useState('');
  const [printHeight, setPrintHeight] = useState('');
  const [unit, setUnit] = useState('cm');
  const [printType, setPrintType] = useState('general'); // 'general' or 'large'
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const DPI_GENERAL = 300;
  const DPI_LARGE = 150;
  const INCH_TO_CM = 2.54;

  const PRESET_SIZES = {
    'A4': { width: 210, height: 297, unit: 'mm' },
    'A3': { width: 297, height: 420, unit: 'mm' },
    'B5': { width: 176, height: 250, unit: 'mm' },
    'B4': { width: 250, height: 353, unit: 'mm' },
    '명함': { width: 90, height: 50, unit: 'mm' },
    '여권사진': { width: 35, height: 45, unit: 'mm' },
    '증명사진': { width: 25, height: 30, unit: 'mm' },
    '반명함': { width: 30, height: 40, unit: 'mm' },
    '4x6 사진': { width: 4, height: 6, unit: 'inch' },
    '5x7 사진': { width: 5, height: 7, unit: 'inch' },
  };

  // Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = event.target.result;
        setImage({ name: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImageDimensions(null);
      setResult(null);
    }
  };

  const handlePresetChange = (e) => {
    const selected = PRESET_SIZES[e.target.value];
    if (selected) {
        let w = selected.width;
        let h = selected.height;
        let u = 'cm';

        if (selected.unit === 'mm') {
            w /= 10;
            h /= 10;
        } else if (selected.unit === 'inch') {
            u = 'inch';
        }
        
        setPrintWidth(w.toString());
        setPrintHeight(h.toString());
        setUnit(u);
    }
  };

  const convertToPx = (value, valueUnit, dpi) => {
    let valueInInches = parseFloat(value);
    if (isNaN(valueInInches)) return 0;

    if (valueUnit === 'cm') {
      valueInInches /= INCH_TO_CM;
    }
    return Math.round(valueInInches * dpi);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!printWidth || !printHeight) {
        alert("가로와 세로 길이를 모두 입력해주세요.");
        return;
    }
    const dpi = printType === 'general' ? DPI_GENERAL : DPI_LARGE;
    
    const requiredWidthPx = convertToPx(printWidth, unit, dpi);
    const requiredHeightPx = convertToPx(printHeight, unit, dpi);

    let resolutionResult = '';
    let resolutionSeverity = 'info';
    let aspectRatioWarning = '';

    if (imageDimensions) {
      // 1. Resolution Check
      const widthRatio = imageDimensions.width / requiredWidthPx;
      const heightRatio = imageDimensions.height / requiredHeightPx;

      if (widthRatio >= 1 && heightRatio >= 1) {
        resolutionResult = '매우 좋음: 화질 저하 없이 인쇄 가능합니다.';
        resolutionSeverity = 'success';
      } else if (widthRatio >= 0.75 && heightRatio >= 0.75) {
        resolutionResult = '보통: 약간의 화질 저하가 발생할 수 있습니다.';
        resolutionSeverity = 'warning';
      } else {
        resolutionResult = '나쁨: 화질이 크게 깨질 수 있습니다. 인쇄를 권장하지 않습니다.';
        resolutionSeverity = 'error';
      }

      // 2. Aspect Ratio Check
      const imageAspectRatio = imageDimensions.width / imageDimensions.height;
      const printAspectRatio = parseFloat(printWidth) / parseFloat(printHeight);
      if (Math.abs(imageAspectRatio - printAspectRatio) > 0.05) {
        aspectRatioWarning = '주의: 이미지와 인쇄물 비율이 다릅니다. 이미지가 잘리거나 여백이 생길 수 있습니다.';
      }
    }

    setResult({
      requiredPixels: `필요 픽셀: ${requiredWidthPx}px (가로) x ${requiredHeightPx}px (세로)`,
      resolutionResult,
      resolutionSeverity,
      aspectRatioWarning,
    });
  };

  const getMaxPrintSize = (dpi) => {
    if (!imageDimensions) return '이미지를 먼저 올려주세요.';
    const maxWidth = (imageDimensions.width / dpi).toFixed(1);
    const maxHeight = (imageDimensions.height / dpi).toFixed(1);
    return `${maxWidth} inch x ${maxHeight} inch (약 ${(maxWidth * INCH_TO_CM).toFixed(1)} cm x ${(maxHeight * INCH_TO_CM).toFixed(1)} cm)`;
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      <Head>
        <title>인쇄용 이미지 해상도 점검 툴</title>
        <meta name="description" content="인쇄물 사이즈에 맞는 이미지 해상도를 점검하고 필요한 픽셀을 계산합니다." />
      </Head>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          인쇄용 이미지 해상도 점검 툴
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Print Resolution Checker
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'stretch' }}>
        <Box sx={{ flex: '1 1 50%' }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <FormControl fullWidth>
                  <InputLabel id="print-type-label">1. 인쇄 종류 선택</InputLabel>
                  <Select
                      labelId="print-type-label"
                      label="1. 인쇄 종류 선택"
                      value={printType}
                      onChange={(e) => setPrintType(e.target.value)}
                  >
                      <MenuItem value="general">일반 인쇄물 (사진, 전단지 등) - 300DPI</MenuItem>
                      <MenuItem value="large">대형 인쇄물 (현수막, 배너 등) - 150DPI</MenuItem>
                  </Select>
              </FormControl>

              <FormControl fullWidth>
                  <InputLabel id="preset-label">2. 자주 쓰는 규격 (선택)</InputLabel>
                  <Select
                      labelId="preset-label"
                      label="2. 자주 쓰는 규격 (선택)"
                      onChange={handlePresetChange}
                      defaultValue=""
                  >
                      <MenuItem value="" disabled>-- 규격 선택 --</MenuItem>
                      {Object.keys(PRESET_SIZES).map(key => {
                      const preset = PRESET_SIZES[key];
                      const displayText = `${key} (${preset.width} x ${preset.height}${preset.unit})`;
                      return <MenuItem key={key} value={key}>{displayText}</MenuItem>;
                    })}
                  </Select>
              </FormControl>

              <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>3. 인쇄 사이즈 직접 입력</Typography>
                  <Grid container spacing={2}>
                      <Grid item xs={5}>
                          <TextField type="number" label="가로" value={printWidth} onChange={(e) => setPrintWidth(e.target.value)} fullWidth sx={{ 'input[type=number]': { colorScheme: (theme) => theme.palette.mode } }} />
                      </Grid>
                      <Grid item xs={5}>
                          <TextField type="number" label="세로" value={printHeight} onChange={(e) => setPrintHeight(e.target.value)} fullWidth sx={{ 'input[type=number]': { colorScheme: (theme) => theme.palette.mode } }} />
                      </Grid>
                      <Grid item xs={2}>
                          <FormControl fullWidth>
                              <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                  <MenuItem value="cm">cm</MenuItem>
                                  <MenuItem value="inch">inch</MenuItem>
                              </Select>
                          </FormControl>
                      </Grid>
                  </Grid>
              </Box>

              <Button variant="contained" component="label" fullWidth sx={{ backgroundColor: 'grey.600', '&:hover': { backgroundColor: 'grey.700' } }}>
                이미지 파일 올리기 (선택)
                <input type="file" hidden accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
              </Button>
              {image && <Typography variant="caption" align="center">{image.name}</Typography>}


              <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                결과 확인
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Right Column: Result */}
        <Box sx={{ flex: '1 1 50%' }}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" component="h2" gutterBottom>결과</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {imageDimensions && (
                        <Alert severity="info">
                            <AlertTitle>업로드된 이미지 정보</AlertTitle>
                            <Typography variant="body2">크기: {imageDimensions.width}px x {imageDimensions.height}px</Typography>
                            <Typography variant="body2" sx={{mt: 1}}><b>최대 인쇄 가능 사이즈:</b></Typography>
                            <Typography variant="caption">일반(300DPI): {getMaxPrintSize(DPI_GENERAL)}</Typography><br/>
                            <Typography variant="caption">대형(150DPI): {getMaxPrintSize(DPI_LARGE)}</Typography>
                        </Alert>
                    )}
                    {result ? (
                        <>
                            <Alert severity="success">
                                <AlertTitle>요구 해상도 ({printType === 'general' ? '300DPI' : '150DPI'} 기준)</AlertTitle>
                                {result.requiredPixels}
                            </Alert>
                            {result.resolutionResult && (
                                <Alert severity={result.resolutionSeverity}>
                                    <AlertTitle>화질 점검 결과</AlertTitle>
                                    {result.resolutionResult}
                                </Alert>
                            )}
                            {result.aspectRatioWarning && (
                                <Alert severity="warning">
                                    <AlertTitle>비율 확인 결과</AlertTitle>
                                    {result.aspectRatioWarning}
                                </Alert>
                            )}
                        </>
                    ) : (
                        <Typography color="text.secondary">이미지를 올리거나 인쇄 사이즈를 입력하고 &apos;결과 확인&apos;을 눌러주세요.</Typography>
                    )}
                </Box>
            </Paper>
        </Box>
      </Box>
    </Paper>
  );
};

export default ResolutionChecker;
