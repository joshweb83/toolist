import { Container, Typography, Box, Paper, TableContainer, Table, TableBody, TableRow, TableCell } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

const tools = [
  {
    name: 'Script-Timer',
    description: '대본 리딩 시간 측정 타이머',
    href: '/tools/script-timer',
  },
  {
    name: 'VAT Calculator',
    description: '부가가치세(VAT) 계산기',
    href: '/tools/vat-calculator',
  },
  {
    name: 'Print Resolution Checker',
    description: '인쇄용 이미지 해상도 점검툴',
    href: '/tools/resolution-checker',
  },
  {
    name: 'QR Code Generator',
    description: 'QR 코드 생성기',
    href: '/tools/qr-code-generator',
  },
  {
    name: 'Article Writer',
    description: 'AI 기사 작성기',
    href: '/tools/article-writer',
  },
  {
    name: 'Blog Writer',
    description: 'AI 블로그 작성기',
    href: '/tools/blog-writer',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" color="text.secondary" paragraph align="center">
          A collection of handy web utilities
        </Typography>
        <TableContainer component={Paper} elevation={3} sx={{ mt: 4 }}>
          <Table aria-label="tool list table">
            <TableBody>
              {tools.map((tool) => (
                <TableRow
                  key={tool.name}
                  hover
                  onClick={() => router.push(tool.href)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {tool.name}
                  </TableCell>
                  <TableCell>{tool.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}