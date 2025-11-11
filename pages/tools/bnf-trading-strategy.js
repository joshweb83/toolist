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
  ListItemText,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { EMA, RSI, MACD } from 'technicalindicators';

// 샘플 주식 데이터 생성 (실제로는 API에서 가져와야 함)
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
  const [stockData, setStockData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

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

        // 기존 차트 제거
        if (chartRef.current) {
          chartRef.current.remove();
        }

        // 새 차트 생성
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

        // 캔들스틱 시리즈 추가
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

        // EMA(25) 라인 추가
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

        // 매수 신호 마커 추가
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

        // 반응형 처리
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

  const loadSampleData = () => {
    setLoading(true);

    // 샘플 데이터 생성
    const data = generateSampleData();
    setStockData(data);

    // 지표 계산
    calculateIndicators(data);

    setLoading(false);
  };

  const calculateIndicators = (data) => {
    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);

    // EMA(25) 계산
    const emaValues = EMA.calculate({
      period: 25,
      values: closes,
    });

    // 앞부분 null로 채우기
    const ema = new Array(closes.length - emaValues.length).fill(null).concat(emaValues);

    // RSI 계산
    const rsiValues = RSI.calculate({
      period: 14,
      values: closes,
    });

    const rsi = new Array(closes.length - rsiValues.length).fill(null).concat(rsiValues);

    // MACD 계산
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

    // 매수 신호 감지
    detectBuySignals(data, ema, rsi, macd);
  };

  const detectBuySignals = (data, ema, rsi, macd) => {
    const buySignals = [];

    for (let i = 25; i < data.length; i++) {
      // 조건 1: 가격 급락 확인 (최근 5일 내 10% 이상 하락)
      let priceDropped = false;
      if (i >= 5) {
        const fiveDaysAgo = data[i - 5].close;
        const current = data[i].close;
        const drop = ((fiveDaysAgo - current) / fiveDaysAgo) * 100;
        priceDropped = drop >= 10;
      }

      // 조건 2: EMA와 캔들 거리 20% 이상
      const emaValue = ema[i];
      const currentPrice = data[i].close;
      const distance = emaValue ? ((emaValue - currentPrice) / emaValue) * 100 : 0;
      const distanceCheck = distance >= 20;

      // 조건 3: RSI 과매도 영역 (< 30)
      const rsiValue = rsi[i];
      const rsiOversold = rsiValue && rsiValue < 30;

      // 조건 4: MACD 히스토그램 영선 위에서 녹색 전환
      const macdCurrent = macd[i];
      const macdPrev = macd[i - 1];
      let macdSignal = false;

      if (macdCurrent && macdPrev) {
        const currentHist = macdCurrent.MACD - macdCurrent.signal;
        const prevHist = macdPrev.MACD - macdPrev.signal;

        // 히스토그램이 음수에서 양수로 전환 (녹색 전환)
        macdSignal = prevHist < 0 && currentHist > 0;
      }

      // 4가지 조건 모두 충족 시 매수 신호
      if (priceDropped && distanceCheck && rsiOversold && macdSignal) {
        // 손절선: 직전 저점
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
          <Box>
            <Chip label="샘플 데이터" size="small" color="primary" sx={{ mr: 1 }} />
            <Chip
              label={`매수 신호: ${signals.length}개`}
              size="small"
              color={signals.length > 0 ? 'success' : 'default'}
            />
          </Box>
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
    </Paper>
  );
}
