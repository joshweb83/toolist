import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  InputAdornment,
} from '@mui/material';

// Helper function to format numbers
const formatNumber = (num) => num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const FIXED_VAT_RATE = 10; // 한국 부가세율 10% 고정

function ExclusiveCalculator() {
  const [supplyValueInput, setSupplyValueInput] = useState('');

  const [vatAmount, setVatAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const numSupplyValue = parseFloat(supplyValueInput);
    if (isNaN(numSupplyValue) || numSupplyValue <= 0) {
      setVatAmount(0);
      setTotalAmount(0);
      return;
    }

    const rate = FIXED_VAT_RATE / 100;
    const calculatedVatAmount = numSupplyValue * rate;
    setVatAmount(calculatedVatAmount);
    setTotalAmount(numSupplyValue + calculatedVatAmount);
  }, [supplyValueInput]);

  const handleSupplyValueChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setSupplyValueInput(value);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        공급가액을 아는 경우
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <TextField
            label="공급가액 입력"
            variant="outlined"
            fullWidth
            value={supplyValueInput}
            onChange={handleSupplyValueChange}
            margin="normal"
            focused={true}
            InputProps={{
              startAdornment: <InputAdornment position="start">₩</InputAdornment>,
            }}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*\.?[0-9]*' }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="부가세율"
            variant="outlined"
            fullWidth
            value={`${FIXED_VAT_RATE}%`}
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <TextField
          label="공급가액"
          variant="outlined"
          fullWidth
          value={formatNumber(parseFloat(supplyValueInput || 0))}
          margin="normal"
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
          }}
        />
        <TextField
          label="부가세액"
          variant="outlined"
          fullWidth
          value={formatNumber(vatAmount)}
          margin="normal"
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
          }}
        />
        <TextField
          label="합계 금액"
          variant="outlined"
          fullWidth
          value={formatNumber(totalAmount)}
          margin="normal"
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
          }}
        />
      </Box>
    </Paper>
  );
}

function InclusiveCalculator() {
  const [totalAmountInput, setTotalAmountInput] = useState('');

  const [supplyValue, setSupplyValue] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);

  useEffect(() => {
    const numTotalAmount = parseFloat(totalAmountInput);
    if (isNaN(numTotalAmount) || numTotalAmount <= 0) {
      setSupplyValue(0);
      setVatAmount(0);
      return;
    }

    const rate = FIXED_VAT_RATE / 100;
    const calculatedSupplyValue = numTotalAmount / (1 + rate);
    setSupplyValue(calculatedSupplyValue);
    setVatAmount(numTotalAmount - calculatedSupplyValue);
  }, [totalAmountInput]);

  const handleTotalAmountChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setTotalAmountInput(value);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        합계 금액을 아는 경우
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <TextField
            label="합계 금액 입력"
            variant="outlined"
            fullWidth
            value={totalAmountInput}
            onChange={handleTotalAmountChange}
            margin="normal"
            focused={true}
            InputProps={{
              startAdornment: <InputAdornment position="start">₩</InputAdornment>,
            }}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*\.?[0-9]*' }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="부가세율"
            variant="outlined"
            fullWidth
            value={`${FIXED_VAT_RATE}%`}
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <TextField
          label="합계 금액"
          variant="outlined"
          fullWidth
          value={formatNumber(parseFloat(totalAmountInput || 0))}
          margin="normal"
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
          }}
        />
        <TextField
          label="공급가액"
          variant="outlined"
          fullWidth
          value={formatNumber(supplyValue)}
          margin="normal"
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
          }}
        />
        <TextField
          label="부가세액"
          variant="outlined"
          fullWidth
          value={formatNumber(vatAmount)}
          margin="normal"
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
          }}
        />
      </Box>
    </Paper>
  );
}

export default function VatCalculator() {
  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          VAT Calculator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          부가세 계산기
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mt: 2 }} justifyContent="center">
        <Grid item xs={6} md={6}>
          <ExclusiveCalculator />
        </Grid>
        <Grid item xs={6} md={6}>
          <InclusiveCalculator />
        </Grid>
      </Grid>
    </Paper>
  );
}