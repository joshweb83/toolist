import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  AlertTitle,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  TextField,
  IconButton,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { EMA, RSI, MACD } from 'technicalindicators';
import axios from 'axios';

// Alpha Vantage API 설정
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// 인기 주식 목록
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
];

// 샘플 데이터 생성
const generateSampleData = () => {
  const data = [];
  let basePrice = 100;
  const days = 100;

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 5;
    basePrice += change;

    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;

    data.push({
      time: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }

  return data;
};

export default function BNFTradingStrategy() {
  const [apiKey, setApiKey] = useState('');
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [stockSymbol, setStockSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('demo'); // 'demo' or 'live'
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  // 로컬스토리지에서 API 키 불러오기
  useEffect(() => {
    const savedApiKey = localStorage.getItem('alphaVantageApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // 컴포넌트 마운트 시 샘플 데이터 로드
  useEffect(() => {
    loadSampleData();
  }, []);

  // lightweight-charts 라이브러리 로드 및 차트 생성
  useEffect(() => {
    if (stockData.length === 0 || !chartContainerRef.current) return;

    const loadChart = async () => {
      try {
        const LightweightCharts = await import('lightweight-charts');

        if (chartRef.current) {
          chartRef.current.remove();
        }

        const chart = LightweightCharts.createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 500,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
          crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
          },
          timeScale: {
            borderColor: '#ccc',
          },
        });

        chartRef.current = chart;

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        candlestickSeries.setData(stockData.map(d => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        })));

        if (indicators && indicators.ema) {
          const lineSeries = chart.addLineSeries({
            color: '#2196F3',
            lineWidth: 2,
            title: 'EMA(25)',
          });

          lineSeries.setData(indicators.ema.map((value, index) => ({
            time: stockData[index].time,
            value: value,
          })).filter(d => d.value !== null));
        }

        if (signals.length > 0) {
          const markers = signals.map(signal => ({
            time: signal.time,
            position: 'belowBar',
            color: '#2196F3',
            shape: 'arrowUp',
            text: `매수 @ ${signal.price.toFixed(2)}`,
          }));

          candlestickSeries.setMarkers(markers);
        }

        const handleResize = () => {
          if (chartContainerRef.current) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (chartRef.current) {
            chartRef.current.remove();
          }
        };
      } catch (err) {
        console.error('차트 로드 오류:', err);
      }
    };

    loadChart();
  }, [stockData, indicators, signals]);

  // API 키 저장
  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('alphaVantageApiKey', apiKey.trim());
      setShowApiDialog(false);
      setError('');
    } else {
      setError('API 키를 입력해주세요.');
    }
  };

  // 주식 검색
  const searchStock = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) {
      setSearchResults([]);
      return;
    }

    if (!apiKey) {
      setError('먼저 API 키를 설정해주세요.');
      setShowApiDialog(true);
      return;
    }

    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: searchTerm,
          apikey: apiKey,
        },
      });

      if (response.data.bestMatches) {
        const results = response.data.bestMatches.map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
        }));
        setSearchResults(results);
      }
    } catch (err) {
      console.error('검색 오류:', err);
      setError('주식 검색 중 오류가 발생했습니다.');
    }
  };

  // 실시간 주식 데이터 로드
  const loadRealStockData = async (symbol) => {
    if (!apiKey) {
      setError('먼저 API 키를 설정해주세요.');
      setShowApiDialog(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: 'full',
          apikey: apiKey,
        },
      });

      if (response.data['Error Message']) {
        throw new Error('유효하지 않은 주식 심볼입니다.');
      }

      if (response.data['Note']) {
        throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('데이터를 불러올 수 없습니다.');
      }

      const data = Object.entries(timeSeries)
        .slice(0, 100)
        .reverse()
        .map(([date, values]) => ({
          time: date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }));

      setStockData(data);
      calculateIndicators(data);
      setMode('live');
      setLoading(false);
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError(err.message || '주식 데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setLoading(true);
    const data = generateSampleData();
    setStockData(data);
    calculateIndicators(data);
    setMode('demo');
    setLoading(false);
  };

  const calculateIndicators = (data) => {
    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);

    const emaValues = EMA.calculate({
      period: 25,
      values: closes,
    });

    const ema = new Array(closes.length - emaValues.length).fill(null).concat(emaValues);

    const rsiValues = RSI.calculate({
      period: 14,
      values: closes,
    });

    const rsi = new Array(closes.length - rsiValues.length).fill(null).concat(rsiValues);

    const macdInput = {
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    };

    const macdValues = MACD.calculate(macdInput);
    const macd = new Array(closes.length - macdValues.length).fill(null).concat(macdValues);

    setIndicators({ ema, rsi, macd });
    detectBuySignals(data, ema, rsi, macd);
  };

  const detectBuySignals = (data, ema, rsi, macd) => {
    const buySignals = [];

    for (let i = 25; i < data.length; i++) {
      let priceDropped = false;
      if (i >= 5) {
        const fiveDaysAgo = data[i - 5].close;
        const current = data[i].close;
        const drop = ((fiveDaysAgo - current) / fiveDaysAgo) * 100;
        priceDropped = drop >= 10;
      }

      const emaValue = ema[i];
      const currentPrice = data[i].close;
      const distance = emaValue ? ((emaValue - currentPrice) / emaValue) * 100 : 0;
      const distanceCheck = distance >= 20;

      const rsiValue = rsi[i];
      const rsiOversold = rsiValue && rsiValue < 30;

      const macdCurrent = macd[i];
      const macdPrev = macd[i - 1];
      let macdSignal = false;

      if (macdCurrent && macdPrev) {
        const currentHist = macdCurrent.MACD - macdCurrent.signal;
        const prevHist = macdPrev.MACD - macdPrev.signal;
        macdSignal = prevHist < 0 && currentHist > 0;
      }

      if (priceDropped && distanceCheck && rsiOversold && macdSignal) {
        let stopLoss = data[i].low;
        for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
          if (data[j].low < stopLoss) {
            stopLoss = data[j].low;
          }
        }

        const stopLossDistance = currentPrice - stopLoss;
        const takeProfit = currentPrice + (stopLossDistance * 3);

        buySignals.push({
          time: data[i].time,
          price: currentPrice,
          ema: emaValue,
          rsi: rsiValue,
          macdHist: macdCurrent.MACD - macdCurrent.signal,
          stopLoss: stopLoss,
          takeProfit: takeProfit,
          riskRewardRatio: 3,
        });
      }
    }

    setSignals(buySignals);
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      {/* 타이틀 섹션 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <TrendingUpIcon fontSize="large" />
          BNF Trading Strategy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          전설의 트레이더 BNF 매매 전략 분석 도구
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          2천만 원을 4천억 원으로 만든 단 하나의 전략
        </Typography>
      </Box>

      {/* 주식 검색 및 설정 */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Autocomplete
              freeSolo
              options={mode === 'demo' ? POPULAR_STOCKS : searchResults}
              getOptionLabel={(option) => typeof option === 'string' ? option : `${option.symbol} - ${option.name}`}
              onInputChange={(event, value) => {
                setStockSymbol(value);
                if (mode === 'live' && value.length >= 1) {
                  searchStock(value);
                }
              }}
              onChange={(event, value) => {
                if (value && typeof value === 'object') {
                  setSelectedStock(value);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="주식 심볼 검색"
                  placeholder={mode === 'demo' ? "예: AAPL, TSLA" : "주식 심볼 입력"}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              if (mode === 'live' && selectedStock) {
                loadRealStockData(selectedStock.symbol);
              } else if (mode === 'live' && stockSymbol) {
                loadRealStockData(stockSymbol.toUpperCase());
              } else {
                loadSampleData();
              }
            }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            분석하기
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => setShowApiDialog(true)}
            startIcon={<SettingsIcon />}
          >
            API 설정
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={loadSampleData}
            startIcon={<RefreshIcon />}
          >
            데모 모드
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={mode === 'demo' ? '데모 모드' : '실시간 모드'}
            color={mode === 'demo' ? 'default' : 'success'}
            size="small"
          />
          {apiKey && mode === 'live' && (
            <Chip label="API 연결됨" color="success" size="small" />
          )}
          {selectedStock && mode === 'live' && (
            <Chip label={`${selectedStock.symbol} - ${selectedStock.name}`} size="small" variant="outlined" />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* 전략 설명 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle sx={{ fontWeight: 'bold' }}>BNF 핵심 전략</AlertTitle>
        <Typography variant="body2" component="div">
          <strong>사용 지표:</strong> EMA(25), RSI(14), MACD<br />
          <strong>매수 조건 (4가지 동시 충족):</strong>
          <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>가격 급락 구간 (5일 내 10% 이상 하락)</li>
            <li>이동평균선과 캔들 거리 20% 이상</li>
            <li>RSI 과매도 영역 (&lt; 30)</li>
            <li>MACD 히스토그램 영선 위로 녹색 전환</li>
          </ol>
          <strong>위험 관리:</strong> 손절선 = 직전 저점, 익절 = 손절선의 3배
        </Typography>
      </Alert>

      {/* 차트 영역 */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <ShowChartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            차트 분석
          </Typography>
          <Chip
            label={`매수 신호: ${signals.length}개`}
            size="small"
            color={signals.length > 0 ? 'success' : 'default'}
          />
        </Box>

        <Box
          ref={chartContainerRef}
          sx={{
            width: '100%',
            height: 500,
            bgcolor: '#fafafa',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        />

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    EMA(25)
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {indicators && indicators.ema[indicators.ema.length - 1]
                      ? indicators.ema[indicators.ema.length - 1].toFixed(2)
                      : '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    RSI(14)
                  </Typography>
                  <Typography variant="h6" color="secondary">
                    {indicators && indicators.rsi[indicators.rsi.length - 1]
                      ? indicators.rsi[indicators.rsi.length - 1].toFixed(2)
                      : '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    MACD 히스토그램
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {indicators && indicators.macd[indicators.macd.length - 1]
                      ? (indicators.macd[indicators.macd.length - 1].MACD - indicators.macd[indicators.macd.length - 1].signal).toFixed(2)
                      : '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* 매수 신호 목록 */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          매수 신호 목록 ({signals.length}개)
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {signals.length === 0 ? (
          <Alert severity="info">
            현재 매수 조건을 만족하는 신호가 없습니다.
          </Alert>
        ) : (
          <List>
            {signals.slice(-5).reverse().map((signal, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {signal.time}
                  </Typography>
                  <Chip label="매수" color="success" size="small" />
                </Box>

                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      진입가
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${signal.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      손절선
                    </Typography>
                    <Typography variant="body2" color="error">
                      ${signal.stopLoss.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      익절선
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      ${signal.takeProfit.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      손익비
                    </Typography>
                    <Typography variant="body2" color="primary">
                      1:{signal.riskRewardRatio}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, width: '100%' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    지표 상태: RSI {signal.rsi.toFixed(2)} | MACD Hist {signal.macdHist.toFixed(2)} | EMA {signal.ema.toFixed(2)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* 사용 안내 */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <AlertTitle>⚠️ 투자 유의사항</AlertTitle>
        <Typography variant="body2">
          이 도구는 교육 목적으로 제공됩니다. 실제 투자 시 반드시 충분한 분석과 본인의 판단하에 진행하시기 바랍니다.
          과거 수익률이 미래 수익을 보장하지 않으며, 모든 투자에는 손실 위험이 있습니다.
        </Typography>
      </Alert>

      {/* API 키 설정 다이얼로그 */}
      <Dialog open={showApiDialog} onClose={() => setShowApiDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Alpha Vantage API 키 설정</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              무료 API 키를 발급받으려면 <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Alpha Vantage</a>에 가입하세요.
            </Typography>
          </Alert>

          <TextField
            label="API Key"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="여기에 API 키를 입력하세요"
            helperText="API 키는 로컬 브라우저에만 저장됩니다"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApiDialog(false)}>취소</Button>
          <Button onClick={saveApiKey} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
